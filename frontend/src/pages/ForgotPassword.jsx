import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword } from "../api/authApi";
import "./Login.css";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page auth-page">
      <div className="login-card auth-card">
        <div className="login-header auth-header">
          <h1>Forgot password</h1>
          <p>Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <form className="login-form auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {error && <p className="form-message form-message--error">{error}</p>}
          {message && <p className="form-message form-message--success">{message}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="login-footer auth-footer">
          Remember your password? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
