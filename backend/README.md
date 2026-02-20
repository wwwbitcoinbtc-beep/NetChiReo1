# NetChi API - Backend (.NET 10)

A modern, secure, and scalable RESTful API built with ASP.NET Core 10 using Clean Architecture principles.

## ✨ Features

- **Clean Architecture**: Domain, Application, Infrastructure, and API layers
- **Real-time Communication**: SignalR with WebSocket support
- **Security**: JWT authentication, Rate Limiting, DDoS protection
- **Database**: SQL Server with Entity Framework Core
- **API Documentation**: Swagger/OpenAPI
- **Docker Support**: SQL Server containerized
- **CORS**: Pre-configured for frontend integration

## 🛠 Prerequisites

- **.NET 10.0.100** or higher
- **SQL Server** (Docker recommended)
- **Git** (optional)

## 🚀 Quick Start

### 1. Setup SQL Server with Docker

```bash
cd backend
docker-compose up -d mssql
```

Wait for SQL Server to be healthy (check with: `docker ps`).

### 2. Create Database Migrations

```bash
cd backend
dotnet ef migrations add InitialCreate -p src/NetChi.Infrastructure -s src/NetChi.Api
dotnet ef database update -p src/NetChi.Infrastructure -s src/NetChi.Api
```

### 3. Run the API

```bash
cd backend
dotnet run --project src/NetChi.Api
```

The API will start at `https://localhost:5001`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Swagger Documentation
```
GET https://localhost:5001
```

### Orders (Requires JWT Token)
```
GET    /api/v1/orders
GET    /api/v1/orders/{id}
POST   /api/v1/orders
```

## 🔐 Real-time Features (SignalR)

Connect to the OrderHub at:
```
wss://localhost:5001/hubs/order?access_token=YOUR_JWT_TOKEN
```

### Hub Methods

**Client → Server:**
- `SendOrderUpdate(message)` - Send message to all clients
- `JoinOrderGroup(orderId)` - Join specific order updates
- `LeaveOrderGroup(orderId)` - Leave order group
- `SendOrderStatusUpdate(orderId, status)` - Update order status

**Server → Client:**
- `ReceiveOrderUpdate(message)` - Receive order updates
- `OrderStatusChanged({orderId, status, timestamp})` - Status changed
- `Connected({message, connectionId, timestamp})` - Connected
- `UserJoined(message)` - User joined group
- `UserLeft(message)` - User left group
- `UserDisconnected({message, connectionId})` - User disconnected

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=NetChiDb;User Id=sa;Password=NetChi@2024;Encrypt=false;
Jwt__Key=YourSuperSecretKeyForJwtTokenGenerationThatIsAtLeast32CharactersLong
Jwt__Issuer=NetChi
Jwt__Audience=NetChiClient
AllowedOrigins=http://localhost:3000,http://localhost:5173,http://localhost
```

### appsettings.json

Located at `src/NetChi.Api/appsettings.json`. Modify connection string if needed.

## 📁 Project Structure

```
backend/
├── src/
│   ├── NetChi.Api/
│   │   ├── Controllers/v1/          # API endpoints
│   │   ├── Hubs/                    # SignalR hubs
│   │   ├── Extensions/              # Extension methods
│   │   ├── Program.cs               # Configuration
│   │   └── appsettings.json
│   ├── NetChi.Application/
│   │   ├── DTOs/                    # Data transfer objects
│   │   ├── Mappings/                # AutoMapper profiles
│   │   ├── Features/                # Use cases
│   │   └── Common/
│   ├── NetChi.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── Context/             # DbContext
│   │   │   ├── Configurations/      # Entity configurations
│   │   │   └── Repositories/        # Repository pattern
│   │   └── Services/
│   ├── NetChi.Domain/
│   │   ├── Entities/                # Core domain models
│   │   ├── Enums/
│   │   ├── ValueObjects/
│   │   └── Events/
│   └── NetChi.Shared/
│       ├── Constants/
│       ├── Extensions/
│       └── Helpers/
├── docker-compose.yml               # SQL Server container
├── Dockerfile                       # API container
└── .env.example                     # Environment template
```

## 🔐 Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Rate Limiting** - 100 requests per minute per IP
✅ **CORS** - Configured for frontend
✅ **Security Headers** - X-Frame-Options, X-Content-Type-Options, etc.
✅ **SQL Injection Protection** - Entity Framework parameterized queries
✅ **HTTPS** - Auto-redirects HTTP to HTTPS

## 🐳 Docker Build & Deploy

### Build API Image

```bash
cd backend
docker build -t netchi-api:latest .
```

### Run with Docker Compose

```bash
docker-compose up --build
```

## 📊 Database

### SQL Server Connection
- **Server:** localhost,1433
- **Database:** NetChiDb
- **User:** sa
- **Password:** NetChi@2024 (change in production!)

### Add New Entity

1. Create entity in `src/NetChi.Domain/Entities/`
2. Create DTO in `src/NetChi.Application/DTOs/`
3. Add DbSet to `ApplicationDbContext`
4. Create migration:
```bash
dotnet ef migrations add AddNewEntity -p src/NetChi.Infrastructure -s src/NetChi.Api
dotnet ef database update
```

## 🤝 Frontend Integration

The API is pre-configured for CORS. Allowed origins:
- `http://localhost:3000` (standard React port)
- `http://localhost:5173` (Vite port)
- `http://localhost`

### React Integration Example

```typescript
// API base URL
const API_BASE = 'https://localhost:5001/api/v1';

// Fetch with JWT
const response = await fetch(`${API_BASE}/orders`, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// SignalR connection
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/hubs/order', {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .build();

await connection.start();

connection.on('OrderStatusChanged', (data) => {
    console.log('Order updated:', data);
});
```

## 📝 API Response Format

### Success Response
```json
{
    "id": 1,
    "name": "Order 1",
    "status": "pending"
}
```

### Error Response
```json
{
    "message": "Too many requests. Please try again later."
}
```

## 🧪 Testing

Run unit tests (to be added):
```bash
dotnet test
```

## 📚 Learning Resources

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Clean Architecture](https://github.com/ardalis/CleanArchitecture)
- [SignalR Documentation](https://docs.microsoft.com/aspnet/core/signalr/introduction)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)

## ⚠️ Important Notes

1. **Change Default Password**: In production, change SQL Server password in `.env`
2. **Update JWT Key**: Use a strong, unique JWT key
3. **SSL Certificates**: Use proper certificates in production
4. **Database Backups**: Regular backups recommended
5. **Rate Limiting**: Adjust limits based on your needs

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5001
lsof -i :5001
# Kill process
kill -9 <PID>
```

### SQL Server Connection Failed
```bash
# Check if container is running
docker ps | grep mssql
# Check logs
docker logs netchi_sqlserver
```

### Migration Errors
```bash
# Remove last migration
dotnet ef migrations remove -p src/NetChi.Infrastructure -s src/NetChi.Api
```

## 📄 License

This project is licensed under MIT License.

## 🎯 Roadmap

- [ ] Add unit tests
- [ ] Add logging service
- [ ] Add email notifications
- [ ] Add payment integration
- [ ] Add metrics/monitoring

---

**Need help?** Create an issue or contact the development team.
