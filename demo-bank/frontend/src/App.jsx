import { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [balance, setBalance] = useState("");
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState(null);

  const handleCreateAccount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/create-account",
        {
          name,
          mobile,
          balance,
        }
      );

      setMessage(response.data.message);
      setAccount(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to create account"
      );
    }
  };

  return (
    <div>
      <h1>AmisPay Demo Bank</h1>

      <h2>Create Demo Account</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />

      <input
        type="number"
        placeholder="Initial Balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
      />

      <button onClick={handleCreateAccount}>
        Create Account
      </button>

      <p>{message}</p>

      {account && (
        <div>
          <p>Customer ID: {account.customerId}</p>
          <p>Account Number: {account.accountNumber}</p>
          <p>Balance: ₹{account.balance}</p>
        </div>
      )}
    </div>
  );
}

export default App;