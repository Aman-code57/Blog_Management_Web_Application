from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from core.security import get_password_hash, create_access_token, get_current_user
from crud import user_crud
from schemas.user_schema import UserCreate, UserLogin, UserOut, SendOTP, VerifyOTP, ResetPasswordOTP
from fastapi_mail import FastMail, MessageSchema, MessageType
from core.config import conf
import random
import datetime
import secrets


mail = FastMail(conf)


router = APIRouter(prefix="", tags=["Users"])


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    if user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    new_user = user_crud.create_user(db, user.username, user.email, user.password)
    return new_user


@router.post("/login")
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = user_crud.get_user_by_username(db, user.username)
    if not db_user or not db_user.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    import bcrypt
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token(data={"sub": db_user.username, "user_id": db_user.id})
    response.set_cookie(key="access_token", value=token, httponly=True, max_age=7200, secure=False, samesite="lax")
    return {"message": "Login successful"}

@router.post("/send-otp")
async def send_otp_route(request: SendOTP, db: Session = Depends(get_db)):
    result = await send_otp(db, request.email, mail)
    return result


@router.post("/verify-otp")
def verify_otp_route(request: VerifyOTP, db: Session = Depends(get_db)):
    return verify_otp(db, request.email, request.otp)


@router.post("/reset-password-with-otp")
def reset_password_with_otp_route(request: ResetPasswordOTP, db: Session = Depends(get_db)):
    return reset_password_with_otp(db, request.reset_token, request.new_password)


@router.post("/reset-password")
def reset_password_route(request: ResetPasswordOTP, db: Session = Depends(get_db)):
    return reset_password(db, request.reset_token, request.new_password)

@router.get("/me", response_model=UserOut)
def get_me(request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    return UserOut.model_validate(current_user)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


async def send_otp(db, email, mail):
    user = user_crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=400, detail="Email not registered")

    otp = str(random.randint(100000, 999999))
    expires = (datetime.datetime.now() + datetime.timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")
    user_crud.set_otp(db, email, otp, expires)

    message = MessageSchema(
    subject="Your OTP for Password Reset",
    recipients=[email],
    body=f"Your OTP is {otp}. It expires in 10 minutes.",
    subtype=MessageType.plain  # add this!
    )

    await mail.send_message(message)
    return {"status": "success", "message": "OTP sent to your email"}


def verify_otp(db, email, otp):
    if user_crud.verify_otp(db, email, otp):
        reset_token = secrets.token_urlsafe(32)
        expires = (datetime.datetime.now() + datetime.timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")
        user_crud.set_reset_token(db, email, reset_token, expires)
        return {"status": "success", "reset_token": reset_token}
    else:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")


def reset_password_with_otp(db, reset_token, new_password):
    user = user_crud.verify_reset_token(db, reset_token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user_crud.update_password_by_email(db, user.email, new_password)
    return {"status": "success", "message": "Password reset successfully"}


def reset_password(db, reset_token, new_password):
    user = user_crud.verify_reset_token(db, reset_token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user_crud.update_password_by_email(db, user.email, new_password)
    return {"status": "success", "message": "Password reset successfully"}
