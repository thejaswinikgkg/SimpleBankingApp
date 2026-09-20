import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import axios from "axios";

import Brand from "../components/Brand";

const API_URL =
  "http://localhost:5000";


function Register() {

  const navigate =
    useNavigate();


  const [
    customerId,
    setCustomerId
  ] = useState("");


  const [
    mobile,
    setMobile
  ] = useState("");


  const [
    otp,
    setOtp
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");


  const [
    secretKey,
    setSecretKey
  ] = useState("");


  const [
    confirmSecretKey,
    setConfirmSecretKey
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
    loading,
    setLoading
  ] = useState(false);


  // ========================================
  // VERIFY CUSTOMER
  // ========================================

  async function verifyCustomer() {

    setMessage("");


    if (
      !customerId ||
      !mobile
    ) {

      setMessage(
        "Please enter Customer ID and mobile number."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/register/verify`,
          {
            customerId,
            mobile
          }
        );


      setMessage(
        response.data.message
      );

      setOtpSent(true);


    } catch (error) {

      setMessage(
        error.response?.data
          ?.message ||
        "Customer verification failed"
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================
  // VERIFY OTP
  // ========================================

  async function verifyOtp() {

    setMessage("");


    if (!otp) {

      setMessage(
        "Please enter the OTP."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/register/verify-otp`,
          {
            customerId,
            otp
          }
        );


      setMessage(
        response.data.message
      );

      setOtpVerified(true);


    } catch (error) {

      setMessage(
        error.response?.data
          ?.message ||
        "OTP verification failed"
      );

    } finally {

      setLoading(false);
    }
  }


  // ========================================
  // COMPLETE REGISTRATION
  // ========================================

  async function completeRegistration() {

    setMessage("");


    if (
      !password ||
      !confirmPassword ||
      !secretKey ||
      !confirmSecretKey
    ) {

      setMessage(
        "Please complete all fields."
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }


    if (
      secretKey !==
      confirmSecretKey
    ) {

      setMessage(
        "Secret keys do not match."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/register/set-password`,
          {
            customerId,
            password,
            secretKey
          }
        );


      setMessage(
        response.data.message
      );


      setTimeout(
        () =>
          navigate("/login"),
        1500
      );


    } catch (error) {

      setMessage(
        error.response?.data
          ?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div className="container">

      <Brand />

      <h1>
        Register
      </h1>


      {!otpSent && (

        <>

          <input
            type="text"
            placeholder="Customer ID"
            value={
              customerId
            }
            onChange={
              e =>
                setCustomerId(
                  e.target.value
                )
            }
          />


          <input
            type="text"
            placeholder="Mobile Number"
            value={
              mobile
            }
            onChange={
              e =>
                setMobile(
                  e.target.value
                )
            }
          />


          <button
            onClick={
              verifyCustomer
            }
            disabled={
              loading
            }
          >

            {
              loading
                ? "Verifying..."
                : "Verify Customer"
            }

          </button>

        </>
      )}


      {otpSent &&
        !otpVerified && (

          <>

            <p>
              OTP sent to the registered
              mobile number.
            </p>


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


      {otpVerified && (

        <>

          <h2>
            Create Login Details
          </h2>


          <input
            type="password"
            placeholder="Create Password"
            value={
              password
            }
            onChange={
              e =>
                setPassword(
                  e.target.value
                )
            }
          />


          <input
            type="password"
            placeholder="Confirm Password"
            value={
              confirmPassword
            }
            onChange={
              e =>
                setConfirmPassword(
                  e.target.value
                )
            }
          />


          <input
            type="password"
            placeholder="Create Secret Key"
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


          <input
            type="password"
            placeholder="Confirm Secret Key"
            value={
              confirmSecretKey
            }
            onChange={
              e =>
                setConfirmSecretKey(
                  e.target.value
                )
            }
          />


          <button
            onClick={
              completeRegistration
            }
            disabled={
              loading
            }
          >

            {
              loading
                ? "Creating..."
                : "Complete Registration"
            }

          </button>

        </>
      )}


      {message && (

        <p className="message">
          {message}
        </p>

      )}


      <p>

        Already registered?{" "}

        <Link to="/login">
          Login
        </Link>

      </p>

    </div>
  );
}

export default Register;