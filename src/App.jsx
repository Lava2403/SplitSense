import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
