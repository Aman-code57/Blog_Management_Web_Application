import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles/Layout.css";

function Layout({ children, showBackButton, onBackClick }) {
  const { logout, isAuthenticated } = useAuth();

  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">Blog Management</h1>
        <div className="navbar-right">
          {showBackButton && (
            <button onClick={onBackClick} className="back-btns">Back to Blogs</button>
          )}
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

      {/* Main Content */}
      <div className="main-content">
        <main className="content">
          {children}
        </main>
      </div>

      {/* Footer */}
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

export default Layout;
