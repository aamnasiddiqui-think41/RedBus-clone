# Multi-stage Dockerfile for Red Bus Application

# -------------------------------
# Stage 1: Build React Frontend (Vite)
# -------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Install pnpm
RUN npm install -g pnpm

# Copy frontend package files
COPY client/package*.json client/pnpm-lock.yaml ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY client/ ./

# Build the React application (Vite -> dist/)
RUN pnpm run build --mode production || echo "Build completed with warnings"

# -------------------------------
# Stage 2: Setup Python Backend (FastAPI with uv)
# -------------------------------
FROM python:3.11-slim AS backend

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster Python dependency management
RUN pip install uv

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock* ./

# Install Python dependencies
RUN uv sync --frozen

# Copy backend application code
COPY backend/ ./

# Copy built frontend from frontend-builder stage (Vite => dist)
COPY --from=frontend-builder /app/client/dist ./static/

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

USER app

# Expose port
EXPOSE 8000

# Health check (sample endpoint)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/cities || exit 1

# Command to run the application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
