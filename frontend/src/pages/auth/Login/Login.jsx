import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import Input from "../../../components/Input";
import { TailSpin } from "react-loader-spinner";
import "../../../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const { login, loginLoading } = useAuth();

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
    setError(""); 
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
          disabled={loginLoading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
          error={passwordError}
          required
          disabled={loginLoading}
        />
          <button type="submit" disabled={loginLoading} style={{ position: 'relative' }}>
            {loginLoading ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ color: '#fff' }}>Logging in...</span>
                  <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" style={{ marginTop: '5px' }}/>
                </div>
              </>
            ) : (
              "Login"
            )}
          </button>
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
