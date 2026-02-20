# 🧪 Testing Guide - NetChi v1.2.0

## Date: February 20, 2026

### ✅ Checklist

#### Phase 1: Authentication Flow
- [ ] **Login with valid credentials**
  - URL: http://localhost:3000
  - Email: user@netchireo.com
  - Password: Test@123456789
  - Expected: User logged in, redirected to dashboard
  - localStorage: User data should be saved

- [ ] **Register new account**
  - Navigate to Register tab
  - Fill all required fields
  - Expected: Account created, localStorage updated
  - Check localStorage: `user` object should exist

- [ ] **User persistence**
  - Login successfully
  - Refresh page (F5)
  - Expected: User remains logged in, profile shows saved user data

- [ ] **Logout functionality**
  - Click logout button in ProfileSection
  - Expected: User data cleared, redirected to login page
  - localStorage: `user` should be removed

---

#### Phase 2: Orders Management
- [ ] **Load orders list**
  - Click "سفارشات" tab
  - Wait for orders to load
  - Expected: Orders displayed in grid format

- [ ] **Order status colors**
  - Verify colors match OrdersSection.tsx:
    - Pending: Yellow/Orange gradient
    - Confirmed: Blue/Cyan gradient
    - InProgress: Purple/Indigo gradient
    - Completed: Green/Emerald gradient
    - Cancelled: Red/Pink gradient

- [ ] **Empty state**
  - If no orders exist
  - Expected: "هیچ سفارشی وجود ندارد" message with icon

- [ ] **Error handling**
  - Stop Backend service
  - Try to load orders
  - Expected: Error message shows, but app doesn't crash

---

#### Phase 3: Design System
- [ ] **Load with Backend running**
  - Click "طراحی" tab
  - Expected: Design system loads from API
  - Shows colors, typography, components

- [ ] **Graceful offline fallback**
  - Stop Backend service
  - Refresh Design page
  - Expected: Yellow banner "شما متصل نیستید..."
  - Design System still displays with cached assets
  - NO RED ERROR PAGE (important!)

- [ ] **Copy to clipboard**
  - Click copy button on any color/component
  - Expected: Code copied, "کپی شد" tooltip shows

---

#### Phase 4: Styling & CSS
- [ ] **Tailwind CSS classes apply**
  - All buttons have proper styling
  - Glass effects render correctly
  - Gradients display properly
  - Backdrop blur works

- [ ] **Responsive design**
  - Test on mobile (320px width)
  - Test on tablet (768px width)
  - Test on desktop (1024px+ width)
  - Expected: Layout adapts correctly

- [ ] **Dark text on light backgrounds**
  - No contrast issues
  - All text readable
  - Icons visible

---

#### Phase 5: API Integration
- [ ] **Login endpoint**
  - POST /api/v1/auth/login
  - Body: `{ email: "...", password: "..." }`
  - Expected: 200 OK + token + user data

- [ ] **Get orders endpoint**
  - GET /api/v1/orders
  - Headers: `Authorization: Bearer <token>`
  - Expected: 200 OK + orders array

- [ ] **Design system endpoint**
  - GET /api/v1/design/system
  - Headers: `Authorization: Bearer <token>`
  - Expected: 200 OK + design assets

- [ ] **Error responses**
  - Unauthorized (401): No token
  - Forbidden (403): Invalid token
  - NotFound (404): Wrong endpoint
  - Expected: Proper error messages

---

### 🚀 Test Scenarios

#### Scenario 1: First-time User
1. Open app → Login page
2. Click "Register"
3. Fill form: email, password
4. Submit → Account created
5. Redirected to dashboard
6. Check localStorage has user data
7. Refresh page → User still logged in
✓ **Pass if:** User data persists

#### Scenario 2: Orders Flow
1. Login successfully
2. Navigate to Orders
3. View order list
4. Hover over order → Edit/Delete buttons appear
5. Click order → Details show
✓ **Pass if:** Orders display correctly with all data

#### Scenario 3: Offline Design System
1. Backend running → Load Design page ✓
2. Stop Backend (`Ctrl+C`)
3. Refresh Design page
4. Yellow warning appears BUT design still shows
5. No red error page
✓ **Pass if:** Design shows gracefully with fallback

#### Scenario 4: Token Expiration
1. Login successfully
2. Wait 24 hours (or manually expire token)
3. Try to access protected resource
4. App should show login prompt
✓ **Pass if:** User re-authenticates properly

---

### 📊 Test Coverage

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ⏳ To Test | API integration |
| Register | ⏳ To Test | API integration |
| localStorage | ⏳ To Test | User persistence |
| Orders List | ⏳ To Test | API + Display |
| Order Status | ⏳ To Test | Style variations |
| Design System | ⏳ To Test | API fallback |
| Logout | ⏳ To Test | Data cleanup |
| Error Handling | ⏳ To Test | API failures |
| Responsive | ⏳ To Test | All screen sizes |
| CSS Styling | ⏳ To Test | Tailwind output |

---

### 🔧 Debugging Tips

**If orders don't load:**
```bash
# Check Backend is running
cd backend && dotnet run

# Check API response
curl -X GET "https://localhost:5001/api/v1/orders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**If Design System doesn't show fallback:**
- Check browser console for errors
- Verify DesignSection.tsx has fallback assets
- Clear browser cache

**If localStorage not persisting:**
- Check browser DevTools > Application > localStorage
- Verify GlassAuth saves user on login
- Check ProfileSection loads from localStorage

**If Tailwind styles not applying:**
- Verify npm run build completes
- Check index.css imports
- Verify tailwind.config.js content patterns

---

### 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✓ Tested |
| Firefox | Latest | ✓ Tested |
| Safari | Latest | ? Not tested |
| Edge | Latest | ? Not tested |
| Mobile Chrome | Latest | ⏳ To test |

---

### 🎯 Performance Targets

- **Page Load:** < 3 seconds
- **Orders Load:** < 1 second
- **Design Load:** < 2 seconds (with API)
- **API Response:** < 500ms
- **Bundle Size:** < 500KB (gzipped)

---

### ✅ Final Verification Before Production

- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] localStorage works correctly
- [ ] API fallback works
- [ ] Responsive on all devices
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Git commits pushed
- [ ] Deployment ready

---

### 📝 Test Results

```
Date: ___________
Tester: ___________

Phase 1 (Auth): ___/5 ✓
Phase 2 (Orders): ___/3 ✓
Phase 3 (Design): ___/3 ✓
Phase 4 (Styling): ___/3 ✓
Phase 5 (API): ___/4 ✓

Overall Score: ___/18

Issues Found:
1. ___________
2. ___________
3. ___________

Approved for Production: [ ] Yes [ ] No
```

---

**Last Updated:** February 20, 2026  
**Status:** Ready for Testing  
**Next Step:** Execute test scenarios
