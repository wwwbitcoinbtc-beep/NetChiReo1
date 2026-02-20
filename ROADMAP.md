# 🛣️ NetChi - Development Roadmap

Recommended next steps and features to implement.

## Phase 1️⃣ : Foundation (Week 1)

### ✅ Already Done
- [x] Backend API structure (ASP.NET Core 10)
- [x] Frontend setup (React + Vite)
- [x] Database (SQL Server Docker)
- [x] API client integration
- [x] Real-time (SignalR) foundation
- [x] Authentication structure
- [x] Security (JWT, CORS, Rate Limiting)
- [x] Documentation

### 🚀 Next Tasks
- [ ] **Create Login/Register Pages**
  - Use `useLogin()` hook
  - Form validation
  - Error handling
  - Token storage
  - Redirect logic
  - **Files to create:**
    - `components/LoginPage.tsx`
    - `components/RegisterPage.tsx`
    - Form validation hooks

- [ ] **Create Orders List Page**
  - Use `useOrders().getOrders()`
  - Display in table/grid
  - Pagination
  - Search/filter
  - **Files to create:**
    - `components/OrdersList.tsx`
    - `components/OrderCard.tsx`

- [ ] **Create Order Details Page**
  - Use `useOrders().getOrder(id)`
  - Show order info
  - Update status button
  - **Files to create:**
    - `components/OrderDetail.tsx`

---

## Phase 2️⃣ : Real-time Features (Week 2)

### Tasks
- [ ] **Real-time Order Updates**
  - Use `useSignalR()` hook
  - Join order group on page load
  - Listen for status changes
  - Update UI without refresh
  - **Example code:**
    ```typescript
    useEffect(() => {
      connect();
      joinOrderGroup(orderId);
      client.onOrderStatusChanged((data) => {
        setOrder(prev => ({...prev, status: data.status}));
      });
    }, [orderId]);
    ```

- [ ] **Real-time Notifications**
  - Toast notifications for updates
  - Sound alerts (optional)
  - **Libraries:** react-toastify or custom component

- [ ] **Live Chat/Messaging**
  - Basic messaging system
  - Use SignalR groups
  - Message history
  - **Backend:** Add Message entity

---

## Phase 3️⃣ : Authentication Enhancements (Week 3)

### Tasks
- [ ] **Implement API Auth Endpoints**
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/refresh-token
  - POST /api/v1/auth/logout
  - **Backend:**
    ```csharp
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Validate credentials
        // Generate JWT token
        // Return response
    }
    ```

- [ ] **Add User Profile Page**
  - Show user info
  - Edit profile
  - Change password
  - **Endpoint:** GET /api/v1/users/{id}

- [ ] **Role-based Access Control (RBAC)**
  - Customer dashboard
  - Admin panel
  - Service provider portal
  - **Backend:** Update authorization policies

---

## Phase 4️⃣ : Order Management (Week 4)

### Tasks
- [ ] **Create Order Form**
  - Select items/products
  - Add to cart
  - Validate form
  - Submit via API
  - **Endpoint:** POST /api/v1/orders

- [ ] **Order Status Workflow**
  - Pending → Preparing → Ready → Picked-up
  - Status validation
  - History tracking
  - **Real-time:** Broadcast status changes

- [ ] **Order History**
  - Pagination
  - Search/filter
  - Export to PDF
  - **Endpoint:** GET /api/v1/orders?page=1&limit=10

---

## Phase 5️⃣ : Admin Features (Week 5)

### Tasks
- [ ] **Admin Dashboard**
  - Sales statistics
  - Order metrics
  - User management
  - **Components:**
    - `components/AdminDashboard.tsx`
    - `components/Charts.tsx`

- [ ] **User Management**
  - List all users
  - Create user
  - Edit user
  - Delete user
  - **Endpoints:** Full CRUD for /api/v1/users

- [ ] **Product/Menu Management**
  - Create products
  - Edit products
  - Delete products
  - Availability toggle
  - **Backend:** Add Product entity

---

## Phase 6️⃣ : Advanced Features (Week 6+)

### Tasks
- [ ] **Payment Integration**
  - Stripe or PayPal integration
  - Payment status
  - Invoice generation
  - **Backend:** Add Payment entity

- [ ] **Ratings & Reviews**
  - User reviews on orders
  - Star ratings
  - Review display
  - **Backend:** Add Review entity

- [ ] **Push Notifications**
  - Order status updates
  - Promotional offers
  - Service announcements
  - **Options:** Firebase FCM or Twilio

- [ ] **Analytics**
  - Sales tracking
  - User behavior
  - Traffic analysis
  - **Options:** Google Analytics or custom

- [ ] **Multi-language Support**
  - i18n setup
  - Persian + English (minimum)
  - **Libraries:** react-i18next

- [ ] **Mobile Responsive**
  - Optimize for mobile
  - Touch-friendly UI
  - Mobile navigation

---

## Implementation Guide

### 1. Create New Endpoint (Backend)

```csharp
// Step 1: Create DTO
public class CreateOrderRequest
{
    public List<int> ProductIds { get; set; }
    public string DeliveryAddress { get; set; }
}

// Step 2: Create Controller Action
[HttpPost]
[Authorize]
public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
{
    // Validate request
    // Call application service
    // Return response
    return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
}

// Step 3: Migration (if new entity)
dotnet ef migrations add AddOrder -p src/NetChi.Infrastructure -s src/NetChi.Api
dotnet ef database update
```

