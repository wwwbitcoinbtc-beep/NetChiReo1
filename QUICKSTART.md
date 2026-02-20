# 🚀 NetChi - Quick Start Guide

Get up and running in 5 minutes!

## 1️⃣ Prerequisites Check

```bash
# Verify Node.js
node --version  # Should be 18+

# Verify .NET
dotnet --version  # Should be 10.0+

# Verify Docker (optional)
docker --version
```

## 2️⃣ Start SQL Server

```bash
cd backend
docker-compose up -d mssql
# Wait 10 seconds...
```

## 3️⃣ Setup Database

```bash
cd backend
dotnet ef database update -p src/NetChi.Infrastructure -s src/NetChi.Api
```

## 4️⃣ Start Backend (Terminal 1)

```bash
cd backend
dotnet run --project src/NetChi.Api

# Visit: https://localhost:5001
```

## 5️⃣ Start Frontend (Terminal 2)

```bash
npm install
npm run dev

# Visit: http://localhost:5173
```

## ✅ Done!

Your full-stack application is running!

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app |
| Backend API | https://localhost:5001/api/v1 | REST endpoints |
| API Docs | https://localhost:5001 | Swagger UI |
| Database | localhost:1433 | SQL Server |

## 🎯 Next Steps

1. Open http://localhost:5173 in browser
2. Check API at https://localhost:5001/health
3. Read [INTEGRATION.md](./INTEGRATION.md) for detailed setup
4. Read [backend/README.md](./backend/README.md) for API documentation

## 🆘 Troubleshooting

**"Cannot connect to backend"**
```bash
# Check if running
curl https://localhost:5001/health -k

# Restart
# Kill the backend process and run again
```

**"Database connection failed"**
```bash
# Check Docker container
docker ps | grep mssql

# Restart database
docker-compose restart mssql
```

**"Port already in use"**
```bash
# Kill process using port
lsof -i :5173  # Frontend
lsof -i :5001  # Backend
kill -9 <PID>
```

For more help, see [INTEGRATION.md](./INTEGRATION.md)
