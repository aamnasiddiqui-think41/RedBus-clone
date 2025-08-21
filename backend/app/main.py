# app/main.py

from fastapi import FastAPI
from app.db.session import init_db
from sqlalchemy import text
from app.db.session import engine

app = FastAPI(title="RedBus Clone API", version="1.0.0")

@app.on_event("startup")
async def on_startup():
    # In dev, this will create tables for any imported models.
    # In prod, you'll use Alembic migrations instead.
    init_db()

@app.get("/")
def health_check():
    return {"status": "ok", "message": "RedBus Clone API is running"}

# Optional: DB ping endpoint (remove in prod)
@app.get("/__db/ping")
def db_ping():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar_one()
        return {"db": "ok", "select_1": result}
