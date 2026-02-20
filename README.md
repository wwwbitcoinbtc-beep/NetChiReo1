# NetChi - Next Gen Cafe Platform 🚀

A modern, full-stack application for cafe management with real-time capabilities, built with React + Vite frontend and ASP.NET Core 10 backend.

## ✨ Features

### Frontend (React + Vite)
- ⚡ Lightning-fast development with Vite
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time updates with SignalR
- 📱 Responsive design
- 🎬 Smooth animations with Framer Motion
- 🤖 AI integration with Google GenAI
- 📡 Type-safe API client
- 🔐 JWT authentication support

### Backend (ASP.NET Core 10)
- 🏗️ Clean Architecture (Domain, Application, Infrastructure, API)
- 🔒 JWT authentication & rate limiting
- 📡 Real-time communication with SignalR
- 💾 SQL Server database with EF Core
- 📚 Auto-generated API documentation (Swagger)
- 🌐 CORS enabled for frontend
- 🛡️ Security headers & DDoS protection
- 🐳 Docker support

### Offline-First
- 📦 All CSS dependencies downloaded locally
- 🔤 Offline fonts
- 📱 Works without internet connection
- ⚡ Faster load times

## 🗂️ Project Structure

```
NetChi/
├── backend/                 # ASP.NET Core API (.NET 10)
│   ├── src/
│   │   ├── NetChi.Api/     # Web API
│   │   ├── NetChi.Application/
│   │   ├── NetChi.Infrastructure/
│   │   ├── NetChi.Domain/
│   │   └── NetChi.Shared/
│   ├── docker-compose.yml
│   └── README.md
│
├── src/                    # React components
│   ├── components/         # UI components
│   ├── services/          # Business logic
│   └── App.tsx
│
├── services/              # API integration
│   ├── apiClient.ts       # HTTP client
│   ├── signalRClient.ts   # Real-time
│   └── apiConfig.ts
│
├── hooks/                 # React hooks
│   ├── useApi.ts
│   └── useSignalR.ts
│
├── public/               # Static assets
│   ├── css/             # Offline CSS
│   └── fonts/           # Offline fonts
│
└── package.json
```

## 🚀 Quick Start

### Fastest Way (5 minutes)

See [QUICKSTART.md](./QUICKSTART.md) for quick setup instructions.

### Detailed Setup

See [INTEGRATION.md](./INTEGRATION.md) for comprehensive setup guide.

## 📋 Prerequisites

- **Node.js 18+**
- **.NET 10.0.100+**
- **Docker** (optional, for SQL Server)
- **Git**

## 🎯 Installation Steps

### 1. Backend Setup

```bash
cd backend

# Restore packages
dotnet restore

# Build solution
dotnet build

# Start SQL Server (Docker)
docker-compose up -d mssql

# Create & migrate database
dotnet ef database update -p src/NetChi.Infrastructure -s src/NetChi.Api
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# (Optional) Download offline CSS assets
npm run download-fonts
```

### 3. Run Everything

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run --project src/NetChi.Api
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Database (if using Docker):**
```bash
cd backend
docker-compose up mssql
```

## 🌐 Access

| Service | URL | Link |
|---------|-----|------|
| Frontend | http://localhost:5173 | [Open](http://localhost:5173) |
| API | https://localhost:5001/api/v1 | [Endpoints](https://localhost:5001/api/v1) |
| Swagger UI | https://localhost:5001 | [Docs](https://localhost:5001) |
| Health Check | https://localhost:5001/health | [Status](https://localhost:5001/health) |

## 📚 API Integration

### Using the API Client

```typescript
import ApiClient from './services/apiClient';
import { useLogin, useOrders } from './hooks/useApi';

// Login
const response = await ApiClient.login({
  email: 'user@example.com',
  password: 'password'
});

// Get Orders
const orders = await ApiClient.getOrders();

// React Hook
const { login, loading, error } = useLogin();
```

### Real-time Updates

