import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import Input from "../../../components/Input";
import { TailSpin } from "react-loader-spinner";
import "../../../styles/Login.css";
import { toast } from "react-toastify";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const { login, loginLoading } = useAuth();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

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
    if (!isUsernameValid) {
      usernameRef.current?.focus();
      toast.error("Please fill the required field in the form");
      return;
    }
    if (!isPasswordValid) {
      passwordRef.current?.focus();
      toast.error("Please fill the required field in the form");
      return;
    }
    try {
        await login(username, password);
      } catch (e) {
        const message = e.response?.data?.detail || "An error occurred during login";

        if (message.toLowerCase().includes("username and password") ||
            message.toLowerCase().includes("username or password")) {
            setUsernameError("Incorrect username");
            setPasswordError("Incorrect password");
            usernameRef.current?.focus();
          } else if (message.toLowerCase().includes("username")) {
            setUsernameError("Incorrect username");
            usernameRef.current?.focus();
          } else if (message.toLowerCase().includes("password")) {
            setPasswordError("Incorrect password");
            passwordRef.current?.focus();
          } else {
            setError(message);
          }

        toast.error(message);
      }
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link to="/" className="navbar-title-link"><h1 className="navbar-title"> Blog Management</h1></Link>
        <button onClick={() => window.location.href = "/"} className="back-button">BlogPage</button>
      </nav>
      <div className="login-container">
        <h2>Login</h2>
        <span>{error && <p className="error-messages">{error}</p>}</span>
      <form onSubmit={handleSubmit}>
        <Input
          ref={usernameRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={validateUsername}
          error={usernameError}
          disabled={loginLoading}
        />
        <Input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
          error={passwordError}
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
