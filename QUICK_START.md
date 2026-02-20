# ⚡ Quick Start Guide - NetChi v1.2.0

> **شروع کنید در 5 دقیقه!**

---

## 1️⃣ Prerequisites

```bash
# Check you have these installed:
node --version      # Should be v18+
npm --version       # Should be v9+
dotnet --version    # Should be 10.0+
```

If not installed:
- [Node.js](https://nodejs.org/en/download)
- [.NET SDK](https://dotnet.microsoft.com/en-us/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

---

## 2️⃣ Clone & Setup

```bash
# Clone repository
git clone https://github.com/wwwbitcoinbtc-beep/NetChiReo1.git
cd NetChiReo1
```

---

## 3️⃣ Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Build project
dotnet build

# Update database
dotnet ef database update

# Run backend
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
      Now listening on: http://localhost:5000
```

✅ Backend is ready on `https://localhost:5001`

---

## 4️⃣ Frontend Setup (Terminal 2)

```bash
# Back to root directory
cd ..

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE v6.2.0
Local: http://localhost:5173/
```

✅ Frontend is ready on `http://localhost:5173`

---

## 5️⃣ Test the App

### In Browser (http://localhost:5173)

1. **See Login Screen** ✅
2. **Create Account**
   - Email: `test@example.com`
   - Password: `Password123`
   - Role: Customer
   - Click "Create Account"

3. **Login** ✅
4. **Navigate**
   - Click "سفارشات" (Orders) → See Orders page
   - Click "سیستم طراحی" (Design) → See Design system from API
   - Click "پروفایل" (Profile) → See profile page

5. **Verify Backend Connection** ✅
   - If Design page shows error → Backend might be down
   - If Design page loads → Backend is working!

---

## 🔌 API Testing

### Login Test
```bash
curl -X POST https://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiration": "2026-02-21T16:00:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "test",
    "email": "test@example.com",
    "type": "CUSTOMER"
  }
}
```

### Get Design System Test
```bash
curl https://localhost:5001/api/v1/design/system -k
```

Should return:
```json
{
  "status": "success",
  "data": {
    "colors": [...],
    "typography": [...],
    "spacing": {...}
  }
}
```

---

## 📱 Views Available

After login, you can navigate to:

| View | Route | Purpose |
|------|-------|---------|
| **Profile** | `/` (redirect) | User info & logout |
| **Orders** | Orders menu | Manage orders |
| **Design** | Design menu | View design system |
| **Users** | Users menu | (Admin only) |

---

## 🛑 Troubleshooting

### Problem: "Cannot connect to database"
```bash
# Solution:
# 1. Make sure SQL Server is running
# 2. Check appsettings.json connection string
# 3. Run migrations:
dotnet ef database update
```

### Problem: "Design page shows error"
```bash
# Solution:
# Check Backend is running in Terminal 1
# The error should disappear once Backend starts
# Check Network tab in DevTools
```

### Problem: "API returns 404"
```bash
# Solution:
# 1. Backend might not be running
# 2. Check API base URL: services/apiConfig.ts
# 3. Verify endpoint exists: GET /api/v1/endpoint
```

### Problem: "CORS error"
```bash
# Solution:
# Backend needs CORS enabled (should be in Program.cs)
# Check appsettings.json for allowed origins
```

---

## 📚 Next Steps

1. **Read Documentation**
   - `README.md` - Full documentation
   - `IMPLEMENTATION.md` - What was implemented
   - `ARCHITECTURE.md` - System design

2. **Explore Code**
   - Frontend: `components/` folder
   - Backend: `backend/src/` folder

3. **Modify & Customize**
   - Change colors: `tailwind.config.js`
   - Add new endpoints: `backend/Controllers/`
   - Create new components: `components/`

4. **Deploy**
   - See README.md Deployment section
   - Use Docker or cloud platform

---

## 🎯 Common Tasks

### Add a New Order (via API)

```bash
# Get token first (from login response)
TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST https://localhost:5001/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -k \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "ORD-001",
    "description": "نوشیدنی گرم",
    "amount": 50000
  }'
```

### Get All Orders

```bash
TOKEN="your-token-here"

curl https://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -k
```

---

## 🚀 Performance Tips

- Frontend loads in ~2-3 seconds
- First database query takes ~1 second
- Use DevTools Network tab to optimize

---

## 📞 Need Help?

1. Check the **Troubleshooting** section above
2. Read **README.md** for detailed docs
3. Check **IMPLEMENTATION.md** for what was done
4. Review **DevTools Console** for errors

---

## ✅ Checklist

Before reporting issues:
- [ ] Both Backend and Frontend are running
- [ ] SQL Server is running
- [ ] No ports are blocked (5001, 5173)
- [ ] Checked DevTools Console for errors
- [ ] Checked Network tab for API calls
- [ ] Read Troubleshooting section above

---

## 🎉 You're Ready!

Your NetChi instance is now:
- ✅ Running
- ✅ Connected to Database
- ✅ API is working
- ✅ Frontend displays correctly
- ✅ Design system loads from Backend

**Happy coding!** 🚀

---

**Version:** 1.2.0  
**Last Updated:** بهمن 1402  
**Status:** ✅ Production Ready
