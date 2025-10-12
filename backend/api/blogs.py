from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from database import get_db
from core.security import get_current_user
from crud import blogs_crud, likes_crud, comments_crud
import models
import os, shutil

router = APIRouter(prefix="/blogs", tags=["Blogs"])
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/")
def get_blogs(db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).options(joinedload(models.Blog.author)).all()
    result = []
    for blog in blogs:
        blog_dict = blog.__dict__.copy()
        blog_dict["author_username"] = blog.author.username if blog.author else None
        blog_dict["likes_count"] = likes_crud.count_likes(db, blog.id)
        blog_dict["comments_count"] = db.query(models.Comment).filter(models.Comment.blog_id == blog.id).count()
        result.append(blog_dict)
    return result


@router.get("/user/{user_id}")
def get_blogs_by_user(user_id: int, db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).filter(models.Blog.user_id == user_id).all()
    result = []
    for blog in blogs:
        blog_dict = blog.__dict__.copy()
        blog_dict["likes_count"] = likes_crud.count_likes(db, blog.id)
        blog_dict["comments_count"] = db.query(models.Comment).filter(models.Comment.blog_id == blog.id).count()
        result.append(blog_dict)
    return result


@router.get("/{blog_id}")
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).options(joinedload(models.Blog.author)).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    likes = likes_crud.count_likes(db, blog_id)
    comments = db.query(models.Comment).filter(models.Comment.blog_id == blog_id).count()
    return {
        "id": blog.id,
        "title": blog.title,
        "content": blog.content,
        "image_url": blog.image_url,
        "video_url": blog.video_url,
        "author_id": blog.user_id,
        "author_username": blog.author.username if blog.author else None,
        "likes_count": likes,
        "comments_count": comments,
    }


@router.post("/")
def create_blog(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    video: UploadFile | None = File(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_url, video_url = None, None

    if image:
        path = os.path.join(UPLOAD_DIR, image.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/uploads/{image.filename}"

    if video:
        path = os.path.join(UPLOAD_DIR, video.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(video.file, f)
        video_url = f"/uploads/{video.filename}"

    return blogs_crud.create_blog(db, title, content, image_url, video_url, current_user.id)


@router.patch("/{blog_id}")
def update_blog(
    blog_id: int,
    title: str = Form(None),
    content: str = Form(None),
    image: UploadFile | None = File(None),
    video: UploadFile | None = File(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    blog = blogs_crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    image_url = blog.image_url
    video_url = blog.video_url

    if image:
        path = os.path.join(UPLOAD_DIR, image.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/uploads/{image.filename}"

    if video:
        path = os.path.join(UPLOAD_DIR, video.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(video.file, f)
        video_url = f"/uploads/{video.filename}"

    updated_blog = blogs_crud.update_blog(db, blog_id, title or blog.title, content or blog.content, image_url, video_url)
    return updated_blog


@router.delete("/{blog_id}")
def delete_blog(blog_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    blog = blogs_crud.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    if blog.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    blogs_crud.delete_blog(db, blog)
    return {"message": "Blog deleted successfully"}






