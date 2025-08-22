from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import user_routes, auth_routes, city_routes, bus_routes, booking_routes
from app.db.session import init_db
from contextlib import asynccontextmanager
from app.core.logging import logger
import os
from pathlib import Path

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.exception("Database initialization failed: {error}", error=e)
        logger.warning("Server will continue with mock data")
    yield
    # on shutdown
    logger.info("Shutting down application")

app = FastAPI(title="Bus Booking API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes under /api prefix
logger.info("Registering routers")
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(city_routes.router)
app.include_router(bus_routes.router)
app.include_router(booking_routes.router)
logger.info("Routers registered")

# Static files configuration
STATIC_DIR = Path(__file__).parent.parent / "static"
INDEX_FILE = STATIC_DIR / "index.html"

# Create static directory if it doesn't exist
STATIC_DIR.mkdir(exist_ok=True)

# Mount static files for assets (CSS, JS, images, etc.)
if STATIC_DIR.exists() and (STATIC_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    logger.info(f"Static files mounted from {STATIC_DIR}")

# Catch-all route for SPA (Single Page Application)
# This should be the last route to avoid conflicts
@app.get("/{full_path:path}")
async def serve_spa(request: Request, full_path: str):
    """
    Serve the React SPA for all non-API routes
    """
    # Don't serve SPA for API routes
    if full_path.startswith("api/"):
        return {"error": "API endpoint not found"}
    
    # Serve index.html for all other routes (SPA routing)
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    else:
        return {"message": "Frontend not built yet. Please build the React app first."}

logger.info("SPA routing configured")