from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from api.auth import router as user_router
from api.blogs import router as blog_router
from api.comments import router as comment_router
from api.likes import router as likes_router

app = FastAPI(title="Blog API")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["content-type", "authorization", "accept", "origin", "x-requested-with"],
)

app.mount("/uploads", StaticFiles(directory="public/uploads"), name="uploads")

app.include_router(user_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(comment_router, prefix="/api")
app.include_router(likes_router, prefix="/api")
