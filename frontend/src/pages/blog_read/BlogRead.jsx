import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import api from "../../utils/api";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal";
import "../../styles/BlogRead.css";
import "../../styles/Layout.css";

function BlogRead() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    api.get(`/blogs/${blogId}`)
      .then((response) => {
        setBlog(response.data);
        setError(null);

        if (isAuthenticated) {
          api.get(`/likes/blog/${blogId}`)
            .then((likeResponse) => {
              setIsLiked(likeResponse.data.is_liked);
              // Sync likes_count if different
              if (likeResponse.data.likes_count !== response.data.likes_count) {
                setBlog(prev => ({ ...prev, likes_count: likeResponse.data.likes_count }));
              }
            })
            .catch((err) => {
              console.error("Error fetching like status:", err);
              setIsLiked(false);
            });
        }
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog. Please check if the backend is running.");
      });

    api.get(`/comments/blog/${blogId}`)
      .then((response) => setComments(response.data))
      .catch((err) => console.error("Error fetching comments:", err));
  }, [blogId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like blogs");
      return;
    }
    try {
      const response = await api.post(`/likes/blog/${blogId}`);
      setIsLiked(response.data.liked);
      setBlog(prev => ({ ...prev, likes_count: response.data.likes_count }));
    } catch (err) {
      console.error("Error liking blog:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else if (err.response?.status === 404) {
        alert("Blog not found.");
      } else {
        alert("Failed to like blog");
      }
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert("Please login to comment");
      return;
    }
    if (!newComment) return;
    try {
      await api.post(`/comments/blog/${blogId}`, { content: newComment });
      setNewComment('');
      const commentsResponse = await api.get(`/comments/blog/${blogId}`);
      setComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${blogId}`);
      setBlog(blogResponse.data);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      const commentsResponse = await api.get(`/comments/blog/${blogId}`);
      setComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${blogId}`);
      setBlog(blogResponse.data);
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment");
    }
  };

  const handleReply = async (parentId) => {
    if (!isAuthenticated) {
      alert("Please login to reply");
      return;
    }
    if (!replyText) return;
    try {
      await api.post(`/comments/blog/${blogId}`, { content: replyText, parent_id: parentId });
      setReplyText('');
      setReplyingTo(null);
      const commentsResponse = await api.get(`/comments/blog/${blogId}`);
      setComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${blogId}`);
      setBlog(blogResponse.data);
    } catch (err) {
      console.error("Error replying:", err);
      alert("Failed to reply");
    }
  };

  const renderComments = (commentsList, parentId = null) => {
    return commentsList
      .filter(comment => comment.parent_comment_id === parentId)
      .map(comment => {
        const parentComment = comment.parent_comment_id ? commentsList.find(c => c.id === comment.parent_comment_id) : null;
        return (
          <div key={comment.id} className="comment">
            {parentComment && (
              <small>Replying to: {parentComment.username}</small>
            )}
            <p>{comment.content}</p>
            <small>User: {comment.username}</small>
            {isAuthenticated && (comment.user_id === user?.id || blog.author_id === user?.id) && (
              <button onClick={() => handleDeleteComment(comment.id)}className="del-btns">Delete</button>
            )}
            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}className="rep-btns">Reply</button>
            {replyingTo === comment.id && (
              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply..."
                />
                <button onClick={() => handleReply(comment.id)}className="subs-btns">Submit Reply</button>
                <button onClick={() => setReplyingTo(null)}className="cans-btns">Cancel</button>
              </div>
            )}
            {renderComments(commentsList, comment.id)}
          </div>
        );
      });
  };



  if (error) {
    return (
      <div className="layout-container-read">
        <nav className="navbar">
          <h1 className="navbar-title">Blog Management</h1>
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                <Link to="/" className="navbar-link">Homepage</Link>
                <Link to="/myblogs" className="navbar-link">My Blogs</Link>
                <Link to="/create-blog" className="navbar-link">Add Blog</Link>
                <button onClick={() => setShowLogoutModal(true)} className="logout-btn">Logout</button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">Login</Link>
            )}
          </div>
        </nav>
        <div className="main-contented">
          <main className="content">
            <p className="error">{error}</p>
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
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
      />
    </div>
  );
}

  if (!blog) {
    return (
      <div className="layout-container">
        <nav className="navbar">
          <h1 className="navbar-title">Blog Management</h1>
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                <Link to="/" className="navbar-link">Homepage</Link>
                <Link to="/myblogs" className="navbar-link">My Blogs</Link>
                <Link to="/create-blog" className="navbar-link">Add Blog</Link>
                <button onClick={() => setShowLogoutModal(true)} className="logout-btn">Logout</button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">Login</Link>
            )}
          </div>
        </nav>
        <div className="main-content">
          <main className="content">
            <p>Loading...</p>
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
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
      />
    </div>
  );
}

  return (
    <div className="layout-container">
      <nav className="navbar">
        <h1 className="navbar-title">Blog Management</h1>
          <div className="navbar-right">
            {isAuthenticated ? (
              <>
                <Link to="/" className="navbar-link">Homepage</Link>
                <Link to="/myblogs" className="navbar-link">My Blogs</Link>
                <Link to="/create-blog" className="navbar-link">Add Blog</Link>
                <button onClick={() => setShowLogoutModal(true)} className="logout-btn">Logout</button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">Login</Link>
            )}
          </div>
      </nav>
      <div className="main-content">
        <main className="content">
          <div className="blog-read-container">
            <h1>{blog.title}</h1>
            {blog.image_url && <img src={`http://localhost:8000${blog.image_url}`} alt={blog.title} />}
            {blog.video_url && <video src={`http://localhost:8000${blog.video_url}`} controls />}
            <div className="blog-content">
              <p>{blog.content}</p>
              <p>Author: {blog.author_username}</p>
              <div className="blog-actions">
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                  style={{ opacity: !isAuthenticated ? 0.5 : 1, cursor: !isAuthenticated ? 'not-allowed' : 'pointer' }}
                >
                  <FaThumbsUp style={{ color: isLiked ? '#007bff' : 'inherit' }} />
                  <span className="sr-only">Like</span>
                  {blog.likes_count || 0}
                </button>
                <button className="comment-btn">
                  <FaComment />
                  <span className="sr-only">Comment</span>
                  {blog.comments_count || 0}
                </button>
              </div>
              <div className="comments-section">
                <h3>Comments ({blog.comments_count || 0})</h3>
                {isAuthenticated && (
                  <div className="add-comment">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                    />
                    <button onClick={handleAddComment} className="post-btn">Post</button>
                  </div>
                )}
                <div className="comments-list">
                  {renderComments(comments)}
                </div>
              </div>
            </div>
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
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
      />
    </div>
  );
}

export default BlogRead;
