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
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [imageError, setImageError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    setTitleError("");
    setContentError("");
    setImageError("");
    setVideoError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      hasError = true;
    } else if (title.length < 3 || title.length > 60) {
      setTitleError("Title must be between 3 and 60 characters");
      hasError = true;
    }

    if (!content.trim()) {
      setContentError("Content is required");
      hasError = true;
    } else if (content.length > 1000) {
      setContentError("Content must be up to 200 characters");
      hasError = true;
    }

    if (hasError) return;

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
      toast.error("Failed to create blog. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        setImage(null);
        setImageError("Invalid image file type");
      } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image file size must be less than 5MB");
        setImage(null);
        setImageError("Image file size exceeds 5MB");
      } else {
        setImage(file);
        setImageError("");
      }
    } else {
      setImage(null);
      setImageError("");
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        setVideo(null);
        setVideoError("Invalid video file type");
      } else if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("Video file size must be less than 50MB");
        setVideo(null);
        setVideoError("Video file size exceeds 50MB");
      } else {
        setVideo(file);
        setVideoError("");
      }
    } else {
      setVideo(null);
      setVideoError("");
    }
  };

  return (
    <div className="layout-container-create">
      <nav className="navbar">
        <NavLink to="/" className="navbar-title-link"><h1 className="navbar-title">Blog Management</h1></NavLink>
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <NavLink to="/" className="navbar-link">Homepage</NavLink>
              <NavLink to="/myblogs" className="navbar-link">My Blogs</NavLink>
              <NavLink to="/create-blog" className="navbar-link">Add Blog</NavLink>
              <button onClick={() => setShowLogoutModal(true)} className="logout-btned">Logout</button>
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
              <div>
                <input type="text" className="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength="60" />
                <span className={`errorred ${titleError ? 'visible' : ''}`}>{titleError || ' '}</span>
              </div>
              <div>
                <textarea type="description" className="description" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} maxLength="1000" />
                <span className={`errorred ${contentError ? 'visible' : ''}`}>{contentError || ' '}</span>
              </div>

              <label htmlFor="imageUpload">Upload Image:</label>
              <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} disabled={creating}/>
             

              <label htmlFor="videoUpload">Upload Video:</label>
              <input id="videoUpload" type="file" accept="video/*" onChange={handleVideoChange} disabled={creating}/>

              <button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Blog"}
              </button>
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
        onConfirm={async () => { await logout(); setShowLogoutModal(false); }}
      />
    </div>
  );
}

export default CreateBlog;
