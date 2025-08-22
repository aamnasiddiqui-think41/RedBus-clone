#!/usr/bin/env python3
"""
Seed script to populate the database with sample data for demo
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import get_db
from app.db.models.city import City
from app.db.models.bus import Bus
from app.db.models.seat import Seat
from app.db.models.trip import Trip
from app.db.models.user import User
from datetime import date, timedelta
import uuid
from loguru import logger

def seed_database():
    """Populate database with sample data"""
    logger.info("Starting database seeding...")
    
    db = next(get_db())
    
    try:
        # Clear existing data (optional)
        logger.info("Clearing existing data...")
        db.query(Trip).delete()
        db.query(Seat).delete()
        db.query(Bus).delete()
        db.query(City).delete()
        db.query(User).delete()
        db.commit()
        
        # 1. Add Cities
        logger.info("Adding cities...")
        cities_data = [
            ("Mumbai", "Maharashtra"),
            ("Delhi", "Delhi"),
            ("Bangalore", "Karnataka"),
            ("Chennai", "Tamil Nadu"),
            ("Hyderabad", "Telangana"),
            ("Pune", "Maharashtra"),
            ("Kolkata", "West Bengal"),
            ("Ahmedabad", "Gujarat"),
            ("Jaipur", "Rajasthan"),
            ("Surat", "Gujarat")
        ]
        
        cities = {}
        for city_name, state in cities_data:
            city = City(
                id=uuid.uuid4(),
                name=city_name,
                state=state
            )
            db.add(city)
            cities[city_name] = city
        
        db.commit()
        logger.info(f"Added {len(cities)} cities")
        
        # 2. Add Buses
        logger.info("Adding buses...")
        buses_data = [
            ("VRL Travels", "Mumbai", "Bangalore", "22:30", "10:30", "12h", 1200.0, 4.5),
            ("RedBus Express", "Delhi", "Mumbai", "20:00", "12:00", "16h", 1500.0, 4.2),
            ("SRS Travels", "Bangalore", "Chennai", "23:00", "07:00", "8h", 800.0, 4.3),
            ("Orange Travels", "Hyderabad", "Bangalore", "21:30", "06:30", "9h", 900.0, 4.1),
            ("Shama Travels", "Pune", "Mumbai", "06:00", "09:30", "3.5h", 400.0, 4.0),
            ("KSRTC", "Bangalore", "Hyderabad", "22:00", "07:00", "9h", 950.0, 4.4),
            ("Raj Travels", "Delhi", "Jaipur", "07:00", "12:00", "5h", 600.0, 4.2),
            ("Gujarat Travels", "Ahmedabad", "Mumbai", "21:00", "07:00", "10h", 1000.0, 4.3),
            ("Volvo Express", "Chennai", "Bangalore", "23:30", "07:30", "8h", 850.0, 4.6),
            ("Super Fast", "Mumbai", "Pune", "08:00", "11:00", "3h", 350.0, 4.1)
        ]
        
        buses = []
        for operator, from_city, to_city, dep_time, arr_time, duration, fare, rating in buses_data:
            bus = Bus(
                id=uuid.uuid4(),
                operator=operator,
                from_city_id=cities[from_city].id,
                to_city_id=cities[to_city].id,
                departure_time=dep_time,
                arrival_time=arr_time,
                duration=duration,
                fare=fare,
                rating=rating
            )
            db.add(bus)
            buses.append(bus)
        
        db.commit()
        logger.info(f"Added {len(buses)} buses")
        
        # 3. Add Seats for each bus
        logger.info("Adding seats...")
        seat_layouts = [
            # Layout 1: Standard AC Sleeper (36 seats)
            [("S1", "Lower"), ("S2", "Lower"), ("S3", "Upper"), ("S4", "Upper"),
             ("S5", "Lower"), ("S6", "Lower"), ("S7", "Upper"), ("S8", "Upper"),
             ("S9", "Lower"), ("S10", "Lower"), ("S11", "Upper"), ("S12", "Upper"),
             ("S13", "Lower"), ("S14", "Lower"), ("S15", "Upper"), ("S16", "Upper"),
             ("S17", "Lower"), ("S18", "Lower"), ("S19", "Upper"), ("S20", "Upper"),
             ("S21", "Lower"), ("S22", "Lower"), ("S23", "Upper"), ("S24", "Upper"),
             ("S25", "Lower"), ("S26", "Lower"), ("S27", "Upper"), ("S28", "Upper"),
             ("S29", "Lower"), ("S30", "Lower"), ("S31", "Upper"), ("S32", "Upper"),
             ("S33", "Lower"), ("S34", "Lower"), ("S35", "Upper"), ("S36", "Upper")],
        ]
        
        total_seats = 0
        for bus in buses:
            layout = seat_layouts[0]  # Use same layout for all buses for simplicity
            for seat_no, seat_type in layout:
                # Vary prices based on seat type
                base_price = bus.fare
                if seat_type == "Lower":
                    price = base_price * 0.9  # Lower berths cheaper
                else:
                    price = base_price  # Upper berths standard price
                
                seat = Seat(
                    id=uuid.uuid4(),
                    bus_id=bus.id,
                    seat_no=seat_no,
                    seat_type=seat_type,
                    price=round(price, 2)
                )
                db.add(seat)
                total_seats += 1
        
        db.commit()
        logger.info(f"Added {total_seats} seats")
        
        # 4. Add Trips (for next 30 days)
        logger.info("Adding trips...")
        today = date.today()
        total_trips = 0
        
        for bus in buses:
            # Each bus runs every day for the next 30 days
            for day_offset in range(30):
                service_date = today + timedelta(days=day_offset)
                trip = Trip(
                    id=uuid.uuid4(),
                    bus_id=bus.id,
                    service_date=service_date,
                    departure_time=bus.departure_time,
                    arrival_time=bus.arrival_time,
                    status="ACTIVE"
                )
                db.add(trip)
                total_trips += 1
        
        db.commit()
        logger.info(f"Added {total_trips} trips")
        
        # 5. Add a sample user
        logger.info("Adding sample user...")
        sample_user = User(
            id=uuid.uuid4(),
            phone="9876543210",
            country_code="+91",
            name="Demo User",
            email="demo@example.com",
            gender="Male"
        )
        db.add(sample_user)
        db.commit()
        logger.info("Added sample user")
        
        logger.info("✅ Database seeding completed successfully!")
        
        # Print summary
        print("\n" + "="*50)
        print("DATABASE SEEDING SUMMARY")
        print("="*50)
        print(f"Cities: {len(cities)}")
        print(f"Buses: {len(buses)}")
        print(f"Seats: {total_seats}")
        print(f"Trips: {total_trips}")
        print(f"Users: 1")
        print("\n🎯 DEMO READY!")
        print(f"Search buses from Mumbai to Bangalore for {today + timedelta(days=1)}")
        print(f"Phone for login: +919876543210")
        print("="*50)
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
