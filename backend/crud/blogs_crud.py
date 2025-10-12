from sqlalchemy.orm import Session
from models import Blog, Like, Comment

def create_blog(db: Session, title, content, image_url, video_url, user_id):
    blog = Blog(title=title, content=content, image_url=image_url, video_url=video_url, user_id=user_id)
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

def get_all_blogs(db: Session):
    return db.query(Blog).all()

def get_blog_by_id(db: Session, blog_id: int):
    return db.query(Blog).filter(Blog.id == blog_id).first()

def update_blog(db: Session, blog_id: int, title: str, content: str, image_url: str, video_url: str):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog:
        blog.title = title
        blog.content = content
        blog.image_url = image_url
        blog.video_url = video_url
        db.commit()
        db.refresh(blog)
    return blog

def delete_blog(db: Session, blog):
    db.delete(blog)
    db.commit()
