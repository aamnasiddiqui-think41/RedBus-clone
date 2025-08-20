

🟢 Phase 1: Login + My Details
1. Request OTP

POST /api/login/request-otp
➡️ User enters phone number.

Request

{
  "country_code": "+91",
  "phone": "9876543210"
}


Response

{
  "success": true,
  "message": "OTP sent to +91 9876543210",
  "otp_id": "otp_12345"   // unique ID to track OTP session
}

2. Verify OTP

POST /api/login/verify-otp
➡️ User enters the OTP they received.

Request

{
  "otp_id": "otp_12345",
  "otp": "123456"
}


Response

{
  "token": "mock-jwt-token-xyz",
  "user": {
    "id": "U123",
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com"
  }
}

3. Get My Profile

GET /api/me
➡️ Requires Authorization: Bearer <token>

Response

{
  "id": "U123",
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "gender": "Male",
  "dob": "1994-05-12"
}

4. Update My Profile

PUT /api/me

Request

{
  "name": "Johnathan Doe",
  "email": "john.doe@gmail.com",
  "gender": "Male",
  "dob": "1994-05-12"
}


Response

{
  "success": true,
  "user": {
    "id": "U123",
    "name": "Johnathan Doe",
    "phone": "+919876543210",
    "email": "john.doe@gmail.com",
    "gender": "Male",
    "dob": "1994-05-12"
  }
}

5. My Bookings

GET /api/bookings

Response

{
  "bookings": [
    {
      "booking_id": "BKG001",
      "bus_name": "VRL Travels",
      "from_city": "Bangalore",
      "to_city": "Hyderabad",
      "date": "2025-09-01",
      "seats": ["A1", "A2"],
      "status": "CONFIRMED",
      "amount": 1800
    },
    {
      "booking_id": "BKG002",
      "bus_name": "SRS Travels",
      "from_city": "Chennai",
      "to_city": "Coimbatore",
      "date": "2025-09-10",
      "seats": ["B1"],
      "status": "CANCELLED",
      "amount": 950
    }
  ]
}

🟠 Phase 2: Bus Ticket Booking Flow
1. Get Cities

GET /api/cities

Response

{
  "cities": [
    { "id": "C001", "name": "Bangalore" },
    { "id": "C002", "name": "Hyderabad" },
    { "id": "C003", "name": "Chennai" },
    { "id": "C004", "name": "Coimbatore" }
  ]
}

2. Search Buses

POST /api/search-buses

Request

{
  "from_city_id": "C001",
  "to_city_id": "C002",
  "date": "2025-09-01"
}


Response

{
  "buses": [
    {
      "id": "BUS101",
      "operator": "VRL Travels",
      "departure_time": "21:00",
      "arrival_time": "06:00",
      "duration": "9h",
      "fare": 900,
      "rating": 4.3
    },
    {
      "id": "BUS102",
      "operator": "SRS Travels",
      "departure_time": "22:00",
      "arrival_time": "07:00",
      "duration": "9h",
      "fare": 1100,
      "rating": 4.0
    }
  ]
}

3. Get Seat Layout

GET /api/bus/{bus_id}/seats

Response

{
  "bus_id": "BUS101",
  "seats": [
    { "seat_no": "A1", "type": "Sleeper", "price": 900, "available": true },
    { "seat_no": "A2", "type": "Sleeper", "price": 900, "available": false },
    { "seat_no": "B1", "type": "Sleeper", "price": 900, "available": true }
  ]
}

4. Book Ticket

POST /api/book
➡️ Requires token (must be logged in).

Request

{
  "bus_id": "BUS101",
  "date": "2025-09-01",
  "seats": ["A1", "B1"],
  "payment_mode": "CARD"
}


Response

{
  "booking_id": "BKG003",
  "status": "CONFIRMED",
  "amount": 1800,
  "seats": ["A1", "B1"],
  "bus_id": "BUS101"
}


✅ With this structure:

Phase 1 gives you Login + My Details as the app’s starting point.

Phase 2 later unlocks Bus Tickets flow exactly like Redbus booking (cities → search → seats → checkout).