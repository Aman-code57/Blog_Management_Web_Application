from sqlalchemy.orm import Session
from models import User
from core.security import get_password_hash
import datetime

def create_user(db: Session, username: str, email: str, password: str):
    new_user = User(username=username, email=email, password=get_password_hash(password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def set_otp(db: Session, email: str, otp: str, expires: str):
    user = get_user_by_email(db, email)
    if user:
        user.otp = otp
        user.otp_expires = expires
        db.commit()

def verify_otp(db: Session, email: str, otp: str):
    user = get_user_by_email(db, email)
    if user and user.otp == otp:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if user.otp_expires > now:
            return True
    return False

def set_reset_token(db: Session, email: str, token: str, expires: str):
    user = get_user_by_email(db, email)
    if user:
        user.reset_token = token
        user.reset_expires = expires
        db.commit()

def verify_reset_token(db: Session, token: str):
    user = db.query(User).filter(User.reset_token == token).first()
    if user:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if user.reset_expires > now:
            return user
    return None

def update_password_by_email(db: Session, email: str, new_password: str):
    user = get_user_by_email(db, email)
    if user:
        user.password = get_password_hash(new_password)
        user.otp = None
        user.otp_expires = None
        user.reset_token = None
        user.reset_expires = None
        db.commit()
        return user
    return None
