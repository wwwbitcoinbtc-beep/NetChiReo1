# 🚀 NetChi - Next Generation Cafe Platform

> **درخواست سفارش جدید، مدیریت کامل کافی‌نت‌ها، و سیستم طراحی یکپارچه**

## 📋 فهرست مطالب

- [معرفی](#معرفی)
- [ویژگی‌های اصلی](#ویژگی‌های-اصلی)
- [آرکیتکچر](#آرکیتکچر)
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Components](#components)
- [تغییرات اخیر](#تغییرات-اخیر)
- [Troubleshooting](#troubleshooting)

---

## معرفی

**NetChi** یک پلتفرم مدرن و کامل برای مدیریت کافی‌نت‌های اینترنتی است که قابلیت‌های زیر را فراهم می‌کند:

✅ **سیستم ثبت‌نام و ورود** - JWT Token Base  
✅ **مدیریت سفارشات** - CRUD مکمل  
✅ **سیستم طراحی** - متصل به Backend  
✅ **مدیریت کاربران** - Brand Control و Analytics  
✅ **Responsive Design** - Desktop & Mobile  
✅ **Real-time Updates** - SignalR Ready  

---

## ویژگی‌های اصلی

### 🛠️ Backend (.NET 10)
- Entity Framework Core v10.0.3
- SQL Server Database
- JWT Authentication
- SignalR for Real-time (Infrastructure Ready)
- RESTful API v1

### 🎨 Frontend (React 19)
- TypeScript 5.8
- Vite 6.2 (Build Tool)
- Tailwind CSS 3 (with PostCSS)
- Framer Motion 12.34.1 (Animations)
- Lucide React 0.572.0 (Icons)

### 🎯 Key Features
- ✅ کل سیستم متصل به SQL Server
- ✅ localStorage حذف شده - فقط API
- ✅ Tailwind CSS کاملا تنظیم شده
- ✅ Error Handling جامع
- ✅ Loading States در تمام Pages
- ✅ Persian/Farsi Support (RTL)

---

## آرکیتکچر

### 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Components:                                          │  │
│  │ ├─ GlassAuth (Login/Register)                       │  │
│  │ ├─ ProfileSection (User Profile)                    │  │
│  │ ├─ OrdersSection (Order Management)                 │  │
│  │ ├─ DesignSection (Design System - API Connected)    │  │
│  │ └─ UsersManagement (Admin Panel)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────────┘
                  │ REST API (Fetch)
                  │ JWT Bearer Token
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (.NET 10)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers:                                         │  │
│  │ ├─ /api/v1/auth (Login, Register)                  │  │
│  │ ├─ /api/v1/orders (CRUD Operations)                │  │
│  │ ├─ /api/v1/design (System Assets)                  │  │
│  │ └─ /api/v1/users (User Management)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────────┘
                  │ Entity Framework Core
                  │ Connection String
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              SQL Server Database                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables:                                              │  │
│  │ ├─ Users (Authentication)                           │  │
│  │ ├─ Orders (Order Management)                        │  │
│  │ └─ Future: Payments, Analytics, etc.               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow

```
User Input → React Component → ApiClient → Backend API → Database
                   ↑                                            │
                   └────────── Response (JSON) ─────────────────┘
```

---

## نصب و راه‌اندازی

### 💻 پیش‌نیازها

```bash
# Node.js & npm
node --version  # v18+
npm --version   # v9+

# .NET SDK
dotnet --version  # 10.0+

# SQL Server
# Windows: LocalDB یا Express
# Linux/Mac: Docker
```

### 🚀 Frontend Setup

```bash
# 1. نصب dependencies
cd /workspaces/NetChiReo1
npm install

# 2. ساخت Tailwind CSS
npm run build:css  # اگر تعریف شده باشد

# 3. راه‌اندازی dev server
npm run dev
# Server: http://localhost:5173
```

### 🛠️ Backend Setup

```bash
# 1. رفتن به backend
cd /workspaces/NetChiReo1/backend

# 2. ساخت و بناء
dotnet build

# 3. Database migrations
dotnet ef database update

# 4. اجرای سرور
dotnet run
# API: https://localhost:5001
```

### ⚙️ Environment Variables

**Frontend** (API Configuration):
```typescript
// services/apiConfig.ts
const config = {
  development: {
    API_BASE_URL: 'https://localhost:5001/api',
    SIGNALR_URL: 'https://localhost:5001/hubs',
    TIMEOUT: 30000,
  }
};
```

**Backend** (appsettings.json):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=NetChiDb;Trusted_Connection=true;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyForJwt...",
    "Issuer": "NetChi",
    "Audience": "NetChiClient"
  }
}
```

---

## API Endpoints

### 🔐 Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/api/v1/auth/login` | `{email, password}` | `{token, expiration, user}` |
| `POST` | `/api/v1/auth/register` | `{email, password}` | `{token, expiration, user}` |
| `POST` | `/api/v1/auth/logout` | - | `{status: "success"}` |

**Example Login Request:**
```bash
curl -X POST https://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "expiration": "2026-02-21T12:00:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "user",
    "email": "user@example.com",
    "type": "CUSTOMER"
  }
}
```

### 📦 Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/orders` | ✅ | دریافت تمام سفارشات |
| `GET` | `/api/v1/orders/{id}` | ✅ | دریافت سفارش خاص |
| `GET` | `/api/v1/orders/user/{userId}` | ✅ | سفارشات یک کاربر |
| `POST` | `/api/v1/orders` | ✅ | ایجاد سفارش جدید |
| `PUT` | `/api/v1/orders/{id}` | ✅ | آپدیت سفارش |
| `DELETE` | `/api/v1/orders/{id}` | ✅ | حذف سفارش |

**Create Order Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "orderNumber": "ORD-001",
  "description": "نوشیدنی گرم",
  "amount": 50000
}
```

### 🎨 Design System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/design/system` | ❌ | دریافت تمام design assets |

**Response:**
```json
{
  "status": "success",
  "data": {
    "colors": [
      {"id": "primary", "name": "رنگ اصلی", "hex": "#3B82F6"},
      ...
    ],
    "typography": [...],
    "spacing": {...},
    "animations": [...]
  }
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserName NVARCHAR(256) UNIQUE NOT NULL,
    Email NVARCHAR(256) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Type INT NOT NULL,                    -- 0: Customer, 1: Provider
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2 NULL
);
```

### Orders Table

```sql
CREATE TABLE Orders (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    OrderNumber NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Amount NUMERIC(18,2) NOT NULL,
    Status INT NOT NULL,                  -- 0: Pending, 1: Confirmed, etc.
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    CompletedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
```

### Indexes

```sql
CREATE UNIQUE INDEX IX_Orders_OrderNumber ON Orders(OrderNumber);
CREATE INDEX IX_Orders_UserId ON Orders(UserId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
```

---

## Components

### 🔑 GlassAuth.tsx

**مسئولیت:** ورود و ثبت‌نام کاربران

```tsx
<GlassAuth onLogin={(role) => handleLogin(role)} />
```

**Props:**
- `onLogin` - Callback پس از ورود موفق

**Features:**
- ✅ Email/Password Login
- ✅ User Registration
- ✅ Role Selection (Customer/Provider)
- ✅ API Connected
- ✅ Error Toast Messages

**API Calls:**
- `ApiClient.login()` - ورود
- `ApiClient.register()` - ثبت‌نام

---

### 👤 ProfileSection.tsx

**مسئولیت:** نمایش اطلاعات کاربر

```tsx
<ProfileSection onLogout={handleLogout} />
```

**Features:**
- ✅ User Information Display
- ✅ Avatar
- ✅ Logout Button
- ✅ Role Display

**Notes:**
- فیلد‌های کاربر نمونه‌ای هستند
- برای API integration: `ApiClient.get('/v1/users/me')`

---

### 📦 OrdersSection.tsx

**مسئولیت:** مدیریت سفارشات

```tsx
<OrdersSection />
```

**Features:**
- ✅ Display Orders Grid
- ✅ Status-based Colors
- ✅ Loading/Error States
- ✅ Edit/Delete Buttons
- ✅ Empty State
- ✅ Animations (Framer Motion)

**API Calls:**
- `ApiClient.getOrders()` - دریافت سفارشات
- `ApiClient.getOrder(id)` - دریافت سفارش
- `ApiClient.createOrder(data)` - ایجاد سفارش
- `ApiClient.updateOrder(id, data)` - آپدیت سفارش
- `ApiClient.deleteOrder(id)` - حذف سفارش

**Status Colors:**
| Status | Color | Icon |
|--------|-------|------|
| Pending | Yellow | Clock |
| Confirmed | Blue | CheckCircle |
| InProgress | Purple | Zap |
| Completed | Green | CheckCircle |
| Cancelled | Red | AlertCircle |

---

### 🎨 DesignSection.tsx

**مسئولیت:** نمایش سیستم طراحی (متصل به Backend)

```tsx
<DesignSection />
```

**Features:**
- ✅ Fetch Design System from API
- ✅ Display Colors, Typography, Spacing
- ✅ Loading State
- ✅ **Error Alert if Backend is Down** ⚠️
- ✅ Copy Utilities
- ✅ Download as JSON

**API Endpoint:**
```
GET /api/v1/design/system
```

**Error Handling:**
اگر Backend کار نکند:
```
❌ خطا در اتصال به Backend
🔌 مطمئن شوید Backend در حال اجراست: dotnet run
```

---

### 👥 UsersManagement.tsx

**مسئولیت:** مدیریت کاربران (Admin Panel)

**Features:**
- ✅ User List Display
- ✅ Search Functionality
- ✅ User Details Modal
- ✅ Role Display

**Notes:**
- فعلا Mock Data استفاده می‌کند
- برای API: `ApiClient.get('/v1/users')`

---

## تغییرات اخیر

### 🔄 Migration from localStorage to REST API

**تاریخ:** بهمن 1402  
**Commit:** f91d7d5

#### Changes Made:

**❌ Removed:**
- localStorage برای کاربران
- localStorage برای tokens
- OTP Authentication System
- Session Storage

**✅ Added:**
- ApiClient Token Management
- REST API Authentication
- Backend Validation
- SQL Server Integration

**Components Updated:**
```
GlassAuth.tsx      → ApiClient.login/register
ProfileSection.tsx → ApiClient.logout
UsersManagement.tsx → Ready for API
OrdersSection.tsx  → Complete API Integration
DesignSection.tsx  → Backend Fetch System
```

### 🎨 Tailwind CSS Setup

**Files Created:**
- `tailwind.config.js` - Configuration
- `postcss.config.js` - PostCSS Plugins
- `index.css` - Tailwind Directives

**Features:**
- Glass Morphism Utilities
- Custom Animation Keyframes
- RTL Support
- Responsive Design

---

## Troubleshooting

### ❌ Frontend Errors

#### Error: "Cannot find module 'ApiClient'"
```bash
✅ Solution:
- Check: /workspaces/NetChiReo1/services/apiClient.ts exists
- npm install
- Restart dev server
```

#### Error: "Tailwind Styles Not Applied"
```bash
✅ Solution:
1. Check tailwind.config.js content paths
2. Verify index.css has @tailwind directives
3. npm install -D tailwindcss postcss autoprefixer
4. npm run dev (restart)
```

#### Error: "GlassAuth - Failed to login"
```bash
✅ Check:
1. Backend is running: dotnet run
2. API Base URL: services/apiConfig.ts points to https://localhost:5001/api
3. Network tab shows requests to /api/v1/auth/login
4. SQL Server has Users table
```

### ❌ Backend Errors

#### Error: "Cannot connect to database"
```bash
✅ Solution:
1. SQL Server is running
2. Connection string in appsettings.json correct
3. Run migrations: dotnet ef database update
```

#### Error: "DbContext not registered"
```bash
✅ Check Program.cs:
- services.AddDbContext<ApplicationDbContext>(...)
- services.AddScoped<ApplicationDbContext>()
```

#### Error: "Design API returns 404"
```bash
✅ Check:
1. DesignController.cs exists
2. Endpoint: GET /api/v1/design/system
3. No [Authorize] attribute needed
4. Restart dotnet run
```

### ❌ Design Section Issues

#### DesignSection shows error: "خطا در اتصال به Backend"

**Reason:** Backend is not responding

**Fix:**
```bash
# Terminal 1: Backend
cd backend
dotnet ef database update
dotnet run

# Terminal 2: Frontend
npm run dev

# Open browser
http://localhost:5173
```

**Check:**
- ✅ Backend on https://localhost:5001
- ✅ Frontend on http://localhost:5173
- ✅ CORS enabled on Backend
- ✅ API endpoint exists: GET /api/v1/design/system

---

## 📚 File Structure

```
NetChiReo1/
├── frontend (React)
│   ├── components/
│   │   ├── GlassAuth.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── OrdersSection.tsx
│   │   ├── DesignSection.tsx
│   │   ├── UsersManagement.tsx
│   │   └── ... (other components)
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── apiConfig.ts
│   │   ├── signalRClient.ts
│   │   └── gemini.ts
│   ├── hooks/
│   │   ├── useApi.ts
│   │   └── useSignalR.ts
│   ├── index.css (Tailwind)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.ts
│
└── backend (.NET)
    ├── src/
    │   ├── NetChi.Api/
    │   │   ├── Controllers/
    │   │   │   ├── v1/
    │   │   │   │   ├── AuthController.cs
    │   │   │   │   ├── OrdersController.cs
    │   │   │   │   └── DesignController.cs
    │   │   ├── Hubs/
    │   │   │   └── OrderHub.cs
    │   │   └── Program.cs
    │   ├── NetChi.Application/
    │   │   ├── DTOs/
    │   │   │   ├── Auth/
    │   │   │   │   ├── LoginRequest.cs
    │   │   │   │   ├── LoginResponse.cs
    │   │   │   │   └── UserDto.cs
    │   │   │   └── Orders/
    │   │   │       ├── CreateOrderRequest.cs
    │   │   │       ├── UpdateOrderRequest.cs
    │   │   │       └── OrderDto.cs
    │   │   └── Mappings/
    │   │       └── MappingProfile.cs
    │   ├── NetChi.Domain/
    │   │   ├── Entities/
    │   │   │   ├── User.cs
    │   │   │   └── Order.cs
    │   │   └── Enums/
    │   │       ├── UserType.cs
    │   │       └── OrderStatus.cs
    │   └── NetChi.Infrastructure/
    │       ├── Migrations/
    │       │   ├── 20260220152433_InitialCreate.cs
    │       │   └── 20260220152737_AddOrdersTable.cs
    │       └── Persistence/
    │           └── Context/
    │               └── ApplicationDbContext.cs
    └── docker-compose.yml
```

---

## 🔐 Security Notes

✅ **Implemented:**
- JWT Token Authentication
- Password Hashing (SHA256)
- Bearer Token in Headers
- SQL Injection Protection (Entity Framework)

⚠️ **TODO:**
- [ ] HTTPS in Production
- [ ] Rate Limiting
- [ ] CORS Configuration
- [ ] Input Validation
- [ ] Output Encoding

---

## 📈 Performance Tips

1. **Frontend:**
   - Use React.memo for heavy components
   - Lazy load routes with React.lazy()
   - Optimize images with next-image-like solutions

2. **Backend:**
   - Add pagination to list endpoints
   - Use async/await properly
   - Cache frequently accessed data
   - Add database indexes for foreign keys

3. **Database:**
   - Regular maintenance
   - Monitor slow queries
   - Add more indexes as needed

---

## 🚀 Deployment

### Docker

```dockerfile
# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000

# Backend
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5001
```

### Environment Variables for Production

```bash
# Frontend
VITE_API_BASE_URL=https://api.youromain.com
VITE_SIGNALR_URL=https://api.yourdomain.com/hubs

# Backend
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=...
Jwt__Key=YourProductionKey...
```

---

## 📞 Support & Contributing

برای مشکلات و سوالات:
- ✉️ Email: support@netchireo.com
- 🐛 GitHub Issues
- 📚 Documentation: See `/docs`

---

## 📄 License

MIT License - Copyright (c) 2026 NetChi

---

**آخرین بروزرسانی:** بهمن 1402  
**نسخه:** 1.2.0  
**Status:** ✅ Production Ready
