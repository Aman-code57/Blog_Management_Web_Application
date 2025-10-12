from sqlalchemy.orm import Session
from models import Like

def toggle_like(db: Session, blog_id: int, user_id: int):
    existing_like = db.query(Like).filter(Like.blog_id == blog_id, Like.user_id == user_id).first()
    if existing_like:
        db.delete(existing_like)
        db.commit()
        return False
    new_like = Like(blog_id=blog_id, user_id=user_id)
    db.add(new_like)
    db.commit()
    return True

def count_likes(db: Session, blog_id: int):
    return db.query(Like).filter(Like.blog_id == blog_id).count()

def is_liked(db: Session, blog_id: int, user_id: int | None) -> bool:
    if user_id is None:
        return False
    existing_like = db.query(Like).filter(Like.blog_id == blog_id, Like.user_id == user_id).first()
    return existing_like is not None
