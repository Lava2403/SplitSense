import { Link } from "react-router-dom";
import { use, useState } from "react";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if(name.trim() == ""){
      setSuccess("");
      setError("Name is required");
      return;
    }
    if(email.trim() == ""){
      setSuccess("");
      setError("Email is required");
      return;
    }
    if(password.length < 6){
      setSuccess("");
      setError("Password must be atleast 6 characters");
      return;
    }
    setError("");
    setSuccess("Account created successfully");
    setName("");
    setEmail("");
    setPassword("");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
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
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && <p>{error}</p>}
          <button type="submit" className="signup-button">
            Create account
          </button>
          {success && <p>{success}</p>}
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
