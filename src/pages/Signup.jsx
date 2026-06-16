import { Link } from "react-router-dom";
import { useState } from "react";
import "./Signup.css";
import { FcGoogle } from "react-icons/fc";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (name.trim() === "") {
      setSuccess("");
      setError("Name is required.");
      return;
    }

    if (email.trim() === "") {
      setSuccess("");
      setError("Email is required.");
      return;
    }

    if (password.length < 6) {
      setSuccess("");
      setError("Password must be at least 6 characters.");
      return;
    }

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    setError("");
    setSuccess("Account created successfully!");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create account</h1>
          <p>Join SplitSense and start splitting smarter</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-button"
          >
            <FcGoogle />
            Continue with Google
          </button>

          {error && <p className="form-message form-message--error">{error}</p>}

          <button type="submit">
            {loading ? "Creating..." : "Create Account"}
          </button>

          {success && <p className="form-message form-message--success">{success}</p>}
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
