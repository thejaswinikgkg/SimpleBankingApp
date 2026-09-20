const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

const otpStore = new Map();
const verifiedCustomers = new Set();


// ========================================
// JWT Authentication Middleware
// ========================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token"
    });
  }
}


// ========================================
// Middleware
// ========================================

app.use(cors());
app.use(express.json());


// ========================================
// Test Backend
// ========================================

app.get("/", (req, res) => {
  res.send("Banking Backend is running");
});


// ========================================
// Test Database Connection
// ========================================

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name, @@port AS port"
    );

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});


// ==================================================
// REGISTER - VERIFY EXISTING CUSTOMER + SEND OTP
// ==================================================

app.post("/api/register/verify", async (req, res) => {
  try {
    console.log("Received:", req.body);

    const {
      customerId,
      mobile
    } = req.body;

    const [rows] = await db.query(
      `SELECT customer_id, name
       FROM demo_customers
       WHERE customer_id = ? AND mobile = ?`,
      [
        customerId,
        mobile
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Customer details not found"
      });
    }

    const [existingUser] = await db.query(
      `SELECT user_id
       FROM application_users
       WHERE customer_id = ?`,
      [customerId]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Account already registered"
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    );

    otpStore.set(
      `register_${customerId}`,
      otp
    );

    await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/${otp}/BANKING_OTP`
    );

    console.log(
      `Registration OTP sent to ${mobile}`
    );

    res.json({
      message: "OTP sent successfully",
      customerId: rows[0].customer_id,
      name: rows[0].name
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send OTP"
    });
  }
});


// ==================================================
// REGISTER - VERIFY OTP
// ==================================================

app.post(
  "/api/register/verify-otp",
  async (req, res) => {
    try {
      const {
        customerId,
        otp
      } = req.body;

      const storedOtp =
        otpStore.get(
          `register_${customerId}`
        );

      if (!storedOtp) {
        return res.status(400).json({
          message: "OTP expired or not found"
        });
      }

      if (
        Number(otp) !== storedOtp
      ) {
        return res.status(400).json({
          message: "Invalid OTP"
        });
      }

      otpStore.delete(
        `register_${customerId}`
      );

      verifiedCustomers.add(
        `register_${customerId}`
      );

      res.json({
        message: "OTP verified successfully",
        customerId
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// ==================================================
// REGISTER - SET PASSWORD + SECRET KEY
// ==================================================

app.post(
  "/api/register/set-password",
  async (req, res) => {
    try {
      const {
        customerId,
        password,
        secretKey
      } = req.body;

      const verificationKey =
        `register_${customerId}`;

      if (
        !verifiedCustomers.has(
          verificationKey
        )
      ) {
        return res.status(403).json({
          message: "Please verify OTP first"
        });
      }

      if (
        !password ||
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters"
        });
      }

      if (
        !secretKey ||
        secretKey.length < 6
      ) {
        return res.status(400).json({
          message:
            "Secret key must be at least 6 characters"
        });
      }

      const [existingUser] =
        await db.query(
          `SELECT user_id
           FROM application_users
           WHERE customer_id = ?`,
          [customerId]
        );

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: "Account already registered"
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      const secretKeyHash =
        await bcrypt.hash(
          secretKey,
          10
        );

      await db.query(
        `INSERT INTO application_users
         (
           customer_id,
           password_hash,
           secret_key_hash
         )
         VALUES (?, ?, ?)`,
        [
          customerId,
          passwordHash,
          secretKeyHash
        ]
      );

      verifiedCustomers.delete(
        verificationKey
      );

      res.json({
        message:
          "Registration completed successfully"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to create account"
      });
    }
  }
);


// ==================================================
// LOGIN
// ==================================================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        customerId,
        password
      } = req.body;

      const [rows] =
        await db.query(
          `SELECT
             user_id,
             customer_id,
             password_hash
           FROM application_users
           WHERE customer_id = ?`,
          [customerId]
        );

      if (rows.length === 0) {
        return res.status(401).json({
          message:
            "Invalid Customer ID or password"
        });
      }

      const user = rows[0];

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password_hash
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid Customer ID or password"
        });
      }

      const token = jwt.sign(
        {
          userId: user.user_id,
          customerId:
            user.customer_id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h"
        }
      );

      res.json({
        message: "Login successful",
        token
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Login failed"
      });
    }
  }
);


// ==================================================
// DASHBOARD
// ==================================================

app.get(
  "/api/dashboard",
  authenticateToken,
  async (req, res) => {
    console.log("JWT USER:", req.user);
    try {
      const customerId =
        req.user.customerId;

      const [rows] =
        await db.query(
          `SELECT
             dc.customer_id,
             dc.name,
             a.account_number
           FROM demo_customers dc
           JOIN accounts a
             ON dc.customer_id = a.customer_id
           WHERE dc.customer_id = ?`,
          [customerId]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Account details not found"
        });
      }

      // Balance is deliberately not returned here.
      // It requires secret-key verification.

      res.json({
        customerId:
          rows[0].customer_id,

        name:
          rows[0].name,

        accountNumber:
          rows[0].account_number
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to load dashboard"
      });
    }
  }
);


// ==================================================
// CHECK BALANCE
// ==================================================

app.post(
  "/api/balance",
  authenticateToken,
  async (req, res) => {
    try {
      const customerId =
        req.user.customerId;

      const {
        secretKey
      } = req.body;

      if (!secretKey) {
        return res.status(400).json({
          message:
            "Secret key is required"
        });
      }

      const [userRows] =
        await db.query(
          `SELECT secret_key_hash
           FROM application_users
           WHERE customer_id = ?`,
          [customerId]
        );

      if (userRows.length === 0) {
        return res.status(404).json({
          message:
            "User account not found"
        });
      }

      const secretKeyMatch =
        await bcrypt.compare(
          secretKey,
          userRows[0].secret_key_hash
        );

      if (!secretKeyMatch) {
        return res.status(401).json({
          message:
            "Invalid secret key"
        });
      }

      const [accountRows] =
        await db.query(
          `SELECT balance
           FROM accounts
           WHERE customer_id = ?`,
          [customerId]
        );

      if (accountRows.length === 0) {
        return res.status(404).json({
          message:
            "Account not found"
        });
      }

      res.json({
        message:
          "Balance verified successfully",

        balance:
          accountRows[0].balance
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch balance"
      });
    }
  }
);


// ==================================================
// TRANSFER MONEY
// ==================================================

app.post(
  "/api/transfer",
  authenticateToken,
  async (req, res) => {

    const connection =
      await db.getConnection();

    try {
      const {
        receiverAccountNumber,
        amount,
        secretKey
      } = req.body;

      const transferAmount =
        Number(amount);

      if (
        !receiverAccountNumber ||
        !transferAmount ||
        !secretKey
      ) {
        return res.status(400).json({
          message:
            "Receiver account, amount and secret key are required"
        });
      }

      if (
        transferAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Amount must be greater than zero"
        });
      }

      if (
        secretKey.length < 6
      ) {
        return res.status(400).json({
          message:
            "Invalid secret key"
        });
      }

      const senderCustomerId =
        req.user.customerId;


      // ----------------------------------------------
      // Verify Secret Key
      // ----------------------------------------------

      const [userRows] =
        await db.query(
          `SELECT secret_key_hash
           FROM application_users
           WHERE customer_id = ?`,
          [senderCustomerId]
        );

      if (userRows.length === 0) {
        return res.status(404).json({
          message:
            "User account not found"
        });
      }

      const secretKeyMatch =
        await bcrypt.compare(
          secretKey,
          userRows[0].secret_key_hash
        );

      if (!secretKeyMatch) {
        return res.status(401).json({
          message:
            "Invalid secret key"
        });
      }


      // ----------------------------------------------
      // Start database transaction
      // ----------------------------------------------

      await connection.beginTransaction();


      // ----------------------------------------------
      // Get sender account
      // ----------------------------------------------

      const [senderRows] =
        await connection.query(
          `SELECT
             account_id,
             account_number,
             balance
           FROM accounts
           WHERE customer_id = ?
           FOR UPDATE`,
          [senderCustomerId]
        );

      if (senderRows.length === 0) {

        await connection.rollback();

        return res.status(404).json({
          message:
            "Sender account not found"
        });
      }

      const sender =
        senderRows[0];


      // ----------------------------------------------
      // Prevent own account transfer
      // ----------------------------------------------

      if (
        sender.account_number ===
        receiverAccountNumber
      ) {

        await connection.rollback();

        return res.status(400).json({
          message:
            "Cannot transfer to your own account"
        });
      }


      // ----------------------------------------------
      // Check balance
      // ----------------------------------------------

      if (
        Number(sender.balance) <
        transferAmount
      ) {

        await connection.rollback();

        return res.status(400).json({
          message:
            "Insufficient balance"
        });
      }


      // ----------------------------------------------
      // Get receiver account
      // ----------------------------------------------

      const [receiverRows] =
        await connection.query(
          `SELECT
             account_id,
             account_number
           FROM accounts
           WHERE account_number = ?
           FOR UPDATE`,
          [receiverAccountNumber]
        );

      if (
        receiverRows.length === 0
      ) {

        await connection.rollback();

        return res.status(404).json({
          message:
            "Receiver account not found"
        });
      }

      const receiver =
        receiverRows[0];


      // ----------------------------------------------
      // Deduct from sender
      // ----------------------------------------------

      await connection.query(
        `UPDATE accounts
         SET balance = balance - ?
         WHERE account_id = ?`,
        [
          transferAmount,
          sender.account_id
        ]
      );


      // ----------------------------------------------
      // Add to receiver
      // ----------------------------------------------

      await connection.query(
        `UPDATE accounts
         SET balance = balance + ?
         WHERE account_id = ?`,
        [
          transferAmount,
          receiver.account_id
        ]
      );


      // ----------------------------------------------
      // Record transaction
      // ----------------------------------------------

      await connection.query(
        `INSERT INTO transactions
         (
           sender_account_id,
           receiver_account_id,
           amount,
           transaction_type
         )
         VALUES (?, ?, ?, ?)`,
        [
          sender.account_id,
          receiver.account_id,
          transferAmount,
          "TRANSFER"
        ]
      );


      // ----------------------------------------------
      // Commit
      // ----------------------------------------------

      await connection.commit();


      res.json({
        message:
          "Transfer successful",

        amount:
          transferAmount,

        receiverAccountNumber
      });

    } catch (error) {

      await connection.rollback();

      console.error(error);

      res.status(500).json({
        message:
          "Transfer failed"
      });

    } finally {

      connection.release();
    }
  }
);


// ==================================================
// TRANSACTION HISTORY
// ==================================================

app.get(
  "/api/transactions",
  authenticateToken,
  async (req, res) => {

    try {

      const customerId =
        req.user.customerId;

      const [rows] =
        await db.query(
          `SELECT
             t.id,
             t.amount,
             t.transaction_type,
             t.created_at,
             sender.account_number
               AS sender_account,
             receiver.account_number
               AS receiver_account
           FROM transactions t
           JOIN accounts sender
             ON t.sender_account_id =
                sender.account_id
           JOIN accounts receiver
             ON t.receiver_account_id =
                receiver.account_id
           WHERE sender.customer_id = ?
              OR receiver.customer_id = ?
           ORDER BY
             t.created_at DESC`,
          [
            customerId,
            customerId
          ]
        );

      res.json(rows);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to load transactions"
      });
    }
  }
);


// ==================================================
// SECURITY SETTINGS - SEND OTP
// ==================================================

app.post(
  "/api/change-security/send-otp",
  authenticateToken,
  async (req, res) => {

    try {

      const customerId =
        req.user.customerId;

      const {
        type
      } = req.body;

      if (
        type !== "password" &&
        type !== "secretKey"
      ) {
        return res.status(400).json({
          message:
            "Invalid security option"
        });
      }

      const [rows] =
        await db.query(
          `SELECT mobile
           FROM demo_customers
           WHERE customer_id = ?`,
          [customerId]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Customer not found"
        });
      }

      const mobile =
        rows[0].mobile;

      const otp =
        Math.floor(
          100000 +
          Math.random() * 900000
        );

      otpStore.set(
        `security_${customerId}`,
        {
          otp,
          type
        }
      );

      await axios.get(
        `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${mobile}/${otp}/BANKING_OTP`
      );

      console.log(
        `${type} change OTP sent to ${mobile}`
      );

      res.json({
        message:
          "OTP sent successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to send OTP"
      });
    }
  }
);


// ==================================================
// SECURITY SETTINGS - VERIFY OTP
// ==================================================

app.post(
  "/api/change-security/verify-otp",
  authenticateToken,
  async (req, res) => {

    try {

      const customerId =
        req.user.customerId;

      const {
        otp
      } = req.body;

      const verificationKey =
        `security_${customerId}`;

      const storedData =
        otpStore.get(
          verificationKey
        );

      if (!storedData) {
        return res.status(400).json({
          message:
            "OTP expired or not found"
        });
      }

      if (
        Number(otp) !==
        storedData.otp
      ) {
        return res.status(400).json({
          message:
            "Invalid OTP"
        });
      }

      otpStore.delete(
        verificationKey
      );

      verifiedCustomers.add(
        verificationKey
      );

      res.json({
        message:
          "OTP verified successfully",

        type:
          storedData.type
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Server error"
      });
    }
  }
);


// ==================================================
// SECURITY SETTINGS - SET NEW PASSWORD / SECRET KEY
// ==================================================

app.post(
  "/api/change-security/set",
  authenticateToken,
  async (req, res) => {

    try {

      const customerId =
        req.user.customerId;

      const {
        type,
        newValue
      } = req.body;

      // Temporary debugging log
      console.log(
        "SET SECURITY:",
        customerId,
        type
      );

      const verificationKey =
        `security_${customerId}`;

      if (
        type !== "password" &&
        type !== "secretKey"
      ) {
        return res.status(400).json({
          message:
            "Invalid security option"
        });
      }

      if (
        !verifiedCustomers.has(
          verificationKey
        )
      ) {
        return res.status(403).json({
          message:
            "Please verify OTP first"
        });
      }

      if (
        !newValue ||
        newValue.length < 6
      ) {
        return res.status(400).json({
          message:
            type === "password"
              ? "Password must be at least 6 characters"
              : "Secret key must be at least 6 characters"
        });
      }

      const hash =
        await bcrypt.hash(
          newValue,
          10
        );

      let query;

      if (
        type === "password"
      ) {

        query = `
          UPDATE application_users
          SET password_hash = ?
          WHERE customer_id = ?
        `;

      } else {

        query = `
          UPDATE application_users
          SET secret_key_hash = ?
          WHERE customer_id = ?
        `;
      }
      const [checkRows] = await db.query(
  `SELECT user_id, customer_id
   FROM application_users
   WHERE customer_id = ?`,
  [customerId]
);

console.log(
  "BEFORE SECURITY UPDATE:",
  checkRows
);
      const [result] =
        await db.query(
          query,
          [
            hash,
            customerId
          ]
        );

      console.log(
        "SECURITY UPDATE AFFECTED ROWS:",
        result.affectedRows
      );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          message:
            "User account not found"
        });
      }

      verifiedCustomers.delete(
        verificationKey
      );

      res.json({
        message:
          type === "password"
            ? "Password changed successfully"
            : "Secret key changed successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Failed to update security setting"
      });
    }
  }
);


// ==================================================
// START SERVER
// ==================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);