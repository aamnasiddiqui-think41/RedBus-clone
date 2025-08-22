from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.schemas.bus import BusSearchRequest, BusResponse, SeatResponse
from app.db.models.bus import Bus
from app.db.models.city import City
from app.db.models.seat import Seat
from app.db.models.booking import Booking
from app.db.models.booking_seat import BookingSeat
from app.db.models.trip import Trip
from datetime import date
import uuid

class BusService:
    def __init__(self, db: Session):
        self.db = db
    
    def search_buses(self, search_request: BusSearchRequest) -> List[Dict[str, Any]]:
        """
        Search for buses based on route and date from the database
        """
        try:
            # Query buses from database based on from_city_id and to_city_id
            query = self.db.query(Bus).filter(
                Bus.from_city_id == search_request.from_city_id,
                Bus.to_city_id == search_request.to_city_id
            )
            
            # If date is provided, only show buses that have trips on that date
            if search_request.actual_date:
                query = query.join(Trip, Trip.bus_id == Bus.id).filter(
                    Trip.service_date == search_request.actual_date
                )
            
            buses = query.all()
            
            # Convert to response format
            filtered_buses = []
            for bus in buses:
                filtered_bus = {
                    "id": str(bus.id),
                    "operator": bus.operator,
                    "departure_time": bus.departure_time,
                    "arrival_time": bus.arrival_time,
                    "duration": bus.duration or "N/A",
                    "fare": bus.fare,
                    "rating": bus.rating or 0.0
                }
                filtered_buses.append(filtered_bus)
            
            print(f"Found {len(filtered_buses)} buses for route {search_request.from_city_id} -> {search_request.to_city_id}")
            print(f"Search date: {search_request.actual_date}")
            
            # If no buses found, return a special message
            if not filtered_buses:
                print("No buses found for this route")
                return []
            
            return filtered_buses
            
        except Exception as e:
            print(f"Error searching buses: {e}")
            # Fallback to empty list if database query fails
            return []
    
    def get_seat_layout(self, bus_id: str, travel_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Get seat layout for a specific bus with real-time availability
        """
        try:
            print(f"=== DEBUG: Fetching seats for bus {bus_id} ===")
            print(f"Travel date: {travel_date}")
            
            # Convert string bus_id to UUID for database query
            try:
                bus_uuid = uuid.UUID(bus_id)
            except ValueError:
                print(f"Invalid bus_id format: {bus_id}")
                return {"bus_id": bus_id, "seats": []}
            
            # Get all seats for this bus
            seats = self.db.query(Seat).filter(Seat.bus_id == bus_uuid).all()
            print(f"Raw seats from database: {len(seats)} found")
            
            if not seats:
                print(f"No seats found for bus {bus_id}")
                return {"bus_id": bus_id, "seats": []}
            
            # Check which seats are actually booked for the given date
            booked_seat_ids = set()
            if travel_date:
                print(f"Checking bookings for date: {travel_date}")
                # Query bookings table for this bus and date
                bookings = self.db.query(Booking).filter(
                    Booking.bus_id == bus_uuid,
                    Booking.date == travel_date,  # Use 'date' field from Booking model
                    Booking.status == 'CONFIRMED'
                ).all()
                
                print(f"Found {len(bookings)} confirmed bookings for this date")
                
                # Get all booked seat IDs
                for booking in bookings:
                    booking_seats = self.db.query(BookingSeat).filter(
                        BookingSeat.booking_id == booking.id
                    ).all()
                    for booking_seat in booking_seats:
                        booked_seat_ids.add(str(booking_seat.seat_id))
                
                print(f"Booked seat IDs: {booked_seat_ids}")
            else:
                print("No travel date provided, assuming all seats are available")
            
            # Convert seats to response format with real-time availability
            seat_responses = []
            for seat in seats:
                # A seat is available if it's NOT in the booked_seat_ids set
                is_available = str(seat.id) not in booked_seat_ids
                
                seat_response = {
                    "id": str(seat.id),
                    "seat_no": seat.seat_no,
                    "seat_type": seat.seat_type,
                    "price": seat.price,
                    "is_available": is_available
                }
                seat_responses.append(seat_response)
                print(f"Seat {seat.seat_no}: {seat.seat_type} - ₹{seat.price} - Available: {is_available}")
            
            print(f"Final response: {len(seat_responses)} seats")
            print(f"Available seats: {sum(1 for s in seat_responses if s['is_available'])}")
            
            return {
                "bus_id": bus_id,
                "seats": seat_responses
            }
            
        except Exception as e:
            print(f"Error fetching seat layout: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to empty list if database query fails
            return {"bus_id": bus_id, "seats": []}
