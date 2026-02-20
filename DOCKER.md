# 🐳 NetChi - Docker Setup Guide

## Prerequisites
- Docker Desktop (or Docker + Docker Compose)
- 4GB+ available disk space
- Ports 3000, 5232, 1433 available

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd /workspaces/NetChi

# Build and start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Using Startup Script

```bash
chmod +x start-docker.sh
./start-docker.sh
```

---

## Available Services

| Service | URL | Health Check |
|---------|-----|--------------|
| **Frontend** | http://localhost:3000 | GET `/` |
| **Backend API** | http://localhost:5232 | GET `/health` |
| **Database** | localhost:1433 | SQL Server 2022 Express |

---

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f sqlserver
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services
```bash
# Stop all (data persists in volumes)
docker-compose down

# Stop and remove all (including volumes)
docker-compose down -v
```

### Rebuild
```bash
# Rebuild without cache
docker-compose build --no-cache

# Then restart
docker-compose up -d
```

---

## Database Connection

**Connection String (from host):**
```
Server=localhost,1433;Database=NetChiDb;User Id=sa;Password=NetChi@2024;Encrypt=false;
```

**Connection String (from container):**
```
Server=sqlserver,1433;Database=NetChiDb;User Id=sa;Password=NetChi@2024;Encrypt=false;
```

---

## Environment Variables

All environment variables are set in `docker-compose.yml`:

- `ASPNETCORE_ENVIRONMENT=Production` (Backend)
- `ASPNETCORE_URLS=http://+:5232` (Backend)
- `SA_PASSWORD=NetChi@2024` (Database)
- `ACCEPT_EULA=Y` (Database)

---

## Volumes

Docker Compose creates three persistent volumes:

1. **sqlserver_data** - SQL Server database files
2. **backend_build** - .NET build artifacts
3. **frontend_build** - Node modules cache

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
lsof -i :3000
lsof -i :5232
lsof -i :1433

# Kill the process
kill -9 <PID>

# Or use a different port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs <service_name>

# Rebuild
docker-compose build --no-cache <service_name>
docker-compose up -d <service_name>
```

### Database Connection Failed
```bash
# Wait for SQL Server to be healthy
docker-compose logs sqlserver

# Manually connect to verify
sqlcmd -S localhost,1433 -U sa -P NetChi@2024
```

### Frontend Shows Blank Page
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## Cleanup

```bash
# Remove all containers, volumes, and networks
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove all Docker data (careful!)
docker system prune -a --volumes
```

---

## Performance Tips

1. **Use BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **WSL 2** on Windows significantly improves performance

3. **Allocate more resources** in Docker Desktop:
   - Settings → Resources → CPUs: 4+
   - Settings → Resources → Memory: 4GB+

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Network          │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │ (Node.js)    │───▶│  (.NET Core) │  │
│  │ Port: 3000   │    │ Port: 5232   │  │
│  └──────────────┘    └──────┬───────┘  │
│         │                    │          │
│         └────────┬───────────┘          │
│                  │                      │
│          ┌───────▼─────────┐           │
│          │  SQL Server     │           │
│          │  Port: 1433     │           │
│          └─────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Next Steps

1. **Access the application**: http://localhost:3000
2. **Check API health**: http://localhost:5232/health
3. **View logs**: `docker-compose logs -f`
4. **Monitor resources**: `docker stats`

---

**Made with ❤️ for NetChi - نت چی**
