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


function Login() {

  const navigate =
    useNavigate();


  const [
    customerId,
    setCustomerId
  ] = useState("");


  const [
    password,
    setPassword
  ] = useState("");


  const [
    message,
    setMessage
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  async function handleLogin(
    e
  ) {

    e.preventDefault();

    setMessage("");


    if (
      !customerId ||
      !password
    ) {

      setMessage(
        "Please enter Customer ID and password."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await axios.post(
          `${API_URL}/api/login`,
          {
            customerId,
            password
          }
        );


      localStorage.setItem(
        "token",
        response.data.token
      );


      navigate(
        "/dashboard"
      );


    } catch (error) {

      setMessage(
        error.response?.data
          ?.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div className="container">

      <Brand />

      <h1>
        Login
      </h1>


      <form
        onSubmit={
          handleLogin
        }
      >

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
          type="password"
          placeholder="Password"
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


        <button
          type="submit"
          disabled={
            loading
          }
        >

          {
            loading
              ? "Logging in..."
              : "Login"
          }

        </button>

      </form>


      {message && (

        <p className="error-message">
          {message}
        </p>

      )}


      <p>

        Don't have an account?{" "}

        <Link to="/register">
          Register
        </Link>

      </p>

    </div>
  );
}

export default Login;