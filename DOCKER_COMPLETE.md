# 🐳 NetChi - Docker Deployment Complete!

## ✅ Everything is Live!

All services are now running in isolated Docker containers:

- ✅ **Frontend**: http://localhost:3000 (React 19 + Vite)
- ✅ **Backend**: http://localhost:5232 (ASP.NET Core 10)
- ✅ **Database**: localhost:1433 (SQL Server 2022 Express)

---

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project root
cd /workspaces/NetChi

# Start all services
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f
```

### Option 2: Using Quick Start Script

```bash
chmod +x docker-start.sh
./docker-start.sh
```

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│      Docker Compose Network Bridge      │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │  (React)     │───▶│  (.NET Core) │  │
│  │  Port 3000   │    │  Port 5232   │  │
│  └──────────────┘    └──────┬───────┘  │
│         │                    │          │
│         └────────┬───────────┘          │
│                  │                      │
│          ┌───────▼─────────┐           │
│          │  SQL Server     │           │
│          │  Port 1433      │           │
│          │  NetChiDb       │           │
│          └─────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Features

### ✨ Offline-First Design
- **No external CDN dependencies** - All CSS and fonts are local
- **Independent from Google Services** - No Gemini AI dependency
- **Complete offline capability** - Works without internet

### 🎨 Design System
- **Custom Design Section** - Access at `/design` in the app
- **Tailwind CSS** - Fully bundled and offline
- **Persian Fonts** - Vazirmatn + Latin fallbacks (Roboto, Inter)
- **Modern UI** - Glassmorphism, animations, responsive design

### 🔐 Security
- **JWT Authentication** - Token-based API security
- **CORS Protection** - Configured for frontend origin
- **Rate Limiting** - 100 requests per minute per IP
- **Security Headers** - XSS, clickjacking, MIME-sniffing protection

### 📡 Real-Time Communication
- **SignalR Support** - WebSocket-based real-time updates
- **Connection Management** - Auto-reconnect with exponential backoff
- **Group-Based Messaging** - Efficient message routing

### 🗄️ Database
- **SQL Server 2022 Express** - Production-grade database
- **Entity Framework Core** - ORM with migrations
- **Persistence Volumes** - Data survives container restarts

---

## 📁 Project Structure

```
/workspaces/NetChi/
├── frontend/                    # React Vite frontend
│   ├── components/             # Reusable UI components
│   ├── services/               # API & SignalR clients
│   ├── hooks/                  # Custom React hooks
│   ├── public/                 # Static assets
│   ├── public/css/             # Offline CSS files
│   ├── public/fonts/           # Local font files
│   └── Dockerfile.frontend     # Frontend container
│
├── backend/                     # ASP.NET Core API
│   ├── src/
│   │   ├── NetChi.Api/        # Web API project
│   │   ├── NetChi.Application/ # Business logic
│   │   ├── NetChi.Infrastructure/ # Data access
│   │   ├── NetChi.Domain/     # Entity definitions
│   │   └── NetChi.Shared/     # Shared utilities
│   └── Dockerfile             # Backend container
│
├── docker-compose.yml          # Service orchestration
├── Dockerfile.frontend         # Frontend image definition
├── docker-start.sh            # Quick start script
└── DOCKER.md                  # Docker documentation

```

---

## 🐳 Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f sqlserver
```

### Manage Services

```bash
# Stop all services (data persists)
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart a service
docker-compose restart backend

# Rebuild without cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Database Access

```bash
# Connect via SQL Server CLI
sqlcmd -S localhost,1433 -U sa -P NetChi@2024

# Docker container access
docker exec -it netchi-sqlserver sqlcmd -U sa -P NetChi@2024
```

---

## 🔌 API Endpoints

### Health Check
```bash
GET http://localhost:5232/health
✓ Response: {"status":"healthy","timestamp":"..."}
```

### Authentication
```bash
POST /api/v1/auth/login
POST /api/v1/auth/register
GET /api/v1/auth/refresh
```

### Orders Management
```bash
GET /api/v1/orders              # List all orders
POST /api/v1/orders             # Create order
GET /api/v1/orders/{id}         # Get order details
PUT /api/v1/orders/{id}         # Update order
DELETE /api/v1/orders/{id}      # Delete order
```

### Real-Time (SignalR)
```
WebSocket: ws://localhost:5232/hubs/order

