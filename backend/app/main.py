from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user_routes, auth_routes, city_routes, bus_routes, booking_routes
from app.db.session import init_db
from contextlib import asynccontextmanager
from app.core.logging import logger

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

logger.info("Registering routers")
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(city_routes.router)
app.include_router(bus_routes.router)
app.include_router(booking_routes.router)
logger.info("Routers registered")