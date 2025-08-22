# Red Bus - Complete Bus Booking System

## Overview

A full-stack bus booking application built with modern web technologies, featuring real-time seat management, comprehensive booking workflow, and professional user experience. The system implements clean architecture principles with proper separation of concerns and follows industry best practices.

## Architecture

### System Design
- **Backend**: FastAPI with PostgreSQL database
- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand for predictable state updates
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: JWT-based with OTP verification
- **API Design**: RESTful endpoints with proper HTTP methods

### Technology Stack

**Backend Technologies:**
- FastAPI - Modern Python web framework
- SQLAlchemy - Database ORM with relationship management
- Alembic - Database migration management
- PostgreSQL - Production-grade relational database
- JWT - Secure token-based authentication
- Loguru - Structured application logging
- SlowAPI - Rate limiting and API protection

**Frontend Technologies:**
- React 18 - Modern component-based UI library
- TypeScript - Type-safe JavaScript development
- Zustand - Lightweight state management
- Tailwind CSS - Utility-first styling framework
- Vite - Fast build tool and development server

## Core Features

### Authentication System
- OTP-based phone number authentication
- JWT token management with automatic refresh
- Session persistence across browser sessions
- Protected routes with authentication middleware
- User profile management with booking statistics

### Bus Search & Management
- Dynamic city loading from database
- Route-based bus search with date filtering
- Real-time seat availability checking
- Bus details display with ratings and pricing
- Efficient database queries with proper indexing

### Seat Management System
- Real-time seat availability based on booking data
- Interactive seat selection with visual feedback
- Support for multiple seat types (Seater/Sleeper)
- Dynamic pricing display per seat
- Immediate availability updates after cancellations

### Booking Workflow
- Multi-seat selection with validation
- Passenger details collection
- Contact information management
- Payment mode selection
- Booking confirmation with unique IDs
- Complete booking history tracking

### Booking Cancellation
- One-click booking cancellation
- Automatic seat availability restoration
- Database cleanup of booking relationships
- Status tracking (CONFIRMED/CANCELLED)
- User confirmation dialogs

### Notification System
- Real-time notifications for all user actions
- OTP countdown timers (5-minute expiration)
- Auto-dismiss functionality (40 seconds)
- Multiple notification types (success, error, warning, info)
- Global notification management across application

## Database Schema

### Core Entities
```sql
-- User Management
users (id: UUID, phone: string, name: string, email: string, created_at: timestamp)

-- Geographic Data
cities (id: UUID, name: string, state: string)

-- Transportation
buses (id: UUID, operator: string, from_city_id: UUID, to_city_id: UUID, 
       departure_time: time, arrival_time: time, duration: string, fare: float, rating: float)

-- Seating
seats (id: UUID, bus_id: UUID, seat_no: string, seat_type: string, price: float, is_available: boolean)

-- Booking Management
bookings (id: UUID, user_id: UUID, bus_id: UUID, date: date, status: string, amount: float, created_at: timestamp)
booking_seats (id: UUID, booking_id: UUID, seat_id: UUID)

-- Authentication
otp_sessions (id: UUID, phone: string, otp: string, expires_at: timestamp, verified: boolean)
```

### Database Relationships
- Users have many bookings (1:N)
- Buses belong to cities (N:1 for from/to cities)
- Buses have many seats (1:N)
- Bookings connect to seats through booking_seats (N:N)
- Proper foreign key constraints ensure data integrity

## API Architecture

### RESTful Endpoints

**Authentication**
- `POST /api/login/request-otp` - Initiate OTP authentication
- `POST /api/login/verify-otp` - Verify OTP and issue JWT token
- `GET /api/me` - Retrieve user profile
- `PUT /api/me` - Update user information

**Geographic Data**
- `GET /api/cities` - Retrieve all available cities

**Bus Operations**
- `POST /api/search-buses` - Search buses by route and date
- `GET /api/bus/{bus_id}/seats` - Get seat layout with real-time availability

**Booking Management**
- `POST /api/book` - Create new booking
- `GET /api/bookings` - Retrieve user booking history
- `DELETE /api/bookings/{booking_id}` - Cancel booking and restore seat availability

