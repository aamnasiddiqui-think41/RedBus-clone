API Architecture

This document defines the REST API architecture for the Bus Ticket Booking System.
The API is divided into two phases:

Phase 1: Login and User Management

Phase 2: Bus Ticket Booking Flow

All requests and responses are in JSON format.
Authenticated endpoints require Authorization: Bearer <token>.

Error handling is standardized for all endpoints.

Error Handling Format

All errors follow this structure:

{
  "success": false,
  "error": "Reason for failure"
}

Common HTTP Status Codes
200 OK – Successful request
201 Created – Resource created successfully (e.g., booking)
400 Bad Request – Invalid input
401 Unauthorized – Missing or invalid JWT token
404 Not Found – Resource not found
409 Conflict – Seat conflict / already booked
429 Too Many Requests – Rate limit exceeded
500 Internal Server Error – Unexpected server error

Phase 1: Login and My Details
1. Request OTP

Endpoint: POST /api/login/request-otp

Request:

{
  "country_code": "+91",
  "phone": "9876543210"
}


Response (200 Success):

{
  "success": true,
  "message": "OTP sent to +91 9876543210",
  "otp_id": "otp_12345"
}


Response (429 Too Many Requests):

{
  "success": false,
  "error": "Too many OTP requests. Please try later."
}

2. Verify OTP

Endpoint: POST /api/login/verify-otp

Request:

{
  "otp_id": "otp_12345",
  "otp": "123456"
}


Response (200 Success):

{
  "token": "mock-jwt-token-xyz",
  "user": {
    "id": "U123",
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com"
  }
}


Response (400 Bad Request - Invalid OTP):

{
  "success": false,
  "error": "Invalid or expired OTP"
}

3. Get My Profile

Endpoint: GET /api/me
Auth Required

Response (200 Success):

{
  "id": "U123",
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "gender": "Male",
  "dob": "1994-05-12"
}


Response (401 Unauthorized):

{
  "success": false,
  "error": "Unauthorized"
}

4. Update My Profile

Endpoint: PUT /api/me
Auth Required

Request:

{
  "name": "Johnathan Doe",
  "email": "john.doe@gmail.com",
  "gender": "Male",
  "dob": "1994-05-12"
}


Response (200 Success):

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


Response (400 Bad Request - Invalid input):

{
  "success": false,
  "error": "Invalid email format"
}

5. My Bookings

Endpoint: GET /api/bookings
Auth Required

Response (200 Success):

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


Response (401 Unauthorized):

{
  "success": false,
  "error": "Unauthorized"
}

Phase 2: Bus Ticket Booking Flow
1. Get Cities

Endpoint: GET /api/cities

Response (200 Success):

{
  "cities": [
    { "id": "C001", "name": "Bangalore" },
    { "id": "C002", "name": "Hyderabad" },
    { "id": "C003", "name": "Chennai" },
    { "id": "C004", "name": "Coimbatore" }
  ]
}


Response (500 Internal Server Error):

{
  "success": false,
  "error": "Failed to fetch cities"
}

2. Search Buses

Endpoint: POST /api/search-buses

Request:

{
  "from_city_id": "C001",
  "to_city_id": "C002",
  "date": "2025-09-01"
}


Response (200 Success):

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


Response (404 Not Found):

{
  "success": false,
  "error": "No buses found for the selected route and date"
}

3. Get Seat Layout

Endpoint: GET /api/bus/{bus_id}/seats

Response (200 Success):

{
  "bus_id": "BUS101",
  "seats": [
    { "seat_no": "A1", "type": "Sleeper", "price": 900, "available": true },
    { "seat_no": "A2", "type": "Sleeper", "price": 900, "available": false },
    { "seat_no": "B1", "type": "Sleeper", "price": 900, "available": true }
  ]
}


Response (404 Not Found):

{
  "success": false,
  "error": "Invalid bus ID"
}

4. Book Ticket

Endpoint: POST /api/book
Auth Required

Request:

{
  "bus_id": "BUS101",
  "date": "2025-09-01",
  "seats": ["A1", "B1"],
  "payment_mode": "CARD"
}


Response (201 Created - Success):

{
  "booking_id": "BKG003",
  "status": "CONFIRMED",
  "amount": 1800,
  "seats": ["A1", "B1"],
  "bus_id": "BUS101"
}


Response (409 Conflict - Seat already booked):

{
  "success": false,
  "error": "Selected seats are no longer available"
}


Response (401 Unauthorized):

{
  "success": false,
  "error": "Unauthorized"
}


Response (500 Internal Server Error):

{
  "success": false,
  "error": "Booking failed due to system error"
}


This api-architecture.md now:

Defines request/response for each endpoint.
Includes HTTP status codes mapping.
Provides standardized error handling.