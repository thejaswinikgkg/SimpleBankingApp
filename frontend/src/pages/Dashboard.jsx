import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import {
  QRCodeSVG
} from "qrcode.react";

import Brand from "../components/Brand";

const API_URL =
  "http://localhost:5000";


function Dashboard() {

  const navigate =
    useNavigate();

  const token =
    localStorage.getItem("token");


  const [account, setAccount] =
    useState(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [languageOpen, setLanguageOpen] =
    useState(false);

  const [appearanceOpen, setAppearanceOpen] =
    useState(false);


  const [language, setLanguage] =
    useState(
      localStorage.getItem(
        "language"
      ) || "en"
    );


  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem(
        "appearance"
      ) === "dark"
    );


  const [
    notificationsEnabled,
    setNotificationsEnabled
  ] = useState(
    localStorage.getItem(
      "notifications"
    ) === "true"
  );


  const [
    showBalance,
    setShowBalance
  ] = useState(false);


  const [
    secretKey,
    setSecretKey
  ] = useState("");


  const [
    balanceMessage,
    setBalanceMessage
  ] = useState("");


  const [
    loadingBalance,
    setLoadingBalance
  ] = useState(false);


  const knownTransactionIds =
    useRef(new Set());


  // ========================================
  // TRANSLATIONS
  // ========================================

  const text = {

    en: {
      welcome: "Welcome",
      customerId: "Customer ID",
      accountNumber: "Account Number",

      checkBalance: "Check Balance",
      balanceHidden:
        "Enter your secret key to view your balance.",
      secretKey: "Secret Key",
      verify:
        "Verify & View Balance",

      hideBalance:
        "Hide Balance",

      transactionHistory:
        "Transaction History",

      viewTransactions:
        "View your recent transactions.",

      transfer:
        "Transfer Money",

      security:
        "Security Settings",

      language:
        "Language",

      appearance:
        "Appearance",

      notifications:
        "Notifications",

      light:
        "Light",

      dark:
        "Dark",

      qrTitle:
        "Scan to transact",

      qrDescription:
        "Scan this QR code to transact with",

      logout:
        "Logout",

      verifying:
        "Verifying...",

      loading:
        "Loading...",

      invalidSecret:
        "Invalid secret key",

      balanceError:
        "Unable to fetch balance"
    },


    kn: {
      welcome: "ಸ್ವಾಗತ",
      customerId: "ಗ್ರಾಹಕ ID",
      accountNumber: "ಖಾತೆ ಸಂಖ್ಯೆ",

      checkBalance:
        "ಬ್ಯಾಲೆನ್ಸ್ ಪರಿಶೀಲಿಸಿ",

      balanceHidden:
        "ಬ್ಯಾಲೆನ್ಸ್ ನೋಡಲು ನಿಮ್ಮ ಸೀಕ್ರೆಟ್ ಕೀ ನಮೂದಿಸಿ.",

      secretKey:
        "ಸೀಕ್ರೆಟ್ ಕೀ",

      verify:
        "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಬ್ಯಾಲೆನ್ಸ್ ನೋಡಿ",

      hideBalance:
        "ಬ್ಯಾಲೆನ್ಸ್ ಮರೆಮಾಡಿ",

      transactionHistory:
        "ವಹಿವಾಟು ಇತಿಹಾಸ",

      viewTransactions:
        "ನಿಮ್ಮ ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳನ್ನು ನೋಡಿ.",

      transfer:
        "ಹಣ ವರ್ಗಾವಣೆ",

      security:
        "ಭದ್ರತಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",

      language:
        "ಭಾಷೆ",

      appearance:
        "ನೋಟ",

      notifications:
        "ಅಧಿಸೂಚನೆಗಳು",

      light:
        "ಲೈಟ್",

      dark:
        "ಡಾರ್ಕ್",

      qrTitle:
        "ವಹಿವಾಟು ಮಾಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",

      qrDescription:
        "ಈ QR ಕೋಡ್ ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",

      logout:
        "ಲಾಗ್ ಔಟ್",

      verifying:
        "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",

      loading:
        "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",

      invalidSecret:
        "ತಪ್ಪಾದ ಸೀಕ್ರೆಟ್ ಕೀ",

      balanceError:
        "ಬ್ಯಾಲೆನ್ಸ್ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ"
    },


    hi: {
      welcome:
        "स्वागत है",

      customerId:
        "ग्राहक ID",

      accountNumber:
        "खाता संख्या",

      checkBalance:
        "बैलेंस देखें",

      balanceHidden:
        "बैलेंस देखने के लिए अपनी सीक्रेट की दर्ज करें।",

      secretKey:
        "सीक्रेट की",

      verify:
        "सत्यापित करें और बैलेंस देखें",

      hideBalance:
        "बैलेंस छिपाएं",

      transactionHistory:
        "लेन-देन इतिहास",

      viewTransactions:
        "अपने हाल के लेन-देन देखें।",

      transfer:
        "पैसे ट्रांसफर करें",

      security:
        "सुरक्षा सेटिंग्स",

      language:
        "भाषा",

      appearance:
        "दिखावट",

      notifications:
        "सूचनाएं",

      light:
        "लाइट",

      dark:
        "डार्क",

      qrTitle:
        "लेन-देन के लिए स्कैन करें",

      qrDescription:
        "इस QR कोड को स्कैन करें",

      logout:
        "लॉग आउट",

      verifying:
        "सत्यापित किया जा रहा है...",

      loading:
        "लोड हो रहा है...",

      invalidSecret:
        "गलत सीक्रेट की",

      balanceError:
        "बैलेंस प्राप्त नहीं हो सका"
    }

  };


  const t =
    text[language];


  // ========================================
  // LOAD ACCOUNT
  // ========================================

  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    fetchAccount();

  }, []);


  // ========================================
  // APPEARANCE
  // ========================================

  useEffect(() => {

    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "appearance",
      darkMode
        ? "dark"
        : "light"
    );

  }, [darkMode]);


  // ========================================
  // LANGUAGE
  // ========================================

  useEffect(() => {

    localStorage.setItem(
      "language",
      language
    );

  }, [language]);


  // ========================================
  // NOTIFICATION STORAGE
  // ========================================

  useEffect(() => {

    localStorage.setItem(
      "notifications",
      notificationsEnabled
    );

  }, [notificationsEnabled]);


  // ========================================
  // FETCH ACCOUNT
  // ========================================

  async function fetchAccount() {

    try {

      const response =
        await axios.get(
          `${API_URL}/api/dashboard`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setAccount(
        response.data
      );

    } catch (error) {

      console.error(error);

      if (
        error.response &&
        (
          error.response.status ===
            401 ||
          error.response.status ===
            403
        )
      ) {

        localStorage.removeItem(
          "token"
        );

        navigate("/login");
      }
    }
  }


  // ========================================
  // CHECK BALANCE
  // ========================================

  async function handleCheckBalance() {

    if (!secretKey) {

      setBalanceMessage(
        "Please enter your secret key."
      );

      return;
    }


    try {

      setLoadingBalance(true);

      setBalanceMessage("");


      const response =
        await axios.post(
          `${API_URL}/api/balance`,
          {
            secretKey
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setAccount(
        previous => ({
          ...previous,

          balance:
            response.data.balance
        })
      );


      setShowBalance(true);

      setSecretKey("");


    } catch (error) {

      setShowBalance(false);

      setBalanceMessage(
        error.response?.data?.message ||
        t.balanceError
      );

    } finally {

      setLoadingBalance(false);
    }
  }


  // ========================================
  // NOTIFICATIONS
  // ========================================

  async function handleNotifications() {

    if (!notificationsEnabled) {

      if (
        !("Notification" in window)
      ) {

        alert(
          "Browser notifications are not supported."
        );

        return;
      }


      const permission =
        await Notification.requestPermission();


      if (
        permission !== "granted"
      ) {

        alert(
          "Notification permission was not granted."
        );

        return;
      }


      setNotificationsEnabled(
        true
      );

    } else {

      setNotificationsEnabled(
        false
      );
    }
  }


  // ========================================
  // CHECK NEW TRANSACTIONS
  // ========================================

  async function checkNewTransactions() {

    if (
      !notificationsEnabled
    ) {
      return;
    }


    try {

      const response =
        await axios.get(
          `${API_URL}/api/transactions`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const transactions =
        response.data;


      // First poll establishes
      // the current transaction IDs.
      if (
        knownTransactionIds
          .current.size === 0
      ) {

        transactions.forEach(
          transaction => {

            knownTransactionIds
              .current
              .add(
                transaction.id
              );

          }
        );

        return;
      }


      const newTransactions =
        transactions.filter(
          transaction =>
            !knownTransactionIds
              .current
              .has(
                transaction.id
              )
        );


      newTransactions.forEach(
        transaction => {

          if (
            "Notification" in
            window
          ) {

            new Notification(
              "AmisPay Transaction",
              {
                body:
                  `New transaction of ₹${Number(
                    transaction.amount
                  ).toFixed(2)}`
              }
            );
          }


          knownTransactionIds
            .current
            .add(
              transaction.id
            );
        }
      );

    } catch (error) {

      console.error(error);
    }
  }


  useEffect(() => {

    if (
      !notificationsEnabled
    ) {
      return;
    }


    checkNewTransactions();


    const interval =
      setInterval(
        checkNewTransactions,
        5000
      );


    return () =>
      clearInterval(
        interval
      );

  }, [
    notificationsEnabled
  ]);


  // ========================================
  // LOGOUT
  // ========================================

  function handleLogout() {

    localStorage.removeItem(
      "token"
    );

    navigate("/login");
  }


  // ========================================
  // LANGUAGE
  // ========================================

  function selectLanguage(
    value
  ) {

    setLanguage(value);

    setLanguageOpen(false);
  }


  // ========================================
  // APPEARANCE
  // ========================================

  function selectAppearance(
    value
  ) {

    setDarkMode(
      value === "dark"
    );

    setAppearanceOpen(false);
  }


  if (!account) {

    return (
      <div className="container">
        <p>{t.loading}</p>
      </div>
    );
  }


  return (

    <div className="dashboard-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="dashboard-header">

        <div className="dashboard-welcome">

          <Brand />

          <h2>
            {t.welcome},{" "}
            {account.name}
          </h2>

          <p>
            {t.customerId}:{" "}
            {account.customerId}
          </p>

        </div>


        {/* ========================================
            THREE DOT MENU
        ======================================== */}

        <div className="menu-container">

          <button
            className="menu-button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
          >
            ⋮
          </button>


          {menuOpen && (

            <div className="dropdown-menu">

              {/* LANGUAGE */}

              <button
                onClick={() =>
                  setLanguageOpen(
                    !languageOpen
                  )
                }
              >
                {t.language}
              </button>


              {languageOpen && (

                <div className="submenu">

                  <button
                    onClick={() =>
                      selectLanguage(
                        "en"
                      )
                    }
                  >
                    English
                  </button>

                  <button
                    onClick={() =>
                      selectLanguage(
                        "kn"
                      )
                    }
                  >
                    ಕನ್ನಡ
                  </button>

                  <button
                    onClick={() =>
                      selectLanguage(
                        "hi"
                      )
                    }
                  >
                    हिन्दी
                  </button>

                </div>
              )}


              {/* APPEARANCE */}

              <button
                onClick={() =>
                  setAppearanceOpen(
                    !appearanceOpen
                  )
                }
              >
                {t.appearance}
              </button>


              {appearanceOpen && (

                <div className="submenu">

                  <button
                    onClick={() =>
                      selectAppearance(
                        "light"
                      )
                    }
                  >
                    {t.light}
                  </button>

                  <button
                    onClick={() =>
                      selectAppearance(
                        "dark"
                      )
                    }
                  >
                    {t.dark}
                  </button>

                </div>
              )}


              {/* NOTIFICATIONS */}

              <button
                onClick={
                  handleNotifications
                }
              >
                {t.notifications}:{" "}
                {notificationsEnabled
                  ? "ON"
                  : "OFF"}
              </button>

            </div>
          )}

        </div>

      </div>


      {/* ========================================
          ACCOUNT INFORMATION
      ======================================== */}

      <div className="account-info">

        <p>
          {t.accountNumber}
        </p>

        <h3>
          {account.accountNumber}
        </h3>

      </div>


      {/* ========================================
          MAIN GREY SECTIONS
      ======================================== */}

      <div className="dashboard-sections">


        {/* CHECK BALANCE */}

        <section className="dashboard-section">

          <div className="section-icon">
            💰
          </div>

          <h3>
            {t.checkBalance}
          </h3>


          {!showBalance && (

            <>

              <p>
                {t.balanceHidden}
              </p>

              <input
                type="password"
                placeholder={
                  t.secretKey
                }
                value={
                  secretKey
                }
                onChange={
                  e =>
                    setSecretKey(
                      e.target.value
                    )
                }
              />


              <button
                onClick={
                  handleCheckBalance
                }
                disabled={
                  loadingBalance
                }
              >
                {
                  loadingBalance
                    ? t.verifying
                    : t.verify
                }
              </button>

            </>
          )}


          {showBalance && (

            <>

              <div className="check-balance-value">

                ₹
                {Number(
                  account.balance
                ).toFixed(2)}

              </div>


              <button
                onClick={() =>
                  setShowBalance(
                    false
                  )
                }
              >
                {t.hideBalance}
              </button>

            </>
          )}


          {balanceMessage && (

            <p className="error-message">
              {balanceMessage}
            </p>

          )}

        </section>


        {/* TRANSACTION HISTORY */}

        <section
          className="dashboard-section"
          onClick={() =>
            navigate(
              "/transactions"
            )
          }
        >

          <div className="section-icon">
            📄
          </div>

          <h3>
            {t.transactionHistory}
          </h3>

          <p>
            {t.viewTransactions}
          </p>

          <button>
            {t.transactionHistory}
          </button>

        </section>

      </div>


      {/* ========================================
          SECONDARY ACTIONS
      ======================================== */}

      <div className="dashboard-secondary-actions">

        <button
          onClick={() =>
            navigate(
              "/transfer"
            )
          }
        >
          {t.transfer}
        </button>


        <button
          onClick={() =>
            navigate(
              "/change-password"
            )
          }
        >
          {t.security}
        </button>

      </div>


      {/* ========================================
          QR SECTION
      ======================================== */}

      <div className="qr-section">

        <h2>
          {t.qrTitle}
        </h2>

        <p>

          {t.qrDescription}{" "}

          <strong>
            {account.name}'s
          </strong>{" "}

          AmisPay account.

        </p>


        <div className="qr-container">

          <QRCodeSVG
            value={
              `amispay://account/${account.accountNumber}`
            }
            size={220}
          />

        </div>


        <p className="qr-account">
          {account.accountNumber}
        </p>

      </div>


      {/* ========================================
          LOGOUT
      ======================================== */}

      <button
        className="logout-button"
        onClick={
          handleLogout
        }
      >
        {t.logout}
      </button>

    </div>
  );
}

export default Dashboard;