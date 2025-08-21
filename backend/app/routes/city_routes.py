from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.city import CityListResponse
from app.services.city_service import CityService

router = APIRouter(prefix="/api", tags=["cities"])

@router.get("/cities", response_model=CityListResponse)
def get_cities(db: Session = Depends(get_db)):
    """
    Get all available cities
    """
    try:
        service = CityService(db)
        cities = service.get_all_cities()
        return {"cities": cities}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch cities")
