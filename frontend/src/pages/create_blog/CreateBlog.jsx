import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { toast } from "react-toastify";
import api from "../../utils/api";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal";
import "../../styles/CreateBlog.css";
import "../../styles/Layout.css";

function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.length > 50) {
      setError("Title must be 50 characters or less");
      return;
    }

    setCreating(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);

    try {
      await api.post("/blogs", formData);
      toast.success("Blog created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.response?.data?.detail || "Failed to create blog");
      toast.error("Failed to create blog. Please try again.");
    } finally {
      setCreating(false);
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
              <NavLink to="/" className="navbar-link">Homepage</NavLink>
              <NavLink to="/myblogs" className="navbar-link">My Blogs</NavLink>
              <NavLink to="/create-blog" className="navbar-link">Add Blog</NavLink>
              <button onClick={() => setShowLogoutModal(true)} className="logout-btn">Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="navbar-link">Login</NavLink>
          )}
        </div>
      </nav>
      <div className="main-contentss">
        <main className="contented">
          <div className="create-blog-container">
            <h2>Create New Blog</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength="50" required disabled={creating}/>
              <textarea type="description" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required disabled={creating}/>

              <label htmlFor="imageUpload">Upload Image:</label>
              <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} disabled={creating}/>

              <label htmlFor="videoUpload">Upload Video:</label>
              <input id="videoUpload" type="file" accept="video/*" onChange={handleVideoChange} disabled={creating}/>

              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Blog"}
              </button>
              {error && <p className="error">{error}</p>}
            </form>

          </div>
        </main>
      </div>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Blog Management. All rights reserved.</p>
        <div className="footer-links">
          <NavLink to="/about" className="footer-link">About</NavLink>
          <NavLink to="/contact" className="footer-link">Contact</NavLink>
          <NavLink to="/privacy" className="footer-link">Privacy Policy</NavLink>
        </div>
      </footer>
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </div>
  );
}

export default CreateBlog;
