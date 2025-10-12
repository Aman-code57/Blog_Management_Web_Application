import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import Input from "../../../components/Input";
import "../../../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const validateUsername = () => {
    if (!username.trim()) {
      setUsernameError("Username is required");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validatePassword = () => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    const isUsernameValid = validateUsername();
    const isPasswordValid = validatePassword();
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }
    try {
      await login(username, password);
    } catch (e) {
      setError(e.response?.data?.detail || "An error occurred during login");
    }
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <h1>Blog Management</h1>
        <button onClick={() => window.location.href = "/"} className="back-button">Blogpage</button>
      </nav>
      <div className="login-container">
        <h2>Login</h2>
        {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={validateUsername}
          error={usernameError}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
          error={passwordError}
          required
        />
          <button type="submit">Login</button>
        <Link to="/forgot-password">Forgot Password?</Link>
      </form>
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
      </div>
    </div>
  );
}

export default Login;
