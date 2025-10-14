import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../../components/Input";
import "../../../styles/Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";
    if (name === "username") {
      if (!value.trim()) {
        error = "Username is required";
      } else if (value.trim().length < 3) {
        error = "Username must be at least 3 characters";
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = "Email is required";
      } else if (!emailRegex.test(value)) {
        error = "Invalid email address";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUsernameValid = validateField("username", username);
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        const data = await response.json();
        toast.error(data.detail || "Registration failed");
      }
    } catch {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link to="/" className="navbar-title-link"><h1 className="navbar-title"> Blog Management</h1></Link>
        <button onClick={() => window.location.href = "/"} className="back-button">Blogpage</button>
      </nav>
      <div className="register-container">
        <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleBlur}
          error={fieldErrors.username}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleBlur}
          error={fieldErrors.email}
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handleBlur}
          error={fieldErrors.password}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
      </div>
    </div>
  );
}

export default Register;
