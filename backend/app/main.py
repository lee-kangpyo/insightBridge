import asyncio
import logging
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import (
    overview,
    query,
    rankings,
    insights,
    theme,
    admission,
    auth,
    menu,
    admin,
    admin_contents,
)
from .database import close_pool
from .middleware.csrf import CSRFMiddleware
from .config import settings

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI()

_main_loop = None


@app.on_event("startup")
async def startup():
    global _main_loop
    _main_loop = asyncio.get_running_loop()
    from . import database

    database._main_loop = _main_loop


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CSRFMiddleware,
    allowed_origins=settings.allowed_origins,
)

app.include_router(query.router)
app.include_router(rankings.router)
app.include_router(overview.router)
app.include_router(insights.router)
app.include_router(theme.router)
app.include_router(admission.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api", tags=["menu"])
app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(admin_contents.router, prefix="/api", tags=["admin"])


@app.on_event("shutdown")
async def shutdown():
    await close_pool()


@app.get("/")
async def root():
    return {"message": "InsightBridge API"}


def get_main_loop():
    return _main_loop
