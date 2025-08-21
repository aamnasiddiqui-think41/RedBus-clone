from fastapi import FastAPI
from app.routes import user_routes, auth_routes, city_routes, bus_routes, booking_routes
from app.db.session import init_db
from contextlib import asynccontextmanager
import logging

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database initialization failed: {e}")
        print("⚠️ Server will continue with mock data")
    yield
    # on shutdown
    pass

app = FastAPI(title="Bus Booking API", lifespan=lifespan)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(city_routes.router)
app.include_router(bus_routes.router)
app.include_router(booking_routes.router)