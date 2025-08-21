Project Specifications
1. Overview

This project is a Bus Ticket Booking Backend that provides:

User authentication via OTP (passwordless login).

Profile management (view and update user details).

Bookings management (view confirmed and cancelled bookings).

Bus ticket booking flow (get cities, search buses, view seat layout, book tickets).

The system is designed to mimic bus booking platforms such as RedBus, while remaining modular, extensible, and developer-friendly.

2. Goals

Enable login using phone number and OTP verification.

Provide secure authentication and authorization using JWT tokens.

Expose RESTful API endpoints for user and booking workflows.

Allow users to search buses, check availability, and book seats.

Maintain user booking history (confirmed and cancelled).

Implement rate limiting to protect endpoints from abuse.

Provide structured logging for monitoring and debugging.

3. Tech Stack

Language: Python

Backend Framework: FastAPI

Environment: Python virtual environment (managed with uv)

Database: PostgreSQL

ORM: SQLAlchemy

Schema Validation and Data Models: Pydantic

Authentication: OTP-based login with JWT tokens

Rate Limiting: To be implemented using middleware or third-party library (e.g., slowapi)

Logging: Python logging module with structured log output

4. Features
Authentication and User Management

Request OTP with phone number.

Verify OTP and issue JWT token.

Get user profile (requires authentication).

Update user profile (requires authentication).

Booking Flow

Get list of supported cities.

Search buses between two cities for a given date.

View seat layout for a selected bus.

Book tickets (requires login and payment mode).

View user bookings (confirmed or cancelled).

Rate Handling

Each user and IP will have defined request limits (e.g., N requests per minute).

Exceeding limits returns HTTP 429 (Too Many Requests).

Rate limiting is applied on login endpoints (OTP requests), search, and booking.

Logging

All requests and responses will be logged with unique identifiers.

Logs will include timestamp, request path, status code, user ID (if available), and error details if any.

Error logs will be separated from info logs for easier debugging.

Logging will follow structured JSON format for integration with log management systems.

5. API Endpoints
Phase 1: Login and My Details

POST /api/login/request-otp – Request OTP

POST /api/login/verify-otp – Verify OTP and receive JWT token

GET /api/me – Get user profile

PUT /api/me – Update user profile

GET /api/bookings – Get user bookings

Phase 2: Bus Ticket Booking

GET /api/cities – Get available cities

POST /api/search-buses – Search buses by route and date

GET /api/bus/{bus_id}/seats – Get seat layout

POST /api/book – Book tickets

6. Authentication

Login is based on phone number and OTP.

OTP generation returns an otp_id used to track OTP sessions.

OTP verification returns a JWT token on success.

JWT tokens must be included in Authorization: Bearer <token> for all authenticated endpoints.

7. Database Notes

PostgreSQL will store users, bookings, buses, cities, and seat availability.

SQLAlchemy ORM will manage database models and relationships.

Pydantic models will be used for validating incoming requests and formatting responses.

8. Rate Limiting

OTP request endpoint limited to prevent abuse (e.g., max 5 requests per 10 minutes per phone number).

Search buses endpoint limited to prevent scraping.

Booking endpoint limited to avoid spam.

Rate limit thresholds configurable via environment variables.

9. Logging

Access logs: every request path, method, response status, and execution time.

Authentication logs: OTP request, verification, failures.

Error logs: unexpected exceptions, database failures, validation errors.

Booking logs: seat selection and booking confirmation/cancellation.

Logs stored in structured JSON format for external monitoring systems.

10. Error Handling

All error responses follow a consistent JSON structure:

{
  "success": false,
  "error": "Reason for failure"
}


Example:

{
  "success": false,
  "error": "Invalid OTP"
}


HTTP status codes will be used consistently:

200 for success

400 for bad request

401 for unauthorized

404 for not found

429 for rate limit exceeded

500 for internal server error

This specification document defines the backend architecture, features, and API contract for a FastAPI-based bus ticket booking system with OTP authentication, PostgreSQL database, SQLAlchemy ORM, Pydantic validation, rate limiting, and logging.