# Docker Deployment Guide

## Overview

This guide provides instructions for containerizing and deploying the Red Bus booking system using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose v2.0+ installed
- Minimum 4GB RAM available
- Minimum 10GB disk space

## Architecture

The containerized application consists of:

- **Frontend**: React application served by Nginx
- **Backend**: FastAPI application with Python 3.11
- **Database**: PostgreSQL 15 with persistent storage
- **Cache**: Redis for session management (optional)
- **Reverse Proxy**: Nginx for load balancing (production)

## Quick Start

### Development Environment

1. **Clone the repository and navigate to project directory**
   ```bash
   cd "Documents/Think 41/Red bus"
   ```

2. **Copy environment file**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - Database: localhost:5432

### Production Environment

1. **Copy production environment**
   ```bash
   cp env.example .env.production
   # Configure production values in .env.production
   ```

2. **Deploy with production settings**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

## Service Details

### Frontend (React + Nginx)

**Container**: `redbus_frontend`
**Port**: 80
**Features**:
- Multi-stage build for optimized image size
- Nginx reverse proxy for API calls
- Static asset caching
- Security headers
- Client-side routing support

### Backend (FastAPI)

**Container**: `redbus_backend`
**Port**: 8000
**Features**:
- Python 3.11 slim base image
- UV package manager for faster builds
- Non-root user for security
- Health checks
- Database migration support

### Database (PostgreSQL)

**Container**: `redbus_database`
**Port**: 5432
**Features**:
- PostgreSQL 15 Alpine
- Persistent data storage
- Health checks
- Initialization scripts support

### Cache (Redis)

**Container**: `redbus_redis`
**Port**: 6379
**Features**:
- Redis 7 Alpine
- Persistent storage with AOF
- Password protection
- Health checks

## Docker Commands

### Basic Operations

```bash
# Build all services
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (careful - deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

### Development Commands

```bash
# Development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Build with no cache
docker-compose build --no-cache

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec database psql -U redbus_user -d redbus_db

# Run tests in container
docker-compose exec backend uv run pytest -q "tests/unit tests"

# View service status
docker-compose ps

# Monitor resource usage
docker stats
```

### Database Operations

```bash
# Run database migrations
docker-compose exec backend uv run alembic upgrade head

# Seed sample data
docker-compose exec backend python seed_data.py

# Database backup
docker-compose exec database pg_dump -U redbus_user redbus_db > backup.sql

# Database restore
docker-compose exec -T database psql -U redbus_user -d redbus_db < backup.sql
```

## Environment Variables

### Required Variables

```env
POSTGRES_PASSWORD=secure_password_here
JWT_SECRET_KEY=your_jwt_secret_key
```

### Optional Variables

```env
POSTGRES_DB=redbus_db
POSTGRES_USER=redbus_user
ENVIRONMENT=production
LOG_LEVEL=INFO
REDIS_PASSWORD=redis_password
```

## Security Considerations

### Production Security

1. **Change default passwords**
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   ```

2. **Use secrets management**
   ```bash
   # Docker secrets (Docker Swarm)
   echo "secure_password" | docker secret create postgres_password -
   ```

3. **Enable SSL/TLS**
   - Configure SSL certificates in Nginx
   - Use HTTPS for all external communication

4. **Network security**
   ```bash
   # Create custom network
   docker network create --driver bridge redbus_secure_network
   ```

### Container Security

- All containers run as non-root users
- Minimal base images (Alpine Linux)
- Security headers in Nginx configuration
- Health checks for all services
- Resource limits in production

## Monitoring and Logging

### Log Management

```bash
# View specific service logs
docker-compose logs -f backend

# Follow logs with timestamps
docker-compose logs -f -t

# Limit log output
docker-compose logs --tail=100 backend
```

### Health Monitoring

```bash
# Check service health
docker-compose ps

# Detailed health status
docker inspect --format='{{.State.Health.Status}}' redbus_backend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   
   # Change ports in docker-compose.yml
   ports:
     - "8001:8000"  # Change host port
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs database
   
   # Verify database is ready
   docker-compose exec database pg_isready -U redbus_user
   ```

3. **Build failures**
   ```bash
   # Clean build cache
   docker system prune -f
   docker-compose build --no-cache
   ```

4. **Memory issues**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Increase memory limits in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
   ```

### Debug Commands

```bash
# Access container shell
docker-compose exec backend bash

# Check container processes
docker-compose exec backend ps aux

# View container environment
docker-compose exec backend env

# Network connectivity test
docker-compose exec backend ping database
```

## Performance Optimization

### Image Optimization

1. **Multi-stage builds** - Reduces final image size
2. **Alpine base images** - Smaller footprint
3. **Layer caching** - Faster rebuilds
4. **.dockerignore** - Excludes unnecessary files

### Runtime Optimization

1. **Resource limits** - Prevents resource exhaustion
2. **Health checks** - Ensures service availability
3. **Connection pooling** - Efficient database usage
4. **Caching** - Redis for session management

## Scaling

### Horizontal Scaling

```bash
# Scale specific service
docker-compose up --scale backend=3

# Load balancing with Nginx
# Configure upstream servers in nginx.conf
```

### Docker Swarm (Production)

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml redbus

# Scale services
docker service scale redbus_backend=3
```

## Maintenance

### Updates and Patches

```bash
# Update base images
docker-compose pull

# Rebuild with latest dependencies
docker-compose build --pull

# Rolling updates (zero downtime)
docker-compose up -d --no-deps backend
```

### Cleanup

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a
```

## Backup and Recovery

### Database Backup

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T database pg_dump -U redbus_user redbus_db > "backup_${DATE}.sql"
```

### Volume Backup

```bash
# Backup PostgreSQL data
docker run --rm -v redbus_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore PostgreSQL data
docker run --rm -v redbus_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

This Docker setup provides a production-ready deployment solution with proper security, monitoring, and scalability considerations.
