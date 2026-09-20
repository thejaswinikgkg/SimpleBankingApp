import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import Brand from "../components/Brand";

const API_URL =
  "http://localhost:5000";


function ChangePassword() {

  const navigate =
    useNavigate();

  const token =
    localStorage.getItem("token");


  const [
    selectedOption,
    setSelectedOption
  ] = useState("");


  const [
    newValue,
    setNewValue
  ] = useState("");


  const [
    confirmValue,
    setConfirmValue
  ] = useState("");


  const [
    otp,
    setOtp
  ] = useState("");


  const [
    otpSent,
    setOtpSent
  ] = useState(false);


  const [
    otpVerified,
    setOtpVerified
  ] = useState(false);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  // ========================================
  // SELECT PASSWORD / SECRET KEY
  // ========================================

  function selectOption(
    option
  ) {

    setSelectedOption(
      option
    );

    setNewValue("");

    setConfirmValue("");

    setOtp("");

    setOtpSent(false);

    setOtpVerified(false);

    setMessage("");

    setError("");
  }


  // ========================================
  // SEND OTP
  // ========================================

  async function sendOtp() {

    setError("");

    setMessage("");


    if (!selectedOption) {

      setError(
        "Please select Password or Secret Key."
      );

      return;
    }


    if (
      !newValue ||
      !confirmValue
    ) {

      setError(
        selectedOption ===
          "password"

          ? "Please enter and confirm your new password."

          : "Please enter and confirm your new secret key."
      );

      return;
    }


    if (
      newValue !==
      confirmValue
    ) {

      setError(
        selectedOption ===
          "password"

          ? "Passwords do not match."

          : "Secret keys do not match."
      );

      return;
    }


    if (
      newValue.length < 6
    ) {

      setError(
        selectedOption ===
          "password"

          ? "Password must be at least 6 characters."

          : "Secret key must be at least 6 characters."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/change-security/send-otp`,
          {
            type:
              selectedOption
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setOtpSent(true);

      setMessage(
        response.data.message
      );

    } catch (error) {

      setError(
        error.response?.data
          ?.message ||
        "Failed to send OTP"
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================
  // VERIFY OTP
  // ========================================

  async function verifyOtp() {

    setError("");

    setMessage("");


    if (!otp) {

      setError(
        "Please enter the OTP."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/change-security/verify-otp`,
          {
            otp
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setOtpVerified(true);

      setMessage(
        response.data.message
      );

    } catch (error) {

      setError(
        error.response?.data
          ?.message ||
        "Invalid OTP"
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================
  // UPDATE PASSWORD / SECRET KEY
  // ========================================

  async function updateSecurityValue() {

    setError("");

    setMessage("");


    if (!otpVerified) {

      setError(
        "Please verify the OTP first."
      );

      return;
    }


    try {

      setLoading(true);
      console.log(
  "CALLING SECURITY SET:",
  selectedOption
);

      const response =
        await axios.post(
          `${API_URL}/api/change-security/set`,
          {
            type:
              selectedOption,

            newValue
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setMessage(
        response.data.message
      );


      setNewValue("");

      setConfirmValue("");

      setOtp("");

      setOtpSent(false);

      setOtpVerified(false);


    } catch (error) {

      setError(
        error.response?.data
          ?.message ||
        "Failed to update security setting"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div className="container">

      <Brand />

      <h1>
        Security Settings
      </h1>


      {/* ========================================
          OPTION SELECTION
      ======================================== */}

      {!selectedOption && (

        <>

          <p>
            Select what you want to change.
          </p>


          <button
            onClick={() =>
              selectOption(
                "password"
              )
            }
          >
            Change Password
          </button>


          <button
            onClick={() =>
              selectOption(
                "secretKey"
              )
            }
          >
            Change Secret Key
          </button>

        </>
      )}


      {/* ========================================
          CHANGE FORM
      ======================================== */}

      {selectedOption && (

        <>

          <h2>

            {
              selectedOption ===
              "password"

                ? "Change Password"

                : "Change Secret Key"
            }

          </h2>


          <input
            type="password"
            placeholder={
              selectedOption ===
              "password"

                ? "Enter New Password"

                : "Enter New Secret Key"
            }
            value={
              newValue
            }
            onChange={
              e =>
                setNewValue(
                  e.target.value
                )
            }
          />


          <input
            type="password"
            placeholder={
              selectedOption ===
              "password"

                ? "Confirm New Password"

                : "Confirm New Secret Key"
            }
            value={
              confirmValue
            }
            onChange={
              e =>
                setConfirmValue(
                  e.target.value
                )
            }
          />


          {/* SEND OTP */}

          {!otpSent && (

            <button
              onClick={
                sendOtp
              }
              disabled={
                loading
              }
            >

              {
                loading
                  ? "Sending..."
                  : "Verify OTP"
              }

            </button>

          )}


          {/* OTP INPUT */}

          {otpSent &&
            !otpVerified && (

              <>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={
                    e =>
                      setOtp(
                        e.target.value
                      )
                  }
                />


                <button
                  onClick={
                    verifyOtp
                  }
                  disabled={
                    loading
                  }
                >

                  {
                    loading
                      ? "Verifying..."
                      : "Verify OTP"
                  }

                </button>

              </>
            )}


          {/* FINAL CHANGE */}

          {otpVerified && (

            <button
              onClick={
                updateSecurityValue
              }
              disabled={
                loading
              }
            >

              {
                loading

                  ? "Updating..."

                  : selectedOption ===
                    "password"

                    ? "Change Password"

                    : "Change Secret Key"
              }

            </button>
          )}


          {/* BACK TO OPTIONS */}

          <button
            className="secondary-button"
            onClick={() =>
              selectOption("")
            }
          >
            Back
          </button>

        </>
      )}


      {/* ========================================
          MESSAGES
      ======================================== */}

      {message && (

        <p className="success-message">
          {message}
        </p>

      )}


      {error && (

        <p className="error-message">
          {error}
        </p>

      )}


      {/* ========================================
          DASHBOARD
      ======================================== */}

      <button
        className="secondary-button"
        onClick={() =>
          navigate(
            "/dashboard"
          )
        }
      >
        Back to Dashboard
      </button>

    </div>
  );
}

export default ChangePassword;