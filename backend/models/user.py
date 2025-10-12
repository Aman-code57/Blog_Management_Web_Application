from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    otp = Column(String(6), nullable=True)
    otp_expires = Column(String(50), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_expires = Column(String(50), nullable=True)

    blogs = relationship("Blog", back_populates="author")
    comments = relationship("Comment", back_populates="user")
    likes = relationship("Like", back_populates="user")
