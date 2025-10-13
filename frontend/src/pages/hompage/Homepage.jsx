import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import CreateBlog from "../create_blog/CreateBlog";
import About from "../about/About";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/Homepage.css";
import "../../styles/Layout.css";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [currentView] = useState('home');
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [viewingBlog, setViewingBlog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogComments, setBlogComments] = useState([]);
  const [newBlogComment, setNewBlogComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    if (currentView === 'home') {
      api.get("/blogs")
        .then((response) => {
          setBlogs(response.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching blogs:", err);
          setError("Failed to load blogs. Please check if the backend is running.");
        });
    }
  }, [currentView]);

  useEffect(() => {
    if (selectedBlog) {
      api.get(`/blogs/${selectedBlog.id}`)
        .then((response) => {
          setSelectedBlog(response.data);
        })
        .catch((err) => console.error("Error fetching blog:", err));

      api.get(`/comments/blog/${selectedBlog.id}`)
        .then((response) => setBlogComments(response.data))
        .catch((err) => console.error("Error fetching comments:", err));
    }
  }, [selectedBlog]);

  

  const toggleComments = async (blogId) => {
    if (showComments[blogId]) {
      setShowComments({ ...showComments, [blogId]: false });
    } else {
      try {
        const response = await api.get(`/comments/blog/${blogId}`);
        setComments({ ...comments, [blogId]: response.data });
        setShowComments({ ...showComments, [blogId]: true });
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    }
  };

  const handleBlogLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like blogs");
      return;
    }
    try {
      await api.post(`/likes/blog/${selectedBlog.id}`);
      const response = await api.get(`/blogs/${selectedBlog.id}`);
      setSelectedBlog(response.data);
    } catch (err) {
      console.error("Error liking blog:", err);
      alert("Failed to like blog");
    }
  };

  const handleLike = async (blogId) => {
    if (!isAuthenticated) {
      alert("Please login to like blogs");
      return;
    }
    try {
      await api.post(`/likes/blog/${blogId}`);
      // Refetch blogs to update like counts
      const response = await api.get("/blogs");
      setBlogs(response.data);
    } catch (err) {
      console.error("Error liking blog:", err);
      alert("Failed to like blog");
    }
  };

  const handleAddBlogComment = async () => {
    if (!isAuthenticated) {
      alert("Please login to comment");
      return;
    }
    if (!newBlogComment) return;
    try {
      await api.post(`/comments/blog/${selectedBlog.id}`, { content: newBlogComment });
      setNewBlogComment('');
      const commentsResponse = await api.get(`/comments/blog/${selectedBlog.id}`);
      setBlogComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${selectedBlog.id}`);
      setSelectedBlog(blogResponse.data);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleDeleteBlogComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      const commentsResponse = await api.get(`/comments/blog/${selectedBlog.id}`);
      setBlogComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${selectedBlog.id}`);
      setSelectedBlog(blogResponse.data);
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
      await api.post(`/comments/blog/${selectedBlog.id}`, { content: replyText, parent_id: parentId });
      setReplyText('');
      setReplyingTo(null);
      const commentsResponse = await api.get(`/comments/blog/${selectedBlog.id}`);
      setBlogComments(commentsResponse.data);
      const blogResponse = await api.get(`/blogs/${selectedBlog.id}`);
      setSelectedBlog(blogResponse.data);
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
            {isAuthenticated && (comment.user_id === user?.id || selectedBlog.author_id === user?.id) && (
              <button onClick={() => handleDeleteBlogComment(comment.id)} className="del-btns">Delete</button>
            )}
            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="rep-btns">Reply</button>
            {replyingTo === comment.id && (
              <div className="reply-form">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply..."
                />
                <button onClick={() => handleReply(comment.id)} className="subs-btns">Submit Reply</button>
                <button onClick={() => setReplyingTo(null)} className="cans-btns">Cancel</button>
              </div>
            )}
            {renderComments(commentsList, comment.id)}
          </div>
        );
      });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        if (viewingBlog && selectedBlog) {
          return (
            <div className="blog-read-container">
              <h1>{selectedBlog.title}</h1>
              {selectedBlog.image_url && <img src={`http://localhost:8000${selectedBlog.image_url}`} alt={selectedBlog.title} />}
              {selectedBlog.video_url && <video src={`http://localhost:8000${selectedBlog.video_url}`} controls />}
              <div className="blog-content">
                <p>{selectedBlog.content}</p>
                <p>Author: {selectedBlog.author_username}</p>
                <div className="blog-actions">
                  <button onClick={handleBlogLike} className="like-btn">
                    <FaThumbsUp />
                    <span className="sr-only"></span>
                    {selectedBlog.likes_count || 0}
                  </button>
                  <button className="comment-btn">
                    <FaComment />
                    <span className="sr-only"></span>
                    {selectedBlog.comments_count || 0}
                  </button>
                </div>
                <div className="comments-section">
                  {isAuthenticated && (
                    <div className="add-comment">
                      <textarea
                        value={newBlogComment}
                        onChange={(e) => setNewBlogComment(e.target.value)}
                        placeholder="Add a comment..."
                      />
                      <button onClick={handleAddBlogComment} className="post-btn">Post</button>
                    </div>
                  )}
                  <div className="comments-list">
                    {renderComments(blogComments)}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        if (error) {
          return <p className="error">{error}</p>;
        }
        return blogs.length === 0 ? (
          <p>No blogs available yet. Start by <NavLink to={isAuthenticated ? "/create-blog" : "/login"}>Add Blog</NavLink>!</p>
        ) : (
          <div className="blog-list">
            {blogs.map((blog) => (
              <div key={blog.id} className="blog-card">
                <div className="blog-content">
                  <h2>{blog.title}</h2>
                  <p>{`${blog.content.substring(0, 100)}${blog.content.length > 100 ? '...' : ''}`}</p>
                  <button onClick={() => { setViewingBlog(true); setSelectedBlog(blog); }} className="read-more-btn">
                    Read More
                  </button>
                  <p>Author: {blog.author_username}</p>
                  <div className="blog-actions">
                    <button onClick={() => handleLike(blog.id)} className="like-btn">
                      <FaThumbsUp />
                      <span className="sr-only"></span>
                      {blog.likes_count || 0}
                    </button>
                    <button onClick={() => toggleComments(blog.id)} className="comment-btn">
                      <FaComment />
                      <span className="sr-only"></span>
                      {blog.comments_count || 0}
                    </button>
                  </div>
                  {showComments[blog.id] && (
                    <div className="comments-section">
                      <div className="comments-list">
                        {(comments[blog.id] || []).map((comment) => (
                          <div key={comment.id} className="comment">
                            <p><strong>{comment.username}:</strong> {comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'add':
        return <CreateBlog />;
      case 'about':
        return <About />;
      default:
        return null;
    }
  };

  return (
    <div className="layout-container homepage">
      <nav className="navbar">
        <h1 className="navbar-title">Blog Management</h1>
        <div className="navbar-right">
          {viewingBlog && (
            <button onClick={() => setViewingBlog(false)} className="back-btnss">Back to blogs</button>
          )}
          {isAuthenticated ? (
            <>
              <NavLink to="/" className="navbar-link">Homepage</NavLink>
              <NavLink to="/myblogs" className="navbar-link">My Blogs</NavLink>
              <NavLink to="/create-blog" className="navbar-link">Add Blog</NavLink>
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <><NavLink to="/login" className="navbar-link">Login</NavLink><NavLink to="/Register" className="navbar-link">Register</NavLink></>
          )}
        </div>
      </nav>
      <div className="main-content">
        <main className="content">
          {renderContent()}
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
    </div>
  );
}

export default Home;
