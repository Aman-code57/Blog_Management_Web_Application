# Technical Documentation: Blog Management App

## Overview
The Blog Management App is a full-stack web application designed for creating, reading, updating, and deleting blog posts, along with user authentication, commenting, and liking functionality. It follows a **Three-Tier Architecture** to ensure separation of concerns, scalability, and maintainability:

- **Presentation Tier (Frontend)**: A React Single Page Application (SPA) built with Vite, handling user interface, routing, and client-side logic.
- **Application Tier (Backend)**: A FastAPI RESTful API server managing business logic, authentication, data validation, and API endpoints.
- **Data Tier (Database)**: SQLAlchemy ORM with a MySQL database (via PyMySQL) for data persistence, including user accounts, blogs, comments, and likes.

The app supports features like user registration/login/forgot password, blog creation with image/video uploads, blog viewing with like/comment counts, user profiles, and file serving for uploads.

Key Technologies:
- **Frontend**: React 19, React Router DOM 7, React Icons, React Toastify, Vite 7 (build tool), ESLint.
- **Backend**: FastAPI 0.99, SQLAlchemy 2.0, PyMySQL 1.1, Passlib (bcrypt), Python-JOSE (JWT), FastAPI-Mail, Python-Multipart (file uploads), Python-Dotenv.
- **Database**: MySQL (inferred from PyMySQL dependency).
- **Other**: CORS middleware for frontend-backend communication, static file serving for uploads.

## Project Structure

### Backend (`backend/`)
- `app.py`: Main FastAPI application entry point. Sets up the app, middleware (CORS), database creation, routers, and static file mounting for uploads.
- `requirements.txt`: Python dependencies.
- `api/`: API routers.
  - `auth.py`: Authentication endpoints (register, login, forgot password, OTP, reset password).
  - `blogs.py`: Blog CRUD operations with file upload handling.
  - `comments.py`: Comment creation/retrieval for blogs.
  - `likes.py`: Like/unlike functionality for blogs.
- `core/`: Core utilities.
  - `config.py`: Configuration settings (e.g., database URL, secrets).
  - `security.py`: JWT token handling and current user dependency.
- `crud/`: Database operations (Create, Read, Update, Delete).
  - Files for blogs, comments, likes, users.
- `database/`: Database setup.
  - `connection.py`: Engine and session management.
- `middleware/`: Custom middleware (e.g., CORS).
- `models/`: SQLAlchemy ORM models.
  - `user.py`: User model (id, username, email, password, OTP fields).
  - `blogs.py`: Blog model (id, title, content, image_url, video_url, user_id).
  - `comments.py`: Comment model (id, content, user_id, blog_id).
  - `likes.py`: Like model (id, user_id, blog_id).
- `public/uploads/`: Directory for uploaded images/videos.
- `schemas/`: Pydantic schemas for request/response validation (e.g., user, blog schemas).

### Frontend (`frontend/`)
- `package.json`: Node dependencies and scripts (dev, build, lint).
- `vite.config.js`: Vite configuration for React.
- `src/`: Source code.
  - `main.jsx`: React entry point (renders App).
  - `App.jsx` and `App.css`: Root component with routing (inferred from structure).
  - `AuthContext.jsx`: Context for authentication state.
  - `components/`: Reusable UI components (FileInput, FormField, Input, Layout, Textarea).
  - `pages/`: Route-based pages.
    - `auth/`: Login, Register, ForgotPassword (with OTP and Reset).
    - `create_blog/`: Blog creation form.
    - `blog_read/`: Blog viewing with comments/likes.
    - `hompage/`: Homepage (likely lists blogs).
    - `profile/`: User profile page.
    - `about/`: About page.
  - `styles/`: CSS files for each component/page.
  - `utils/`: Utilities.
    - `api.js`: API client for backend calls.
    - `cookies.js`: Cookie handling (likely for JWT tokens).
  - `assets/`: Static assets (e.g., React SVG).

