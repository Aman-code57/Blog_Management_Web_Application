import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./AuthContext";
import Home from "./pages/hompage/Homepage";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";
import CreateBlog from "./pages/create_blog/CreateBlog";
import Profile from "./pages/profile/Profile";
import About from "./pages/about/About";
import ForgotPassword from "./pages/auth/ForgotPassword/ForgotPassword"
import OTPForgotPassword from "./pages/auth/ForgotPassword/OTPForgotPassword"
import ResetPassword from "./pages/auth/ForgotPassword/ResetPassword";
import BlogRead from "./pages/blog_read/BlogRead"

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-forgot-password" element={<OTPForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/create-blog" element={isAuthenticated ? <CreateBlog /> : <Navigate to="/login" />} />
      <Route path="/myblogs" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" />} />
      <Route path="/blog/:blogId" element={<BlogRead />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
