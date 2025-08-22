from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.bus import BusSearchRequest, BusSearchResponse, SeatLayoutResponse
from app.services.bus_service import BusService
from datetime import date
from typing import Optional
from app.core.logging import logger

router = APIRouter(prefix="/api", tags=["buses"])

@router.get("/debug/seats/{bus_id}")
def debug_seats(bus_id: str, db: Session = Depends(get_db)):
    """
    Debug endpoint to test seat fetching
    """
    try:
        from app.db.models.seat import Seat
        import uuid
        
        bus_uuid = uuid.UUID(bus_id)
        seats = db.query(Seat).filter(Seat.bus_id == bus_uuid).all()
        return {
            "bus_id": bus_id,
            "seats_found": len(seats),
            "seats": [
                {
                    "id": str(seat.id),
                    "seat_no": seat.seat_no,
                    "seat_type": seat.seat_type,
                    "price": seat.price,
                    "is_available": seat.is_available
                }
                for seat in seats
            ]
        }
    except Exception as e:
        logger.exception("Failed to debug seats for bus_id={bus_id}: {error}", bus_id=bus_id, error=e)
        raise HTTPException(status_code=500, detail="Failed to fetch seats for debug")

@router.post("/search-buses", response_model=BusSearchResponse)
def search_buses(search_request: BusSearchRequest, db: Session = Depends(get_db)):
    """
    Search for buses based on route and date
    """
    try:
        service = BusService(db)
        buses = service.search_buses(search_request)
        if not buses:
            return {"buses": [], "message": "No buses found for the selected route and date"}
        return {"buses": buses, "message": f"Found {len(buses)} buses for your journey"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Search buses failed: {error}", error=e)
        raise HTTPException(status_code=500, detail="Failed to search buses")

@router.get("/bus/{bus_id}/seats", response_model=SeatLayoutResponse)
def get_seat_layout(
    bus_id: str, 
    travel_date: Optional[date] = Query(None, description="Travel date to check seat availability"),
    db: Session = Depends(get_db)
):
    """
    Get seat layout for a specific bus with real-time availability
    """
    try:
        service = BusService(db)
        seat_layout = service.get_seat_layout(bus_id, travel_date)
        if not seat_layout:
            raise HTTPException(status_code=404, detail="Invalid bus ID")
        return seat_layout
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Fetch seat layout failed for bus_id={bus_id}: {error}", bus_id=bus_id, error=e)
        raise HTTPException(status_code=500, detail="Failed to fetch seat layout")
