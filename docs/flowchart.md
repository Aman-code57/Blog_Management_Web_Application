# Technical Flowchart: Blog Management App

Below are Mermaid diagrams representing the technical flowcharts for the Blog Management App.

## 1. System Architecture Flowchart (Three-Tier Architecture)

```mermaid
graph TD
    A[User] --> B[Presentation Tier: React SPA]
    B --> C[Application Tier: FastAPI API]
    C --> D[Data Tier: MySQL Database]

    B --> E[HTTP Requests/Responses]
    E --> C

    C --> F[SQLAlchemy ORM]
    F --> D

    D --> G[Data Persistence]
    G --> F

    C --> H[Business Logic & Authentication]
    H --> I[JWT Tokens, File Uploads, Email]

    B --> J[Client-Side Routing & UI]
    J --> K[React Components & Pages]
```

### Explanation:
- **User**: Interacts with the frontend.
- **Presentation Tier**: React app handles UI, sends API calls to backend.
- **Application Tier**: FastAPI processes requests, validates data, handles auth, interacts with DB via ORM.
- **Data Tier**: MySQL stores data; accessed via SQLAlchemy.

## 2. User Interaction Flowchart (Blog Creation & Viewing)

```mermaid
flowchart TD
    Start([User Visits App]) --> Login{Logged In?}
    Login -->|No| Register[Register Account]
    Register --> Login
    Login -->|Yes| Home[Homepage: View Blogs]

    Home --> CreateBlog[Create Blog Page]
    CreateBlog --> SubmitBlog[Submit Blog Form]
    SubmitBlog --> UploadFiles{Upload Files?}
    UploadFiles -->|Yes| SaveFiles[Save Image/Video to /uploads]
    UploadFiles -->|No| SaveBlog[Save Blog to DB]
    SaveFiles --> SaveBlog
    SaveBlog --> Home

    Home --> ViewBlog[Select Blog to Read]
    ViewBlog --> DisplayBlog[Display Blog Content]
    DisplayBlog --> Interact{Interact?}
    Interact -->|Like| LikeBlog[Like Blog]
    Interact -->|Comment| CommentBlog[Comment on Blog]
    Interact -->|No| Home

    LikeBlog --> UpdateLikes[Update Likes in DB]
    CommentBlog --> SaveComment[Save Comment in DB]
    UpdateLikes --> DisplayBlog
    SaveComment --> DisplayBlog

    Home --> Profile[View Profile]
    Profile --> MyBlogs[View User's Blogs]
    MyBlogs --> EditBlog{Edit Blog?}
    EditBlog -->|Yes| UpdateBlog[Update Blog]
    UpdateBlog --> MyBlogs
    EditBlog -->|No| Home
```

### Explanation:
- Illustrates a typical user journey: registration/login, browsing blogs, creating/editing blogs, interacting with likes/comments.
- Highlights key actions and data flows (e.g., file uploads, DB saves).

## 3. API Request Flowchart (Example: Creating a Blog)

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant F as React Frontend
    participant B as FastAPI Backend
    participant DB as MySQL Database

    U->>F: Fill Blog Form & Submit
    F->>B: POST /api/blogs (with form data, files, JWT)
    B->>B: Validate JWT & User
    B->>B: Process File Uploads (save to /uploads)
    B->>DB: Insert Blog Record
    DB-->>B: Success
    B-->>F: Blog Created Response
    F-->>U: Redirect to Homepage
```

### Explanation:
- Sequence diagram for a specific API interaction, showing request flow from frontend to backend to DB.

To render these diagrams, use a Mermaid-compatible viewer (e.g., GitHub, Mermaid Live Editor, or VSCode extension).