### Root Files
- `architecture.txt`: Describes the Three-Tier Architecture.
- `package.json` and `package-lock.json`: Likely for root-level npm (but frontend has its own).

## Setup and Installation

### Backend
1. Navigate to `backend/` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Set environment variables in `.env` (e.g., `DATABASE_URL`, `SECRET_KEY`, `MAIL_*` for FastAPI-Mail).
4. Run the server: `uvicorn app:app --reload --host 0.0.0.0 --port 8000`.
   - Database tables are auto-created via `Base.metadata.create_all(bind=engine)`.

### Frontend
1. Navigate to `frontend/` directory.
2. Install dependencies: `npm install`.
3. Run development server: `npm run dev` (starts on http://localhost:5173).
4. Build for production: `npm run build`.

### Database
- Uses MySQL. Ensure a database is created and `DATABASE_URL` points to it (e.g., `mysql+pymysql://user:pass@localhost/dbname`).
- Models define tables: `users`, `blogs`, `comments`, `likes`.

## API Endpoints
All endpoints prefixed with `/api`.

### Authentication (`/api/auth/`)
- `POST /register`: Create user (username, email, password).
- `POST /login`: Login and get JWT token.
- `POST /forgot-password`: Send OTP to email.
- `POST /verify-otp`: Verify OTP for forgot password.
- `POST /reset-password`: Reset password with token.

### Blogs (`/api/blogs/`)
- `GET /`: List all blogs (with author, likes/comments count).
- `GET /{blog_id}`: Get single blog details.
- `GET /user/{user_id}`: Get blogs by user.
- `POST /`: Create blog (title, content, optional image/video upload). Requires auth.
- `PATCH /{blog_id}`: Update blog (partial, with file uploads). Requires ownership.
- `DELETE /{blog_id}`: Delete blog. Requires ownership.

### Comments (`/api/comments/`)
- `POST /`: Create comment on blog (content, blog_id). Requires auth.
- `GET /{blog_id}`: Get comments for blog (inferred from structure).

### Likes (`/api/likes/`)
- `POST /`: Like a blog (blog_id). Requires auth.
- `DELETE /{like_id}`: Unlike (inferred).
- Counts integrated into blog endpoints.

File Uploads: Handled via `UploadFile` in FastAPI; files saved to `public/uploads/` and served statically at `/uploads/{filename}`.

## Database Schema
- **Users Table**:
  - id (PK, Integer)
  - username (String, unique)
  - email (String, unique)
  - password (String, hashed)
  - otp (String), otp_expires (String)
  - reset_token (String), reset_expires (String)

- **Blogs Table**:
  - id (PK, Integer)
  - title (String)
  - content (Text)
  - image_url (String, optional)
  - video_url (String, optional)
  - user_id (FK to users.id)

- **Comments Table**:
  - id (PK, Integer)
  - content (Text)
  - user_id (FK to users.id)
  - blog_id (FK to blogs.id)
  - created_at (Timestamp, inferred)

- **Likes Table**:
  - id (PK, Integer)
  - user_id (FK to users.id)
  - blog_id (FK to blogs.id)
  - created_at (Timestamp, inferred)

Relationships:
- User 1:N Blog (author)
- Blog 1:N Comment, 1:N Like
- User 1:N Comment, 1:N Like

## Security
- JWT tokens for authentication (via `python-jose`).
- Password hashing with bcrypt (`passlib`).
- Current user dependency in protected routes.
- CORS restricted to localhost:5173.
- File uploads validated and stored securely.

## Deployment Notes
- Backend: Deploy with Uvicorn/Gunicorn on a server (e.g., Heroku, AWS).
- Frontend: Build and serve static files (e.g., via Nginx).
- Database: Migrate to production MySQL instance.
- Environment: Use `.env` for secrets; enable HTTPS.

## Potential Improvements
- Add pagination for blog lists.
- Implement rate limiting.
- Add search/filter for blogs.
- Unit tests for API and components.
- Email service integration for OTP (using FastAPI-Mail).

For issues or contributions, refer to the codebase structure above.
