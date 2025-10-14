from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from models import Blog, Like, Comment

def create_blog(db: Session, title, content, image_url, video_url, user_id):
    blog = Blog(title=title, content=content, image_url=image_url, video_url=video_url, user_id=user_id)
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog

def get_all_blogs(db: Session):
    return db.query(Blog).all()

def get_blogs_filtered(db: Session, page: int = 1, limit: int = 10, sort_by: str = 'created_at', order: str = 'desc', search: str = None):
    query = db.query(Blog)

    # Apply search filter
    if search:
        query = query.filter(or_(Blog.title.ilike(f'%{search}%'), Blog.content.ilike(f'%{search}%')))

    # Apply sorting
    if sort_by == 'title':
        order_func = desc if order == 'desc' else asc
        query = query.order_by(order_func(Blog.title))
    elif sort_by == 'created_at':
        order_func = desc if order == 'desc' else asc
        query = query.order_by(order_func(Blog.created_at))
    elif sort_by == 'likes':
        # For likes, we need to join with likes table and count
        query = query.outerjoin(Like).group_by(Blog.id).order_by(desc(db.func.count(Like.id)) if order == 'desc' else asc(db.func.count(Like.id)))
    else:
        query = query.order_by(desc(Blog.created_at))

    # Apply pagination
    offset = (page - 1) * limit
    blogs = query.offset(offset).limit(limit).all()

    # Get total count for pagination
    total_query = db.query(Blog)
    if search:
        total_query = total_query.filter(or_(Blog.title.ilike(f'%{search}%'), Blog.content.ilike(f'%{search}%')))
    total = total_query.count()

    return blogs, total

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
