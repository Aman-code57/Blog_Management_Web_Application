import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import api from "../../utils/api";
import "../../styles/CreateBlog.css";
import "../../styles/Layout.css";

function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length > 50) {
      setError("Title must be 50 characters or less");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    try {
      await api.post("/blogs", formData);
      navigate("/");
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.response?.data?.detail || "Failed to create blog");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        setImage(null);
      } else {
        setError("");
        setImage(file);
      }
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file");
        setVideo(null);
      } else {
        setError("");
        setVideo(file);
      }
    }
  };

  return (
    <div className="layout-container-create">
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
      <div className="main-contentss">
        <main className="contented">
          <div className="create-blog-container">
            <h2>Create New Blog</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength="50" required/>
              <textarea type="description" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required/>

              <label htmlFor="imageUpload">Upload Image:</label>
              <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange}/>

              <label htmlFor="videoUpload">Upload Video:</label>
              <input id="videoUpload" type="file" accept="video/*" onChange={handleVideoChange}/>

              <button type="submit">Create Blog</button>
              {error && <p className="error">{error}</p>}
            </form>

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

export default CreateBlog;
