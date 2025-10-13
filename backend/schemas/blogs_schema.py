from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BlogCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class BlogOut(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str]
    video_url: Optional[str]
    author_username: Optional[str]
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True
