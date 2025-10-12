import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "../../styles/About.css";
import "../../styles/Layout.css";

function About() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="layout-container-about">
      <nav className="navbar">
        <h1 className="navbar-title">Blog Management</h1>
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link">Homepage</Link>
              <Link to="/myblogs" className="navbar-link">My Blogs</Link>
              <Link to="/create-blog" className="navbar-link">Add Blog</Link>
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/login" className="navbar-link">Login</Link>
          )}
        </div>
      </nav>
      <div className="main-content">
        <main className="content">
          <div className="about-container">
            <h2>About Blog Management</h2>
            <p>
              Welcome to our Blog Management System        </p>
            <p>
              Features include:
            </p>
            <ul>
              <li>Creating blogs with text, images, and videos</li>
              <li>Managing personal blogs (edit and delete)</li>
            </ul>
            <p>
              Built with React for the frontend and FastAPI for the backend.
            </p>
          </div>
        </main>
      </div>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Blog Management. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}

export default About;
