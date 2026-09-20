import time
from collections import defaultdict
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from api.middleware.limiter import http_limiter


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    MVP Fixed Window Rate Limiter.
    Limits intensive HTTP routes via shared FixedWindowLimiter.
    """
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        # Keep constructor compat; shared limiter is the source of truth
        http_limiter.max_requests = max_requests
        http_limiter.window_seconds = window_seconds
        self.protected_routes = ["/comparisons", "/runs", "/screenshots"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        needs_limit = any(path.startswith(r) for r in self.protected_routes)
        if not needs_limit:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        if not http_limiter.allow(client_ip):
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."}
            )

        return await call_next(request)
