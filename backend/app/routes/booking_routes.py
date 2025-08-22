from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.booking import BookingCreate, BookingResponse, BookingListResponse, CancelBookingResponse
from app.services.booking_service import BookingService
from app.db.models.user import User
from app.deps import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api", tags=["bookings"])

@router.post("/book", response_model=BookingResponse, status_code=201)
def book_ticket(
    booking_data: BookingCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Book a ticket - requires authentication
    """
    try:
        logger.info("Booking request received for user={user_id}", user_id=current_user.id)
        service = BookingService(db)
        booking = service.create_booking(booking_data, current_user)
        logger.info("Booking created successfully booking_id={booking_id}", booking_id=booking["booking_id"])
        return booking
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Booking failed: {error}", error=e)
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@router.get("/debug", response_model=dict)
def debug_auth(current_user: User = Depends(get_current_user)):
    """
    Simple debug endpoint to test authentication
    """
    return {
        "message": "Authentication successful",
        "user_id": str(current_user.id),
        "user_phone": current_user.phone,
        "user_name": current_user.name
    }

@router.get("/bookings", response_model=BookingListResponse)
def get_my_bookings(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings for the authenticated user
    """
    try:
        logger.info("Fetching bookings for user={user_id}", user_id=current_user.id)
        service = BookingService(db)
        bookings = service.get_user_bookings(current_user)
        logger.info("Found {count} bookings for user={user_id}", count=len(bookings), user_id=current_user.id)
        return {"bookings": bookings}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to fetch bookings: {error}", error=e)
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")

@router.delete("/bookings/{booking_id}", response_model=CancelBookingResponse)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a booking - requires authentication and ownership
    """
    try:
        logger.info("Cancel booking request received for user={user_id} booking_id={booking_id}", 
                   user_id=current_user.id, booking_id=booking_id)
        service = BookingService(db)
        result = service.cancel_booking(booking_id, current_user)
        logger.info("Booking cancelled successfully booking_id={booking_id}", booking_id=booking_id)
        return result
    except ValueError as e:
        logger.warning("Invalid cancel request: {error}", error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to cancel booking: {error}", error=e)
        raise HTTPException(status_code=500, detail=f"Failed to cancel booking: {str(e)}")