Methods:
- SendOrderUpdate(message)
- JoinOrderGroup(orderId)
- LeaveOrderGroup(orderId)
- SendOrderStatusUpdate(orderId, status)

Events:
- ReceiveOrderUpdate
- OrderStatusChanged
```

---

## 🔐 Database Connection

### From Host Machine
```
Server=localhost,1433
Database=NetChiDb
User Id=sa
Password=NetChi@2024
Encrypt=false
```

### From Docker Containers
```
Server=sqlserver,1433
Database=NetChiDb
User Id=sa
Password=NetChi@2024
Encrypt=false
TrustServerCertificate=true
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port in docker-compose.yml
```

### Services Won't Start
```bash
# Check all logs
docker-compose logs

# Rebuild everything
docker-compose build --no-cache
docker-compose up -d

# View individual logs
docker logs netchi-frontend
docker logs netchi-backend
docker logs netchi-sqlserver
```

### Frontend Shows Blank Page
This was fixed by:
- ✅ Removing Tailwind CDN dependency
- ✅ Using offline CSS files
- ✅ Implementing fallback fonts
- ✅ Separating from Google AI services
- ✅ Independent Design System component

### Database Connection Failed
```bash
# Check SQL Server is running
docker ps | grep sqlserver

# Check database is initialized
docker logs netchi-backend | grep "health"

# Wait 20-30 seconds for initialization
sleep 30
docker-compose up -d
```

---

## 📈 Performance & Optimization

### Build Optimization
- ✅ Multi-stage Docker builds
- ✅ Layer caching for faster rebuilds
- ✅ Minimal image sizes
- ✅ Production-optimized Node/ASP.NET images

### Runtime Performance
- ✅ Connection pooling enabled
- ✅ Rate limiting configured
- ✅ CORS caching enabled
- ✅ Compression middleware active

---

## 📦 Technology Stack

### Frontend
- React 19.2.4
- Vite 6.2.0+
- TypeScript 5+
- Tailwind CSS (offline)
- Framer Motion (animations)
- Axios (HTTP client)
- @microsoft/signalr (real-time)

### Backend
- ASP.NET Core 10.0.100
- Entity Framework Core 10.0.3
- SQL Server 2022 Express
- AutoMapper 12.0.1
- JWT Bearer authentication
- SignalR 8.0.0

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Health checks
- Volume persistence
- Network isolation

---

## ✅ Verification Checklist

- [x] Frontend loads at http://localhost:3000
- [x] Backend health check: http://localhost:5232/health
- [x] Database accessible at localhost:1433
- [x] All CSS is offline (no CDN)
- [x] All fonts are local (no external download)
- [x] No Google AI/Gemini dependencies
- [x] Design System component working
- [x] Docker containers isolated
- [x] Volumes persist data
- [x] Health checks configured
- [x] Logs accessible
- [x] Services auto-restart on crash

---

## 🎓 Next Steps

1. **Access the Application**: http://localhost:3000
2. **Check Backend Health**: http://localhost:5232/health
3. **View Design System**: Click Palette icon in app
4. **Review Logs**: `docker-compose logs -f`
5. **Monitor Services**: `docker stats`

---

## 📝 Notes

### Environment Variables
All configuration is in `docker-compose.yml`:
- Database credentials
- JWT signing key
- CORS origins
- Application URLs

### Volumes
Three Docker volumes manage persistence:
- `sqlserver_data` - Database files
- `backend_build` - .NET artifacts
- `frontend_build` - Node modules cache

### Networks
Isolated Docker bridge network `netchi-network`:
- Services communicate by hostname
- Frontend → Backend at `http://backend:5232`
- Backend → Database at `sqlserver:1433`

---

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify containers: `docker ps`
3. Check ports available: `lsof -i :3000` etc.
4. Rebuild: `docker-compose build --no-cache`
5. Reset: `docker-compose down -v && docker-compose up -d`

---

## 📄 Files Reference

- `docker-compose.yml` - Service definitions
- `Dockerfile.frontend` - Frontend container build
- `backend/Dockerfile` - Backend container build
- `docker-start.sh` - Quick launcher script
- `DOCKER.md` - Detailed Docker documentation

---

**🎉 NetChi is now fully Dockerized and production-ready!**

Made with ❤️ for Cafe Net Owners
