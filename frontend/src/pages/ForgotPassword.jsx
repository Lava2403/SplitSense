import { Link } from "react-router-dom";
import { useState } from "react";
import { forgotPassword as forgotPasswordRequest } from "../api/authApi";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResetLink("");
    setLoading(true);

    try {
      const response = await forgotPasswordRequest({ email });
      setSuccess(
        response.message ||
          "If an account exists for that email, you can reset your password."
      );
      if (response.data?.resetLink) {
        setResetLink(response.data.resetLink);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send a reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Forgot password</h1>
          <p>Enter your email and we will help you reset it</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
          {success && (
            <p className="form-message form-message--success">{success}</p>
          )}
          {resetLink && (
            <p className="form-message form-message--success">
              {success.includes("could not send")
                ? "Use this reset link to set a new password: "
                : "Email is not configured yet, so use this reset link: "}
              <Link to={new URL(resetLink).pathname}>Reset password</Link>
            </p>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="login-footer">
          Remembered your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