### 2. Create New React Component

```typescript
// Step 1: Create component file
// components/OrderForm.tsx

import { useApi } from '../hooks/useApi';

export function OrderForm() {
  const [order, setOrder] = useState({});
  const { data, request } = useApi();

  const handleSubmit = async () => {
    await request(() => 
      fetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Authorization': `Bearer ${token}` }
      })
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Add Real-time Features

```typescript
// Use SignalR for live updates
const { connect, client } = useSignalR();

useEffect(() => {
  connect();
  client.onOrderStatusChanged((data) => {
    console.log('Order updated:', data);
    // Update UI
  });
}, []);
```

---

## Database Evolution

### Current Schema
```
Tables:
└── Users
    ├── Id
    ├── UserName
    ├── Email
    ├── PasswordHash
    ├── PhoneNumber
    ├── Type (enum)
    ├── IsActive
    ├── CreatedAt
    └── LastLoginAt
```

### Phase 2 Schema
```
Tables:
├── Users (existing + relations)
├── Products
│   ├── Id
│   ├── Name
│   ├── Description
│   ├── Price
│   ├── Category
│   └── IsAvailable
├── Orders
│   ├── Id
│   ├── UserId (FK)
│   ├── Status
│   ├── TotalAmount
│   ├── CreatedAt
│   └── UpdatedAt
└── OrderItems
    ├── Id
    ├── OrderId (FK)
    ├── ProductId (FK)
    ├── Quantity
    └── Price
```

### Phase 3+ Schema
```
Additional tables:
├── Payments
│   ├── OrderId (FK)
│   ├── Amount
│   ├── Method
│   └── Status
├── Reviews
│   ├── Id
│   ├── UserId (FK)
│   ├── OrderId (FK)
│   ├── Rating
│   └── Comment
├── Categories
│   ├── Id
│   ├── Name
│   └── Description
└── Messages
    ├── Id
    ├── SenderId (FK)
    ├── ReceiverId (FK)
    ├── Content
    └── Timestamp
```

---

## Testing Strategy

### Unit Tests
```csharp
// Backend tests
[Test]
public async Task CreateOrder_WithValidData_ReturnsCreated()
{
    // Arrange
    var request = new CreateOrderRequest { ... };
    
    // Act
    var result = await controller.CreateOrder(request);
    
    // Assert
    Assert.IsInstanceOf<CreatedAtActionResult>(result);
}
```

### Integration Tests
```csharp
// Test API endpoints end-to-end
[Test]
public async Task Orders_GetAll_ReturnsOkResult()
{
    // Setup test data
    // Call API
    // Assert response
}
```

### Frontend Tests
```typescript
// Test React components
describe('OrdersList', () => {
  it('should display orders', async () => {
    render(<OrdersList />);
    await waitFor(() => {
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Checklist

- [ ] Database indexes on frequently queried columns
- [ ] Query optimization (eager loading, projection)
- [ ] API response compression
- [ ] Frontend bundle optimization
- [ ] Implement caching strategy
- [ ] CDN for static assets
- [ ] Database connection pooling
- [ ] Rate limiting tuning
- [ ] SignalR message optimization
- [ ] Frontend images optimization

---

## Security Checklist

- [ ] Hash passwords properly (Bcrypt/PBKDF2)
- [ ] Implement refresh tokens
- [ ] CSRF protection
- [ ] Input validation/sanitization
- [ ] SQL injection prevention (✅ EF Core)
- [ ] HTTPS everywhere (✅ configured)
- [ ] Secure headers (✅ configured)
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] Regular security updates

---

## Deployment Phases

### Phase 1: Local Development
- [x] Docker containers
- [x] Local database
- [x] Hot reload

### Phase 2: Staging
- [ ] Deploy to staging server
- [ ] Run full test suite
- [ ] Performance testing
- [ ] Security scanning

### Phase 3: Production
- [ ] Azure App Service
- [ ] Production SQL Server
- [ ] CDN setup
- [ ] Monitoring & alerts
- [ ] Backup strategy
- [ ] SSL certificates

---

## Quick Links for Implementation

| Task | Backend | Frontend |
|------|---------|----------|
| Login | `/api/v1/auth/login` | `useLogin()` |
| Orders | `/api/v1/orders` | `useOrders()` |
| Real-time | SignalR hub | `useSignalR()` |
| Database | EF Core migration | N/A |
| Tests | xUnit/Moq | Vitest |

---

## Estimated Timeline

- **Week 1:** Foundation + Login/Orders
- **Week 2:** Real-time features
- **Week 3:** Advanced auth
- **Week 4:** Order management
- **Week 5:** Admin features
- **Week 6+:** Advanced features & scaling

---

## Getting Help

1. **API Questions?** See [backend/README.md](./backend/README.md)
2. **Setup Issues?** See [INTEGRATION.md](./INTEGRATION.md)
3. **Architecture?** See [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Deployment?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Start with Phase 1, Week 1 tasks. You have all the foundation ready! 🚀**
