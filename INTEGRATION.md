# 🔗 NetChi - Full Stack Integration Guide

Complete guide to connect React + Vite frontend with ASP.NET Core 10 backend and set up for offline-first development.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Running Everything Together](#running-everything-together)
7. [Offline Mode](#offline-mode)
8. [Real-time Features](#real-time-features)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js 18+** (for React/Vite)
- **.NET 10.0.100+** (for ASP.NET Core)
- **Docker** (for SQL Server) - optional, can use local SQL Server
- **Git**
- A code editor (VS Code, Visual Studio, or Rider)

### Install Tools

```bash
# Check Node version
node --version

# Check .NET version
dotnet --version

# Install Docker (optional)
# https://docs.docker.com/install/
```

---

## Project Structure

```
NetChi/
├── backend/                    # ASP.NET Core API
│   ├── src/
│   │   ├── NetChi.Api/        # Web API layer
│   │   ├── NetChi.Application/
│   │   ├── NetChi.Infrastructure/
│   │   ├── NetChi.Domain/
│   │   └── NetChi.Shared/
│   ├── docker-compose.yml      # SQL Server container
│   ├── Dockerfile
│   └── README.md
│
├── src/                        # React components
│   ├── components/
│   ├── pages/
│   └── App.tsx
│
├── services/                   # API integration
│   ├── apiClient.ts           # HTTP client
│   ├── signalRClient.ts       # Real-time client
│   └── apiConfig.ts           # Configuration
│
├── hooks/                      # React hooks
│   ├── useApi.ts              # API hook
│   └── useSignalR.ts          # Real-time hook
│
├── public/                     # Static assets
│   ├── css/                   # Offline CSS
│   ├── fonts/                 # Offline fonts
│   └── offline-reference.html
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Check .NET Installation

```bash
dotnet --version
# Should output: 10.0.100 or higher
```

### Step 3: Restore Dependencies

```bash
dotnet restore
```

### Step 4: Build the Solution

```bash
dotnet build
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
# From the root directory (where package.json is)
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### Step 2: Install Offline CSS Dependencies (Optional)

```bash
npm run download-fonts
```

This will download:
- Google Fonts (Roboto, Inter)
- Normalize CSS
- Font assets

All downloaded to `public/css/` and `public/fonts/`

### Step 3: Verify Installation

```bash
npm run build
```

Should complete without errors.

---

## Database Setup

### Option 1: Using Docker (Recommended)

```bash
# From backend directory
cd backend

# Start SQL Server container
docker-compose up -d mssql

# Wait 10-15 seconds for SQL Server to start
# Verify it's running
docker ps | grep mssql
```

### Option 2: Using Local SQL Server

Update connection string in `backend/src/NetChi.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=NetChiDb;Trusted_Connection=true;"
  }
}
```

### Step: Create Database Schema

```bash
# From backend directory
cd backend

# Create migration
dotnet ef migrations add InitialCreate -p src/NetChi.Infrastructure -s src/NetChi.Api

# Apply migration (creates database and tables)
dotnet ef database update -p src/NetChi.Infrastructure -s src/NetChi.Api
```

Verify database was created:
```bash
# SQL Server in Docker
docker exec -it netchi_sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "NetChi@2024" -Q "SELECT name FROM sys.databases;"

# Should see: NetChiDb
```

---

## Running Everything Together

### Terminal 1: Start Backend API

```bash
cd backend
dotnet run --project src/NetChi.Api

# Output should show:
# info: Microsoft.Hosting.Lifetime
#       Now listening on: https://localhost:5001
```

### Terminal 2: Start SQL Server (if using Docker)

```bash
cd backend
docker-compose up mssql

# Wait for "SQL Server is now ready for client connections"
```

### Terminal 3: Start Frontend Development Server

```bash
# From root directory
npm run dev

# Output should show:
#   VITE v6.2.0  ready in 100 ms
#   ➜  Local:   http://localhost:5173
```

### Access Applications

- **Frontend**: http://localhost:5173
- **API**: https://localhost:5001/api/v1
- **API Docs (Swagger)**: https://localhost:5001
- **Health Check**: https://localhost:5001/health

---

## Frontend API Configuration

### 1. Authentication Example

```typescript
import { useLogin } from '../hooks/useApi';

function LoginComponent() {
  const { login, loading, error } = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      console.log('Logged in:', response.user);
      // Token is automatically saved to localStorage
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### 2. API Usage Example

```typescript
import { useOrders } from '../hooks/useApi';

function OrdersComponent() {
  const { orders, loading, getOrders } = useOrders();

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {orders?.map(order => (
        <li key={order.id}>{order.name}</li>
      ))}
    </ul>
  );
}
```

### 3. Real-time Updates Example

```typescript
import { useSignalR } from '../hooks/useSignalR';
import { useEffect, useState } from 'react';

function OrderUpdatesComponent() {
  const { isConnected, connect, disconnect } = useSignalR();
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (isConnected) {
      // Listen for order updates
      const client = window.signalRClient;
      if (client) {
        client.on('OrderStatusChanged', (data) => {
          setUpdates(prev => [...prev, data]);
        });
      }
    }
  }, [isConnected]);

  return (
    <div>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <ul>
        {updates.map((update, i) => (
          <li key={i}>{update.status}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Offline Mode

### Download All Dependencies

```bash
npm run download-fonts
```

This downloads:
1. Google Fonts (CSS)
2. Font files (WOFF2)
3. Normalize CSS
4. Creates a reference guide

### Use Local CSS Files

Update your main CSS file to import local files:

```css
/* Instead of @import url('https://fonts.googleapis.com/...') */
/* Use: */
@import url('/css/roboto.css');
@import url('/css/fonts.css');
```

### Test Offline

1. Open DevTools (F12)
2. Go to Network tab
3. Set Throttling to "Offline"
4. Refresh the page
5. Application should work without internet

---

## Real-time Features

### SignalR Hub Methods

**Connect to real-time hub:**

```typescript
import SignalRClient from '../services/signalRClient';

// Auto-connect with your JWT token
await SignalRClient.connect();

// Subscribe to events
SignalRClient.onOrderStatusChanged((data) => {
  console.log('Order status changed:', data);
});

// Send updates
await SignalRClient.sendOrderStatusUpdate('order-123', 'completed');

// Join specific order group
await SignalRClient.joinOrderGroup('order-123');
```

### Available Events

**Server → Client:**
- `Connected`: Initial connection confirmation
- `ReceiveOrderUpdate`: Broadcast message
- `OrderStatusChanged`: Order status update
- `UserJoined`: User joined group
- `UserLeft`: User left group
- `UserDisconnected`: User disconnected

**Client → Server:**
- `SendOrderUpdate(message)`: Send to all clients
- `JoinOrderGroup(orderId)`: Join order updates
- `LeaveOrderGroup(orderId)`: Leave order updates
- `SendOrderStatusUpdate(orderId, status)`: Update status

---

## Building for Production

### Backend

```bash
cd backend

# Build for Release
dotnet build -c Release

# Publish
dotnet publish -c Release -o ./publish

# Run published version
./publish/NetChi.Api
```

### Frontend

```bash
# Build assets
npm run build

# Output in dist/
# Ready to deploy to any static hosting
```

### Docker Deployment

```bash
cd backend

# Build API image
docker build -t netchi-api:latest .

# Run with Docker Compose
docker-compose up --build

# Services available at:
# - API: https://localhost:5001
# - SQL Server: localhost:1433
```

---

## Environment Configuration

### Frontend (.env)

Create `.env` file in root:

```bash
VITE_API_BASE_URL=https://localhost:5001/api/v1
VITE_SIGNALR_URL=https://localhost:5001/hubs
```

### Backend (.env)

Create `backend/.env` file:

```bash
ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=NetChiDb;User Id=sa;Password=NetChi@2024;Encrypt=false;
Jwt__Key=YourSuperSecretKey32CharactersMinimum
Jwt__Issuer=NetChi
Jwt__Audience=NetChiClient
AllowedOrigins=http://localhost:3000,http://localhost:5173
```

---

## Troubleshooting

### Frontend Issues

**"Cannot find module '@microsoft/signalr'"**
```bash
npm install @microsoft/signalr
```

**CORS Error**
- Check backend `appsettings.json` AllowedOrigins
- Ensure frontend port is in the list
- Restart backend

**API Connection Refused**
- Verify backend is running: `https://localhost:5001/health`
- Check firewall settings
- Ensure both are on same network

### Backend Issues

**"Failed to connect to database"**
```bash
# Check if SQL Server is running
docker ps | grep mssql

# Restart container
docker-compose restart mssql
```

**"Port 5001 already in use"**
```bash
# Linux/Mac
lsof -i :5001
kill -9 <PID>

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

**"Migration failed"**
```bash
# Remove last migration
dotnet ef migrations remove -p src/NetChi.Infrastructure -s src/NetChi.Api

# Delete database
# In SSMS or query tool: DROP DATABASE NetChiDb;

# Re-create
dotnet ef database update
```

### SSL Certificate Issues

On first run, you may see warnings about HTTPS certificates:

```bash
# Windows
dotnet dev-certs https --trust

# Linux/Mac
dotnet dev-certs https --trust
```

---

## Useful Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run download-fonts # Download offline dependencies

# Backend
dotnet build                                                      # Build
dotnet run --project src/NetChi.Api                             # Run
dotnet watch run --project src/NetChi.Api                       # Watch mode
dotnet ef migrations add <Name>                                  # Create migration
dotnet ef database update                                         # Apply migrations
dotnet ef migrations remove                                       # Remove last migration

# Docker
docker-compose up -d mssql        # Start SQL Server container
docker-compose down                # Stop all containers
docker-compose logs -f             # View container logs
docker ps                          # List running containers
```

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle size
npm run build -- --analyze

# Enable gzip compression
# In vite.config.ts:
import compression from 'vite-plugin-compression';
export default {
  plugins: [compression()]
}
```

### Backend

```csharp
// In Program.cs:
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

app.UseResponseCompression();
```

---

## Next Steps

1. ✅ Backend running at https://localhost:5001
2. ✅ Database created and migrated
3. ✅ Frontend running at http://localhost:5173
4. ✅ API integration working
5. **Next:** 
   - Create authentication endpoints
   - Build business logic
   - Add unit tests
   - Deploy to production

---

## Support

If you encounter issues:

1. Check [Backend README](./backend/README.md)
2. Review [Frontend README](./README.md)
3. Check [Troubleshooting](#troubleshooting) section
4. Create an issue with:
   - Error message
   - Steps to reproduce
   - System info (OS, Node version, .NET version)

---

**Happy coding! 🚀**
