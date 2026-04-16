import logging
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        allowed_origins: list[str] = None,
    ):
        super().__init__(app)
        self.allowed_origins = allowed_origins or ["*"]

    async def dispatch(self, request: Request, call_next):
        # Allow safe methods
        if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
            return await call_next(request)

        # Check Origin header
        origin = request.headers.get("Origin")
        referer = request.headers.get("Referer")

        # If Origin is present, it must be in the allowed_origins
        if origin:
            if "*" not in self.allowed_origins and origin not in self.allowed_origins:
                logger.warning(f"CSRF block: Origin {origin} not allowed")
                return JSONResponse(
                    status_code=403,
                    content={"detail": f"CSRF block: Origin {origin} not allowed"}
                )
        elif referer:
            # Fallback to Referer check if Origin is missing
            is_allowed = False
            for allowed in self.allowed_origins:
                if allowed == "*" or referer.startswith(allowed):
                    is_allowed = True
                    break
            if not is_allowed:
                logger.warning(f"CSRF block: Referer {referer} not allowed")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF block: Referer not allowed"}
                )
        else:
            # Strict mode: block if both Origin and Referer are missing for state-changing requests
            # (Optional, but safer for API-only backends)
            logger.warning("CSRF block: Both Origin and Referer are missing")
            return JSONResponse(
                status_code=403,
                content={"detail": "CSRF block: Origin or Referer header required"}
            )

        return await call_next(request)
