from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from core.security import get_current_user
from crud import likes_crud
from models import Blog

router = APIRouter(prefix="/likes", tags=["Likes"])


@router.get("/blog/{blog_id}")
def get_like_status(blog_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    is_liked = likes_crud.is_liked(db, blog_id, current_user.id)
    likes_count = likes_crud.count_likes(db, blog_id)
    return {"is_liked": is_liked, "likes_count": likes_count}

@router.post("/blog/{blog_id}")
def toggle_like(blog_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    liked = likes_crud.toggle_like(db, blog_id, current_user.id)
    count = likes_crud.count_likes(db, blog_id)
    return {"liked": liked, "likes_count": count}