```typescript
import SignalRClient from './services/signalRClient';
import { useSignalR } from './hooks/useSignalR';

// Connect to real-time hub
await SignalRClient.connect();

// Listen for updates
SignalRClient.onOrderStatusChanged((data) => {
  console.log('Order updated:', data);
});

// Or use React hook
const { isConnected, sendOrderStatusUpdate } = useSignalR();
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env - optional)
```env
VITE_API_BASE_URL=https://localhost:5001/api/v1
VITE_SIGNALR_URL=https://localhost:5001/hubs
```

#### Backend (backend/.env)
```env
ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=NetChiDb;User Id=sa;Password=NetChi@2024;Encrypt=false;
Jwt__Key=YourSuperSecretKeyAtLeast32Characters
Jwt__Issuer=NetChi
Jwt__Audience=NetChiClient
AllowedOrigins=http://localhost:3000,http://localhost:5173
```

## 🔐 Security

✅ JWT Authentication  
✅ Rate Limiting (100 req/min per IP)  
✅ CORS Configuration  
✅ Security Headers  
✅ SQL Injection Prevention (EF Core)  
✅ HTTPS enforcement  
✅ DDoS Protection  

## 📦 Offline Mode

Download all CSS and fonts locally:

```bash
npm run download-fonts
```

Test offline (DevTools > Network > Offline):
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline"
4. Refresh page
5. Application should work without internet

## 🐳 Docker Deployment

### Build & Run with Docker

```bash
cd backend

# Build image
docker build -t netchi-api:latest .

# Run with compose
docker-compose up --build

# Services will be available at:
# - API: https://localhost:5001
# - DB: localhost:1433
```

## 📊 Database

### Using Docker SQL Server
- Server: localhost:1433
- User: sa
- Password: NetChi@2024
- Database: NetChiDb

### Create Migrations

```bash
cd backend

# Create new migration
dotnet ef migrations add AddFeatureName -p src/NetChi.Infrastructure -s src/NetChi.Api

# Apply to database
dotnet ef database update -p src/NetChi.Infrastructure -s src/NetChi.Api

# Revert last migration
dotnet ef migrations remove -p src/NetChi.Infrastructure -s src/NetChi.Api
```

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run download-fonts # Download offline assets
```

### Backend
```bash
dotnet build                                                      # Build
dotnet run --project src/NetChi.Api                             # Run
dotnet watch run --project src/NetChi.Api                       # Watch mode
dotnet ef migrations add <Name> -p src/NetChi.Infrastructure -s src/NetChi.Api  # Migrate
```

### Docker
```bash
docker-compose up -d mssql        # Start SQL Server
docker-compose down               # Stop containers
docker-compose logs -f            # View logs
```

## 📖 Documentation

- [Quick Start Guide](./QUICKSTART.md) - 5-minute setup
- [Full Integration Guide](./INTEGRATION.md) - Detailed setup & examples
- [Backend API Docs](./backend/README.md) - API endpoints & features
- [Frontend Architecture](./src/README.md) - Component structure (coming soon)

## 🧪 Testing

```bash
# Frontend tests (to be added)
npm run test

# Backend tests
dotnet test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

See [INTEGRATION.md - Troubleshooting](./INTEGRATION.md#troubleshooting) for common issues and solutions.

## 🎯 Roadmap

- [ ] User authentication & authorization
- [ ] Order management system
- [ ] Real-time order notifications
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Mobile app
- [ ] Unit tests
- [ ] E2E tests
- [ ] CI/CD pipeline

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting Guide](./INTEGRATION.md#troubleshooting)
2. Review [Quick Start](./QUICKSTART.md)
3. Read [Full Guide](./INTEGRATION.md)
4. Create an issue with detailed description

## 👨‍💻 Created By

NetChi Development Team

## 🙏 Acknowledgments

- React & Vite teams
- ASP.NET Core team
- Tailwind CSS
- Framer Motion
- Google GenAI

---

**Ready to dive in?** Start with [QUICKSTART.md](./QUICKSTART.md)! 🚀
