Backend/                        <- project root
│
├── Api-architecture.md         <- API request/response contracts
├── API.md                      <- maybe higher-level API design notes
├── Architecture.md             <- overall system architecture
├── Specifications.md           <- functional + technical specs
├── DirectoryStructure.md       <- documentation of this layout
├── requirements.txt            <- pinned deps (uv/venv/poetry/whatever you use)
├── README.md                   <- project overview
│
├── app/                        <- core application package
│   ├── main.py                 <- FastAPI entrypoint
│   ├── config.py               <- settings/config
│   │
│   ├── core/                   <- cross-cutting concerns
│   │   ├── security.py         <- JWT auth, OTP validation
│   │   ├── logging.py          <- logging config
│   │   ├── middleware.py       <- request/response middlewares
│   │   └── rate_limiter.py     <- rate limiting logic
│   │
│   ├── db/                     <- database layer
│   │   ├── base.py             <- Base metadata
│   │   ├── session.py          <- DB session handling
│   │   └── models/             <- ORM models
│   │       ├── user.py
│   │       ├── otp.py
│   │       ├── booking.py
│   │       ├── bus.py
│   │       ├── seat.py
│   │       ├── booking_seat.py
│   │       └── city.py
│   │
│   ├── routes/                 <- API endpoints (controllers)
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── booking_routes.py
│   │   ├── bus_routes.py
│   │   └── city_routes.py
│   │
│   ├── services/               <- business logic layer
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── booking_service.py
│   │   ├── bus_service.py
│   │   └── city_service.py
│   │
│   ├── schemas/                <- Pydantic models (request/response)
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── booking.py
│   │   ├── bus.py
│   │   └── city.py
│   │
│   └── utils/                  <- helper functions
│       ├── common.py
│       └── otp_utils.py
│
├── migrations/                 <- Alembic migration scripts
│
└── tests/                      <- unit/integration tests
    ├── test_auth.py
    ├── test_user.py
    ├── test_booking.py
    ├── test_bus.py
    └── test_city.py
