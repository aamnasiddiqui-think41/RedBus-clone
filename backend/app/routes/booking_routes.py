from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.booking import BookingCreate, BookingResponse, BookingListResponse
from app.services.booking_service import BookingService
from app.db.models.user import User
from app.deps import get_current_user

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
        print(f"=== BOOKING ROUTE DEBUG ===")
        print(f"Received booking data: {booking_data}")
        print(f"Current user: {current_user.id}")
        print(f"User authenticated: {current_user is not None}")
        
        service = BookingService(db)
        booking = service.create_booking(booking_data, current_user)
        
        print(f"=== BOOKING CREATED SUCCESSFULLY ===")
        print(f"Returning: {booking}")
        
        return booking
    except Exception as e:
        print(f"=== BOOKING ROUTE ERROR ===")
        print(f"Error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@router.get("/bookings", response_model=BookingListResponse)
def get_my_bookings(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings for the authenticated user
    """
    try:
        print(f"=== BACKEND: get_my_bookings called ===")
        print(f"Current user ID: {current_user.id}")
        print(f"Current user phone: {current_user.phone}")
        print(f"Current user name: {current_user.name}")
        
        service = BookingService(db)
        bookings = service.get_user_bookings(current_user)
        
        print(f"Bookings found for user {current_user.id}: {len(bookings)}")
        for booking in bookings:
            print(f"  - {booking['booking_id']}: {booking['bus_name']} ({booking['from_city']} → {booking['to_city']})")
        
        return {"bookings": bookings}
    except Exception as e:
        print(f"=== BACKEND ERROR: Failed to fetch bookings ===")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")
