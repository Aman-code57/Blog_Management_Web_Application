from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import Response

class CORSHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
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

def setup_cors(app):
    app.add_middleware(CORSHeadersMiddleware)
