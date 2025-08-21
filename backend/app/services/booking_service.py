from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.schemas.booking import BookingCreate, BookingResponse
from app.db.models.user import User
from app.db.models.booking import Booking
from app.db.models.booking_seat import BookingSeat
from app.db.models.seat import Seat
from app.db.models.bus import Bus
from app.db.models.city import City
import uuid
from datetime import datetime

class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_booking(self, booking_data: BookingCreate, user: User) -> Dict[str, Any]:
        """
        Create a new real booking in the database
        """
        try:
            print(f"=== CREATING REAL BOOKING ===")
            print(f"User: {user.id}")
            print(f"Bus: {booking_data.bus_id}")
            print(f"Seats: {booking_data.seats}")
            print(f"Travel Date: {booking_data.travel_date}")
            
            # Get bus details - convert string ID to UUID
            try:
                bus_uuid = uuid.UUID(booking_data.bus_id)
            except ValueError:
                raise ValueError("Invalid bus ID format")
                
            bus = self.db.query(Bus).filter(Bus.id == bus_uuid).first()
            if not bus:
                raise ValueError("Bus not found")
            
            # Get city details
            from_city = self.db.query(City).filter(City.id == bus.from_city_id).first()
            to_city = self.db.query(City).filter(City.id == bus.to_city_id).first()
            
            # Calculate total amount from actual seat prices
            total_amount = 0
            for seat_no in booking_data.seats:
                seat = self.db.query(Seat).filter(
                    Seat.bus_id == bus_uuid,
                    Seat.seat_no == seat_no
                ).first()
                if seat:
                    total_amount += seat.price
                else:
                    raise ValueError(f"Seat {seat_no} not found")
            
            # Create the booking
            new_booking = Booking(
                id=uuid.uuid4(),
                user_id=user.id,
                bus_id=booking_data.bus_id,
                date=booking_data.travel_date,
                status="CONFIRMED",
                amount=total_amount
            )
            
            self.db.add(new_booking)
            self.db.flush()  # Get the booking ID
            
            # Create booking seats
            for seat_no in booking_data.seats:
                seat = self.db.query(Seat).filter(
                    Seat.bus_id == bus_uuid,
                    Seat.seat_no == seat_no
                ).first()
                
                if seat:
                    # Create booking seat record
                    booking_seat = BookingSeat(
                        id=uuid.uuid4(),
                        booking_id=new_booking.id,
                        seat_id=seat.id
                    )
                    self.db.add(booking_seat)
                    
                    # Update seat availability to False
                    seat.is_available = False
                    print(f"Marked seat {seat_no} as unavailable")
            
            # Commit all changes
            self.db.commit()
            
            print(f"=== BOOKING CREATED SUCCESSFULLY ===")
            print(f"Booking ID: {new_booking.id}")
            print(f"Total Amount: {total_amount}")
            
            # Return the booking response
            return {
                "booking_id": str(new_booking.id),
                "status": "CONFIRMED",
                "amount": total_amount,
                "seats": booking_data.seats,
                "bus_id": str(booking_data.bus_id),
                "travel_date": str(booking_data.travel_date),  # Changed from 'date' to 'travel_date'
                "bus_name": bus.operator,
                "from_city": from_city.name if from_city else "Unknown",
                "to_city": to_city.name if to_city else "Unknown"
            }
            
        except Exception as e:
            self.db.rollback()
            print(f"Error creating booking: {e}")
            raise e
    
    def get_user_bookings(self, user: User) -> List[Dict[str, Any]]:
        """
        Get all real bookings for a user from the database
        """
        try:
            print(f"=== FETCHING REAL BOOKINGS FOR USER {user.id} ===")
            
            # Query real bookings from database
            bookings = self.db.query(Booking).filter(Booking.user_id == user.id).all()
            
            booking_list = []
            for booking in bookings:
                # Get bus details
                bus = self.db.query(Bus).filter(Bus.id == booking.bus_id).first()
                if not bus:
                    continue
                
                # Get city details
                from_city = self.db.query(City).filter(City.id == bus.from_city_id).first()
                to_city = self.db.query(City).filter(City.id == bus.to_city_id).first()
                
                # Get seat numbers for this booking
                booking_seats = self.db.query(BookingSeat).filter(BookingSeat.booking_id == booking.id).all()
                seat_numbers = []
                for bs in booking_seats:
                    seat = self.db.query(Seat).filter(Seat.id == bs.seat_id).first()
                    if seat:
                        seat_numbers.append(seat.seat_no)
                
                booking_info = {
                    "booking_id": str(booking.id),
                    "bus_name": bus.operator,
                    "from_city": from_city.name if from_city else "Unknown",
                    "to_city": to_city.name if to_city else "Unknown",
                    "date": str(booking.date),
                    "seats": seat_numbers,
                    "status": booking.status,
                    "amount": booking.amount
                }
                
                booking_list.append(booking_info)
                print(f"Found booking: {booking_info}")
            
            print(f"Total bookings found: {len(booking_list)}")
            return booking_list
            
        except Exception as e:
            print(f"Error fetching user bookings: {e}")
            return []
