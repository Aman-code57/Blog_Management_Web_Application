from pydantic import BaseModel

class LikeOut(BaseModel):
    likes_count: int
