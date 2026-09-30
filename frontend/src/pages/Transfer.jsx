import {
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import Brand from "../components/Brand";


const API_URL =
  "https://amis-pay-backend.onrender.com";


function Transfer() {

  const navigate =
    useNavigate();


  const token =
    localStorage.getItem("token");


  const [
    receiverIdentifier,
    setReceiverIdentifier
  ] = useState("");


  const [
    amount,
    setAmount
  ] = useState("");


  const [
    secretKey,
    setSecretKey
  ] = useState("");


  const [
    message,
    setMessage
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  async function handleTransfer(
    e
  ) {

    e.preventDefault();

    setMessage("");


    if (
      !receiverIdentifier ||
      !amount ||
      !secretKey
    ) {

      setMessage(
        "Please enter receiver account/mobile, amount and secret key."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/transfer`,
          {
            receiverIdentifier,
            amount,
            secretKey
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


      setReceiverIdentifier("");

      setAmount("");

      setSecretKey("");


    } catch (error) {

      setMessage(
        error.response?.data
          ?.message ||
        "Transfer failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div className="container">

      <Brand />

      <h1>
        Transfer Money
      </h1>


      <form
        onSubmit={
          handleTransfer
        }
      >

        <input
          type="text"
          placeholder="Receiver Account Number or Mobile Number"
          value={
            receiverIdentifier
          }
          onChange={
            e =>
              setReceiverIdentifier(
                e.target.value
              )
          }
        />


        <input
          type="number"
          placeholder="Amount"
          min="1"
          value={amount}
          onChange={
            e =>
              setAmount(
                e.target.value
              )
          }
        />


        <input
          type="password"
          placeholder="Secret Key"
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
          type="submit"
          disabled={
            loading
          }
        >

          {
            loading
              ? "Processing..."
              : "Transfer Money"
          }

        </button>

      </form>


      {message && (

        <p className="message">
          {message}
        </p>

      )}


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


export default Transfer;
