from sqlalchemy.orm import Session
from models import Comment

def create_comment(db: Session, content: str, blog_id: int, user_id: int, parent_comment_id=None):
    comment = Comment(content=content, blog_id=blog_id, user_id=user_id, parent_comment_id=parent_comment_id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def delete_comment(db: Session, comment):
    db.delete(comment)
    db.commit()
