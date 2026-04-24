# main.py — FastAPI app entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from database import init_db
from routers import auth, stores, items, categories, employees, orders, attendance, settings

# ── Init DB on startup ────────────────────────────────────────
init_db()

# ── App ───────────────────────────────────────────────────────
app = FastAPI(
    title="1885NY POS API",
    description="Backend for 1885NY Smash Burgers Point of Sale System",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers (must be registered BEFORE static mounts) ─────
app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(items.router)
app.include_router(categories.router)
app.include_router(employees.router)
app.include_router(orders.router)
app.include_router(attendance.router)
app.include_router(settings.router)

# ── Health check ──────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "1885NY POS"}

# ── Static file paths ─────────────────────────────────────────
BACKEND_DIR  = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR  = os.path.dirname(BACKEND_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "ui_kits", "pos-system")
ASSETS_DIR   = os.path.join(PROJECT_DIR, "assets")

# Serve brand assets at /assets (images, logos)
if os.path.isdir(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Serve the POS frontend at / (must be LAST — catches everything else)
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
