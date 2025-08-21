System Architecture
1. High-Level Architecture

The system will follow a layered architecture with clear separation of concerns:

API Layer (FastAPI Routers)

Exposes REST endpoints (/api/...).

Handles request validation with Pydantic models.

Auth middleware for JWT verification.

Rate limiting middleware.

Service Layer (Business Logic)

Implements OTP verification, booking logic, profile updates.

Handles seat availability checks and booking confirmation.

Contains transaction management for booking flows.

Data Access Layer (Repositories with SQLAlchemy)

Encapsulates all database queries.

Defines repositories for User, Bus, Booking, City, Seat.

Uses SQLAlchemy ORM models.

Database (PostgreSQL)

Stores users, OTP sessions, bookings, buses, seats, and cities.

Ensures ACID transactions for seat booking.

Infrastructure Layer

Logging (structured JSON logs, access/error logs).

Rate limiting middleware (e.g., SlowAPI or custom).

Background tasks (e.g., OTP expiry cleanup, async jobs).

2. Component Diagram
            ┌───────────────────────────┐
            │        Client App          │
            │  (Mobile / Web Frontend)   │
            └─────────────┬─────────────┘
                          │ REST API
            ┌─────────────▼─────────────┐
            │       API Layer            │
            │  FastAPI Routers + Pydantic│
            │  - Auth Middleware (JWT)   │
            │  - Rate Limiter Middleware │
            └─────────────┬─────────────┘
                          │ calls
            ┌─────────────▼─────────────┐
            │      Service Layer         │
            │  - AuthService (OTP, JWT)  │
            │  - UserService (profile)   │
            │  - BookingService          │
            │  - BusService              │
            └─────────────┬─────────────┘
                          │ queries
            ┌─────────────▼─────────────┐
            │   Data Access Layer        │
            │  SQLAlchemy Repositories   │
            │  - UserRepo                │
            │  - BookingRepo             │
            │  - BusRepo                 │
            │  - SeatRepo                │
            └─────────────┬─────────────┘
                          │ ORM
            ┌─────────────▼─────────────┐
            │       PostgreSQL DB        │
            │  users, bookings, buses,   │
            │  cities, seats, otp_logs   │
            └───────────────────────────┘

3. Authentication & OTP Flow

User requests OTP → stored in otp_sessions table with otp_id, phone, otp_code, expiry.

User verifies OTP → if valid, generate JWT token.

JWT token used for all authenticated requests (/me, /book, /bookings).

Rate limit applied to OTP endpoints to prevent abuse.

4. Booking Flow

User searches buses (reads from buses table).

User requests seat layout (reads from seats table).

User selects seats → booking transaction starts.

Seats are marked as reserved → booking created in bookings table.

On success → booking status set to CONFIRMED.

On failure → transaction rollback, seats remain available.

This requires transaction-safe seat booking to prevent double-booking.

5. Rate Limiting

Implemented as middleware in FastAPI.

Strategies:

OTP endpoints: max 5 per 10 minutes per phone.

Search endpoints: max 20 per minute per IP.

Booking endpoint: max 5 per minute per user.

Returns HTTP 429 if exceeded.

6. Logging

Logging Middleware logs every request with:

Timestamp

Request path + method

User ID (if authenticated)

Status code

Response time

Error logging:

Stack trace stored for debugging.

Logged in JSON format for easy ingestion into tools like ELK or Loki.

Example log entry:

{
  "timestamp": "2025-08-21T12:45:00Z",
  "level": "INFO",
  "user_id": "U123",
  "method": "POST",
  "path": "/api/book",
  "status": 200,
  "latency_ms": 154
}
