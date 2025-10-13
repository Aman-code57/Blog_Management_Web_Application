import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/Profile.css";
import "../../styles/Layout.css";

function Profile() {
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editVideo, setEditVideo] = useState(null);
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (user) {
      api.get(`/blogs/user/${user.id}`)
        .then((response) => setBlogs(response.data))
        .catch((err) => console.error("Error fetching user blogs:", err));
    }
  }, [user]);

  const handleEdit = (blog) => {
    setEditingBlog(blog.id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
    setEditImage(null);
    setEditVideo(null);
  };

  const handleSaveEdit = async (blogId) => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);
    if (editImage) formData.append("image", editImage);
    if (editVideo) formData.append("video", editVideo);

    try {
      const response = await api.patch(`/blogs/${blogId}`, formData);
      setBlogs(blogs.map(blog => blog.id === blogId ? response.data : blog));
      setEditingBlog(null);
      setEditImage(null);
      setEditVideo(null);
    } catch (error) {
      console.error("Error updating blog:", error);
      alert("Failed to update blog");
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog");
    }
  };

  const toggleContent = (id) => {
    setExpandedBlogId(expandedBlogId === id ? null : id);
  };

  const fetchComments = async (blogId) => {
    try {
      const response = await api.get(`/comments/blog/${blogId}`);
      setComments(prev => ({ ...prev, [blogId]: response.data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleAddComment = async (blogId) => {
    if (!newComment[blogId]) return;
    try {
      await api.post(`/comments/blog/${blogId}`, { content: newComment[blogId] });
      setNewComment(prev => ({ ...prev, [blogId]: '' }));
      fetchComments(blogId);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId, blogId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments(blogId);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  const handleReply = async (blogId, parentId) => {
    if (!replyText) return;
    try {
      await api.post(`/comments/blog/${blogId}`, { content: replyText, parent_id: parentId });
      setReplyText('');
      setReplyingTo(null);
      fetchComments(blogId);
    } catch (err) {
      console.error("Error replying:", err);
      alert("Failed to reply");
    }
  };

  const toggleComments = (blogId) => {
    if (!comments[blogId]) {
      fetchComments(blogId);
    }
    setComments(prev => ({ ...prev, [blogId]: prev[blogId] ? null : prev[blogId] }));
  };

  const renderComments = (commentsList, blogId, parentId = null) => {
    return commentsList
      .filter(comment => comment.parent_comment_id === parentId)
      .map(comment => (
        <div key={comment.id} className="comment">
          <p>{comment.content}</p>
          <small>User: {comment.username}</small>
          <button onClick={() => handleDeleteComment(comment.id, blogId)} className="btn-del">Delete</button>
          <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="btn-reply">Reply</button>
          {replyingTo === comment.id && (
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply..."
              />
              <button onClick={() => handleReply(blogId, comment.id)}className="sub-btn">Submit Reply</button>
              <button onClick={() => setReplyingTo(null)} className="can-btn">Cancel</button>
            </div>
          )}
          {renderComments(commentsList, blogId, comment.id)}
        </div>
      ));
  };

  return (
    <div className="layout-container-myblogs">
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
      <div className="main-cont">
        <main className="cont">
          <div className="profile-container">
            <h2>My Blogs</h2>
            {blogs.length === 0 ? (
              <p>No blogs yet. Create one from the <Link to={ "/create-blog"}>Add Blog</Link>!</p>
            ) : (
              <div className="blog-grid">
                {blogs.map((blog) => (
                  <div key={blog.id} className="blog-card">
                    {blog.image_url && <img src={`http://localhost:8000${blog.image_url}`} alt={blog.title} />}
                    {blog.video_url && <video src={`http://localhost:8000${blog.video_url}`} controls />}
                    <div className="blog-content">
                      {editingBlog === blog.id ? (
                        <>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                          />
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="edit-textarea"
                          />
                          <label htmlFor="editImageUpload">Change Image:</label>
                          <input
                            id="editImageUpload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditImage(e.target.files[0])}
                          />
                          <label htmlFor="editVideoUpload">Change Video:</label>
                          <input
                            id="editVideoUpload"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setEditVideo(e.target.files[0])}
                          />
                          <button onClick={() => handleSaveEdit(blog.id)} className="save-btn">Save</button>
                          <button onClick={() => setEditingBlog(null)} className="cancel-btn">Cancel</button>
                        </>
                      ) : (
                        <>
                          <h2>{blog.title}</h2>
                          <p>
                            {expandedBlogId === blog.id ? blog.content : `${blog.content.substring(0, 100)}${blog.content.length > 100 ? '...' : ''}`}
                          </p>
                          <button onClick={() => toggleContent(blog.id)} className="read-btn">
                            {expandedBlogId === blog.id ? 'Hide' : 'Read'}
                          </button>
                          <div className="blog-actions">
                            <button onClick={() => handleEdit(blog)} className="edit-btn">Edit</button>
                            <button onClick={() => handleDelete(blog.id)} className="delete-btn">Delete</button>
                            <button onClick={() => toggleComments(blog.id)} className="comments-btn">
                              {comments[blog.id] ? 'Hide Comments' : 'Show Comments'} ({blog.comments_count || 0})
                            </button>
                          </div>
                          {comments[blog.id] && (
                            <div className="comments-section">
                              <div className="add-comment">
                                <textarea
                                  value={newComment[blog.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [blog.id]: e.target.value }))}
                                  placeholder="Add a comment..."
                                />
                                <button onClick={() => handleAddComment(blog.id)} className="post-btn">Post</button>
                              </div>
                              <div className="comments-list">
                                {renderComments(comments[blog.id], blog.id)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default Profile;
