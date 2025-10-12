from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from database import Base, engine
from api.auth import router as user_router
from api.blogs import router as blog_router
from api.comments import router as comment_router
from api.likes import router as likes_router

app = FastAPI(title="Blog API")
Base.metadata.create_all(bind=engine)

@app.middleware("http")
async def add_cors_headers(request, call_next):
    if request.method == "OPTIONS":
        response = Response()
        origin = request.headers.get("origin")
        if origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "content-type, authorization, accept, origin, x-requested-with"
        return response
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "content-type, authorization, accept, origin, x-requested-with"
    return response

app.mount("/uploads", StaticFiles(directory="public/uploads"), name="uploads")

app.include_router(user_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(comment_router, prefix="/api")
app.include_router(likes_router, prefix="/api")
