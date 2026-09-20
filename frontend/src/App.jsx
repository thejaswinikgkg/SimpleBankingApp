import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import ChangePassword from "./pages/ChangePassword";
import Transfer from "./pages/Transfer";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/transfer"
          element={<Transfer />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/change-password"
          element={<ChangePassword />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;