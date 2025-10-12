from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from core.security import get_current_user
from crud import comments_crud
import models

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/blog/{blog_id}")
def get_comments(blog_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).options(joinedload(models.Comment.user)).filter(models.Comment.blog_id == blog_id).all()
    result = []
    for c in comments:
        c_dict = c.__dict__.copy()
        c_dict["username"] = c.user.username if c.user else None
        c_dict["parent_comment_id"] = c.parent_comment_id
        result.append(c_dict)
    return result


@router.post("/blog/{blog_id}")
def add_comment(blog_id: int, comment: dict, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    parent_id = comment.get("parent_id")
    if parent_id:
        parent = db.query(models.Comment).filter(models.Comment.id == parent_id, models.Comment.blog_id == blog_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    new_comment = comments_crud.create_comment(db, comment["content"], blog_id, current_user.id, parent_id)
    return new_comment


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = db.query(models.Comment).options(joinedload(models.Comment.blog)).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id and comment.blog.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    comments_crud.delete_comment(db, comment)
    return {"message": "Comment deleted successfully"}