### API Security
- JWT token authentication for protected endpoints
- Rate limiting to prevent API abuse
- Input validation with Pydantic schemas
- SQL injection prevention through parameterized queries
- CORS configuration for frontend integration

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── bus/            # Bus search and seat selection
│   ├── shared/         # Reusable UI components
│   └── user/           # User profile and booking management
├── pages/              # Page-level route components
├── services/           # API integration layer
├── store/              # State management with Zustand
└── ui/                 # Atomic design system components
```

### State Management Flow
1. **Authentication State**: User session, token management
2. **Search State**: Cities, buses, search parameters
3. **Booking State**: Selected bus, seats, booking data
4. **Notification State**: Global notification system
5. **UI State**: Loading states, error handling

### User Interface Design
- Responsive design for all screen sizes
- Modern gradient backgrounds with visual effects
- Professional card layouts with subtle shadows
- Enhanced form styling with focus states
- Smooth animations and transitions
- Consistent color scheme and typography

## Real-Time Features

### Seat Availability Logic
1. Query seats table for bus configuration
2. Check booking_seats for confirmed reservations
3. Calculate availability based on travel date
4. Update UI immediately on state changes
5. Restore availability upon cancellation

### Live Updates
- Immediate seat status changes after booking
- Real-time availability restoration after cancellation
- Dynamic UI updates without page refresh
- Optimistic updates with error rollback

## Data Flow

### Booking Process
1. User searches for buses (city selection, date filtering)
2. System queries database for available buses
3. User selects bus and views seat layout
4. Real-time availability check against bookings
5. User selects seats and enters details
6. System validates selection and processes booking
7. Database updates with new booking and seat relationships
8. Confirmation sent to user with booking details

### Cancellation Process
1. User initiates cancellation from booking history
2. System validates user ownership and booking status
3. Booking status updated to CANCELLED
4. Booking seat relationships removed
5. Seat availability restored in database
6. UI updated to reflect changes immediately

## Code Quality & Standards

### Backend Standards
- Clean architecture with separation of concerns
- Service layer pattern for business logic
- Repository pattern for data access
- Comprehensive error handling with proper HTTP status codes
- Structured logging for debugging and monitoring
- Type hints throughout Python codebase

### Frontend Standards
- TypeScript for type safety
- Component composition over inheritance
- Custom hooks for reusable logic
- Proper error boundaries for error handling
- Consistent naming conventions
- Responsive design principles

### Testing Strategy
- Unit tests for service layer logic
- Integration tests for API endpoints
- Component testing for React components
- End-to-end testing for critical user flows
- Database migration testing

## Security Implementation

### Authentication Security
- OTP-based authentication with time expiration
- JWT tokens with proper expiration handling
- Secure token storage and transmission
- Session management with automatic refresh

### Data Security
- Input validation on both client and server
- SQL injection prevention through ORM
- XSS protection through proper data sanitization
- HTTPS enforcement in production

## Performance Optimizations

### Database Performance
- Proper indexing on frequently queried columns
- Connection pooling for database efficiency
- Optimized queries with minimal N+1 problems
- Database migrations for schema versioning

### Frontend Performance
- Code splitting for optimal bundle size
- Lazy loading of components
- Optimized re-renders with proper state management
- Efficient API calls with caching where appropriate

## Deployment Considerations

### Environment Configuration
- Environment-specific configuration files
- Database connection management
- Logging configuration for different environments
- Security settings for production deployment

### Scalability Features
- Stateless API design for horizontal scaling
- Database connection pooling
- Efficient query patterns
- Modular architecture for easy maintenance

## Setup Instructions

### Backend Setup
```bash
cd backend
source .venv/bin/activate
uv sync
alembic upgrade head
python seed_data.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Database Configuration
- PostgreSQL database required
- Environment variables for database connection
- Migration system for schema management
- Sample data seeding for development

## Project Status

This project demonstrates a complete, production-ready bus booking system with:

- **Full-stack implementation** using modern technologies
- **Real-time seat management** with immediate updates
- **Professional UI/UX** with responsive design
- **Comprehensive booking lifecycle** from search to cancellation
- **Clean code architecture** with proper separation of concerns
- **Security best practices** throughout the application
- **Database integrity** with proper relationships and constraints
- **Error handling** with user-friendly feedback
- **Performance optimizations** for scalability
- **Professional documentation** and code organization

The system is ready for production deployment and demonstrates enterprise-level software development practices.