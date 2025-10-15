import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import CreateBlog from "../create_blog/CreateBlog";
import About from "../about/About";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import api from "../../utils/api";
import LogoutConfirmationModal from "../../components/LogoutConfirmationModal";
import "../../styles/Homepage.css";
import "../../styles/Layout.css";



function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [currentView] = useState('home');
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (currentView === 'home') {
      fetchBlogs();
    }
  }, [currentView, page, sortBy, order, search]);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        order: order,
        ...(search && { search })
      });
      const response = await api.get(`/blogs?${params}`);
      setBlogs(sortBlogs(response.data.blogs, sortBy, order));
      setTotalPages(response.data.total_pages);
      setError(null);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please check if the backend is running.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); 
    fetchBlogs();
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1); 
  };

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    setPage(1); 
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewBlog = (blog) => {
    navigate(`/blog/${blog.id}`);
  };

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

  const sortBlogs = (blogs, sortBy, order) => {
    return [...blogs].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at);
        bVal = new Date(b.created_at);
      } else if (sortBy === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else if (sortBy === 'likes') {
        aVal = a.likes_count || 0;
        bVal = b.likes_count || 0;
      }
      if (order === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  };

  const handleLike = async (blogId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/likes/blog/${blogId}`);
      fetchBlogs();
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error('Failed to toggle like. Please try again.');
    }
  };
  const renderContent = () => {
    switch (currentView) {
      case 'home':
        if (error) {
          return <p className="error">{error}</p>;
        }
        return (
          <div>
            {/* Search and Sort Controls */}
            <div className="controls-container">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search blogs..."
                  className="search-input"
                />
                <button type="submit" className="search-btn">Search</button>
              </form>
              <div className="sort-controls">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="sort-select">
                  <option value="created_at">Date</option>
                  <option value="title">Title</option>
                  <option value="likes">Likes</option>
                </select>
                <select value={order} onChange={(e) => handleOrderChange(e.target.value)} className="order-select">
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {blogs.length === 0 ? (
              <p>No blogs available yet. Start by <NavLink to={isAuthenticated ? "/create-blog" : "/login"}>Add Blog</NavLink>!</p>
            ) : (
              <div>
                <div className="blog-list">
                  {blogs.map((blog) => (
                    <div key={blog.id} className="blog-cards">
                      <div className="blog-contents">
                        <h2>{blog.title}</h2>
                        <p>{`${blog.content.substring(0, 100)}${blog.content.length > 100 ? '...' : ''}`}</p>
                        <button onClick={() => handleViewBlog(blog)} className="read-more-btn">
                          Read More
                        </button>
                        <p>Author: {blog.author_username}</p>
                        <p>Created: {new Date(blog.created_at).toLocaleDateString()}</p>
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

                {/* Pagination Controls */}
                <div className="pagination-container">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
        <NavLink to="/" className="navbar-title-link"><h1 className="navbar-title"> Blog Management</h1></NavLink>
        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <NavLink to="/" className="navbar-link">Homepage</NavLink>
              <NavLink to="/myblogs" className="navbar-link">My Blogs</NavLink>
              <NavLink to="/create-blog" className="navbar-link">Add Blog</NavLink>
              <button onClick={() => setShowLogoutModal(true)} className="logouts-btns">Logout</button>
            </>
          ) : (
            <><NavLink to="/login" className="navbar-link">Login</NavLink><NavLink to="/Register" className="navbar-link">Register</NavLink></>
          )}
        </div>
      </nav>
      <div className="main-content">
        <main className="contents">
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
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => { await logout(); setShowLogoutModal(false); }}
      />
    </div>
  );
}

export default Home;
