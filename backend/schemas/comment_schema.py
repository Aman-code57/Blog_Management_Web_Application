from pydantic import BaseModel
from typing import Optional

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentOut(BaseModel):
    id: int
    content: str
    username: Optional[str]
    parent_comment_id: Optional[int]

    class Config:
        from_attributes = True
