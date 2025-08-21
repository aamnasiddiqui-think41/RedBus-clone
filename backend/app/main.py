from fastapi import FastAPI
from app.routes import user_routes, auth_routes
from app.db.session import init_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup
    init_db()
    yield
    # on shutdown
    pass

app = FastAPI(title="Bus Booking API", lifespan=lifespan)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)