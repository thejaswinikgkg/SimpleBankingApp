import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import axios from "axios";

import Brand from "../components/Brand";

const API_URL =
  "http://localhost:5000";


function Transactions() {

  const navigate =
    useNavigate();


  const token =
    localStorage.getItem(
      "token"
    );


  const [
    transactions,
    setTransactions
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    message,
    setMessage
  ] = useState("");


  useEffect(() => {

    if (!token) {

      navigate(
        "/login"
      );

      return;
    }

    fetchTransactions();

  }, []);


  async function fetchTransactions() {

    try {

      setLoading(true);


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


      setTransactions(
        response.data
      );


    } catch (error) {

      console.error(error);

      setMessage(
        error.response?.data
          ?.message ||
        "Failed to load transactions"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div className="container">

      <Brand />

      <h1>
        Transaction History
      </h1>


      {loading && (

        <p>
          Loading transactions...
        </p>

      )}


      {!loading &&
        transactions.length === 0 && (

          <p>
            No transactions found.
          </p>

        )}


      {!loading &&
        transactions.length > 0 && (

          <div className="transaction-table-wrapper">

            <table
              className="transaction-table"
            >

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Sender
                  </th>

                  <th>
                    Receiver
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  transaction => (

                    <tr
                      key={
                        transaction.id
                      }
                    >

                      <td>
                        {
                          transaction.id
                        }
                      </td>

                      <td>
                        {
                          transaction.transaction_type
                        }
                      </td>

                      <td>
                        ₹
                        {Number(
                          transaction.amount
                        ).toFixed(2)}
                      </td>

                      <td>
                        {
                          transaction.sender_account
                        }
                      </td>

                      <td>
                        {
                          transaction.receiver_account
                        }
                      </td>

                      <td>
                        {
                          new Date(
                            transaction.created_at
                          ).toLocaleString()
                        }
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


      {message && (

        <p className="error-message">
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

export default Transactions;