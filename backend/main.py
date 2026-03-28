"""
main.py — Shopr FastAPI application entry point 
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database.connection import engine, Base
from routes import products, categories, cart, auth, admin

settings = get_settings()


# ── Lifespan: create tables on startup (safe — won't overwrite existing) ─────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Shopr eCommerce API",
    version="2.0.0",
    description="Week 2 — PostgreSQL dynamic backend",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(cart.router,       prefix="/api/cart",       tags=["Cart"])
app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["Admin"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app":     "Shopr eCommerce API",
        "version": "2.0.0",
        "week":    "Week 2 — PostgreSQL Integration",
        "docs":    "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "db": "postgresql"}