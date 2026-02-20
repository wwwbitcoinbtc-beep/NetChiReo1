# 🧪 API Test Cases - NetChi v1.2.0

## Base URL
```
http://localhost:3000        # Frontend (Vite Dev Server)
https://localhost:5001       # Backend (ASP.NET Core)
https://localhost:5001/api   # API Endpoint
```

---

## 📌 Authentication API Tests

### 1. User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request:**
```bash
curl -X POST https://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@netchireo.com",
    "password": "SecurePass123!"
  }' \
  --insecure  # Self-signed certificate
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": "2026-02-21T14:30:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "newuser@netchireo.com",
    "email": "newuser@netchireo.com",
    "type": "CUSTOMER"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email or password format
- `409 Conflict` - User already exists
- `500 Internal Server Error` - Server error

**Frontend Integration:**
```tsx
const response = await ApiClient.register({
  email: 'newuser@netchireo.com',
  password: 'SecurePass123!'
});
localStorage.setItem('user', JSON.stringify(response.user));
```

---

### 2. User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```bash
curl -X POST https://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@netchireo.com",
    "password": "Test@123456789"
  }' \
  --insecure
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiration": "2026-02-21T14:30:00Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "user@netchireo.com",
    "email": "user@netchireo.com",
    "type": "CUSTOMER"
  }
}
```

**Test Cases:**
| Input | Expected | Status |
|-------|----------|--------|
| Valid email + valid password | 200 OK + token | ⏳ |
| Valid email + invalid password | 401 Unauthorized | ⏳ |
| Invalid email format | 400 Bad Request | ⏳ |
| Empty credentials | 400 Bad Request | ⏳ |

---

## 📦 Orders API Tests

### 1. Get All Orders

**Endpoint:** `GET /api/v1/orders`

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET https://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --insecure
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2026-001",
    "description": "Coffee Machine Order",
    "amount": 500000,
    "status": "Confirmed",
    "createdAt": "2026-02-20T10:30:00Z",
    "updatedAt": "2026-02-20T11:00:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "orderNumber": "ORD-2026-002",
    "description": "Refrigerator Order",
    "amount": 750000,
    "status": "Pending",
    "createdAt": "2026-02-20T12:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error

**Frontend Integration:**
```tsx
const orders = await ApiClient.getOrders();
setOrders(Array.isArray(orders) ? orders : []);
```

---

### 2. Create Order

**Endpoint:** `POST /api/v1/orders`

**Request:**
```bash
curl -X POST https://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "New Order",
    "amount": 100000,
    "status": "Pending"
  }' \
  --insecure
```

**Expected Response (201 Created):**
```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "orderNumber": "ORD-2026-003",
  "description": "New Order",
  "amount": 100000,
  "status": "Pending",
  "createdAt": "2026-02-20T14:00:00Z"
}
```

---

### 3. Update Order

**Endpoint:** `PUT /api/v1/orders/{id}`

**Request:**
```bash
curl -X PUT https://localhost:5001/api/v1/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated Description",
    "amount": 550000,
    "status": "InProgress"
  }' \
  --insecure
```

**Expected Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "orderNumber": "ORD-2026-001",
  "description": "Updated Description",
  "amount": 550000,
  "status": "InProgress",
  "updatedAt": "2026-02-20T14:15:00Z"
}
```

---

### 4. Delete Order

**Endpoint:** `DELETE /api/v1/orders/{id}`

**Request:**
```bash
curl -X DELETE https://localhost:5001/api/v1/orders/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer $TOKEN" \
  --insecure
```

**Expected Response (204 No Content)**

---

## 🎨 Design System API Tests

### Get Design System

**Endpoint:** `GET /api/v1/design/system`

**Request:**
```bash
curl -X GET https://localhost:5001/api/v1/design/system \
  -H "Authorization: Bearer $TOKEN" \
  --insecure
```

**Expected Response (200 OK):**
```json
{
  "colors": {
    "primary": "#3B82F6",
    "accent": "#10B981",
    "dark": "#1E293B"
  },
  "typography": {
    "heading1": "Vazirmatn, Bold, 32px",
    "heading2": "Vazirmatn, SemiBold, 24px",
    "body": "Vazirmatn, Regular, 16px"
  },
  "components": [
    {
      "id": "button",
      "name": "Button",
      "variants": ["primary", "secondary", "danger"]
    }
  ]
}
```

---

## 🔄 Error Handling Tests

### Test Missing Token

```bash
curl -X GET https://localhost:5001/api/v1/orders \
  --insecure
```

**Expected (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization token"
}
```

---

### Test Invalid Token

```bash
curl -X GET https://localhost:5001/api/v1/orders \
  -H "Authorization: Bearer invalid_token_here" \
  --insecure
```

**Expected (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

---

### Test Not Found

```bash
curl -X GET https://localhost:5001/api/v1/orders/invalid-id \
  -H "Authorization: Bearer $TOKEN" \
  --insecure
```

**Expected (404 Not Found):**
```json
{
  "error": "NotFound",
  "message": "Order not found"
}
```

---

## 📊 Test Results Template

```markdown
## API Test Results - [DATE]

### Authentication
- [ ] Register: ✓ PASS / ✗ FAIL
- [ ] Login: ✓ PASS / ✗ FAIL
- [ ] Token validity: ✓ PASS / ✗ FAIL

### Orders
- [ ] Get all orders: ✓ PASS / ✗ FAIL
- [ ] Create order: ✓ PASS / ✗ FAIL
- [ ] Update order: ✓ PASS / ✗ FAIL
- [ ] Delete order: ✓ PASS / ✗ FAIL

### Design System
- [ ] Get design system: ✓ PASS / ✗ FAIL

### Error Handling
- [ ] Missing token: ✓ PASS / ✗ FAIL
- [ ] Invalid token: ✓ PASS / ✗ FAIL
- [ ] Not found: ✓ PASS / ✗ FAIL

### Issues Found:
1. ...
2. ...

### Approved: [ ] YES [ ] NO
```

---

## 🚀 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="https://localhost:5001/api/v1"
INSECURE="--insecure"

# Register
echo "🔐 Testing Registration..."
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@netchireo.com",
    "password": "Test@123456789"
  }' $INSECURE)

echo $REGISTER | jq .

# Extract token
TOKEN=$(echo $REGISTER | jq -r '.token')
echo "Token: $TOKEN"

# Get orders
echo "📦 Testing Get Orders..."
curl -s -X GET $BASE_URL/orders \
  -H "Authorization: Bearer $TOKEN" $INSECURE | jq .

# Get design
echo "🎨 Testing Design System..."
curl -s -X GET $BASE_URL/design/system \
  -H "Authorization: Bearer $TOKEN" $INSECURE | jq .
```

---

**Last Updated:** February 20, 2026  
**Status:** Ready for Testing  
**Next Step:** Execute test cases
