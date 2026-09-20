const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.get("/", (req, res) => {
  res.send("Demo Bank Backend is running");
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.json({
      message: "Database connected successfully",
      result: rows[0].result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});


app.post("/api/create-account", async (req, res) => {
  const { name, mobile, balance } = req.body;

  try {
    if (!name || !mobile || balance === undefined) {
      return res.status(400).json({
        message: "Name, mobile number and balance are required",
      });
    }

    const [customerRows] = await db.query(
  "SELECT COUNT(*) AS count FROM demo_customers"
);

const nextNumber = customerRows[0].count + 1;

const customerId = `CUST${String(nextNumber).padStart(4, "0")}`;
const accountNumber = `DEMO${String(nextNumber).padStart(5, "0")}`;

    await db.query(
      `INSERT INTO demo_customers (customer_id, name, mobile)
       VALUES (?, ?, ?)`,
      [customerId, name.trim(), mobile.trim()]
    );

    const [accountResult] = await db.query(
      `INSERT INTO accounts (customer_id, account_number, balance)
       VALUES (?, ?, ?)`,
      [customerId, accountNumber, balance]
    );

    res.status(201).json({
      message: "Demo account created successfully",
      customerId,
      accountNumber,
      balance,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create demo account",
    });
  }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Demo Bank backend running on port ${PORT}`);
});
