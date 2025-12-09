# API Testing Guide - Planner Backend

Complete guide to test all authentication endpoints using **Postman**, **Thunder Client**, or **cURL**.

---

## 🌐 Base URL

```
http://127.0.0.1:8000/api/
```

---

## 1️⃣ Register New User

### Endpoint
```
POST /api/auth/register/
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
}
```

### Expected Response (201 Created)
```json
{
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User"
    },
    "message": "User registered successfully",
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
}
```

### cURL Command
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"testuser@example.com\",\"password\":\"SecurePass123!\",\"password2\":\"SecurePass123!\",\"first_name\":\"Test\",\"last_name\":\"User\"}"
```

### Validation Notes
- Username must be unique
- Email must be valid and unique
- Password must meet Django's password validation requirements
- password and password2 must match

---

## 2️⃣ Login User

### Endpoint
```
POST /api/auth/login/
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "username": "testuser",
    "password": "SecurePass123!"
}
```

### Expected Response (200 OK)
```json
{
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User"
    },
    "message": "Login successful",
    "tokens": {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
}
```

### cURL Command
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"SecurePass123!\"}"
```

### Error Responses

**Invalid Credentials (401)**
```json
{
    "error": "Invalid username or password"
}
```

**Account Disabled (403)**
```json
{
    "error": "Account is disabled"
}
```

---

## 3️⃣ Get User Profile

### Endpoint
```
GET /api/users/profile/
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Expected Response (200 OK)
```json
{
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User",
        "date_joined": "2025-12-09T10:30:00Z"
    }
}
```

### cURL Command
```bash
curl -X GET http://127.0.0.1:8000/api/users/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Important Notes
- Replace `<access_token>` with the actual token received from login/register
- Token expires after 1 hour
- If token expired, use refresh token endpoint to get a new one

---

## 4️⃣ Update User Profile

### Endpoint
```
PUT /api/users/profile/
```
or
```
PATCH /api/users/profile/
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body (All fields for PUT, partial for PATCH)
```json
{
    "first_name": "Updated",
    "last_name": "Name",
    "email": "newemail@example.com"
}
```

### Expected Response (200 OK)
```json
{
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "newemail@example.com",
        "first_name": "Updated",
        "last_name": "Name",
        "date_joined": "2025-12-09T10:30:00Z"
    },
    "message": "Profile updated successfully"
}
```

### cURL Command
```bash
curl -X PATCH http://127.0.0.1:8000/api/users/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Updated\",\"last_name\":\"Name\"}"
```

---

## 5️⃣ Change Password

### Endpoint
```
POST /api/auth/change-password/
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body
```json
{
    "old_password": "SecurePass123!",
    "new_password": "NewSecurePass456!",
    "new_password2": "NewSecurePass456!"
}
```

### Expected Response (200 OK)
```json
{
    "message": "Password changed successfully"
}
```

### cURL Command
```bash
curl -X POST http://127.0.0.1:8000/api/auth/change-password/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"old_password\":\"SecurePass123!\",\"new_password\":\"NewSecurePass456!\",\"new_password2\":\"NewSecurePass456!\"}"
```

---

## 6️⃣ Refresh Access Token

### Endpoint
```
POST /api/auth/token/refresh/
```

**Note**: All `/api/users/` endpoints now require authentication.

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Expected Response (200 OK)
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### cURL Command
```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d "{\"refresh\":\"YOUR_REFRESH_TOKEN_HERE\"}"
```

### Notes
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Rotation is enabled (you get a new refresh token)

---

## 7️⃣ Logout User

### Endpoint
```
POST /api/auth/logout/
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Request Body
```json
{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Expected Response (200 OK)
```json
{
    "message": "Logout successful"
}
```

### cURL Command
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"YOUR_REFRESH_TOKEN_HERE\"}"
```

### Notes
- This blacklists the refresh token
- User must login again to get new tokens
- Old tokens cannot be reused

---

## 8️⃣ List All Users (Testing Endpoint)

### Endpoint
```
GET /api/users/list/
```

### Headers
```
Authorization: Bearer <access_token>
```

### Expected Response (200 OK)
```json
[
    {
        "id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "first_name": "Test",
        "last_name": "User",
        "date_joined": "2025-12-09T10:30:00Z"
    },
    {
        "id": 2,
        "username": "anotheruser",
        "email": "another@example.com",
        "first_name": "Another",
        "last_name": "User",
        "date_joined": "2025-12-09T11:00:00Z"
    }
]
```

### cURL Command
```bash
curl -X GET http://127.0.0.1:8000/api/users/list/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🧪 Testing Workflow

### Complete Test Scenario:

1. **Register** a new user → Get tokens
2. **Login** with credentials → Get tokens
3. **Get Profile** using access token
4. **Update Profile** using access token
5. **Change Password** using access token
6. **Login** with new password
7. **Refresh Token** when access token expires
8. **Logout** using refresh token
9. Try to use blacklisted token → Should fail

---

## 🔑 Token Management Tips

### In Postman/Thunder Client:

1. **Save tokens as variables**:
   - After login/register, save the access and refresh tokens
   - Use them in subsequent requests

2. **Create a collection**:
   - Add all endpoints to a collection
   - Set `{{baseUrl}}` = `http://127.0.0.1:8000/api`
   - Set `{{accessToken}}` and `{{refreshToken}}` variables

3. **Authorization Header Format**:
   ```
   Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   ```
   (Note: "Bearer" followed by space, then the token)

---

## ❌ Common Errors

### 401 Unauthorized
- Missing or invalid token
- Token expired (use refresh endpoint)

### 400 Bad Request
- Invalid request body format
- Missing required fields
- Validation errors

### 403 Forbidden
- Account is disabled
- Insufficient permissions

### 404 Not Found
- Wrong endpoint URL

---

## 📊 Testing with Postman Collection

You can import this JSON to create a Postman collection:

```json
{
    "info": {
        "name": "Planner API - Authentication",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://127.0.0.1:8000/api"
        },
        {
            "key": "accessToken",
            "value": ""
        },
        {
            "key": "refreshToken",
            "value": ""
        }
    ]
}
```

---

## ✅ Test Checklist

- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Get user profile with valid token
- [ ] Get profile without token (should fail)
- [ ] Update user profile
- [ ] Change password
- [ ] Refresh access token
- [ ] Logout user
- [ ] Try using blacklisted token (should fail)
- [ ] List all users

---

## 🎉 Success Criteria

All endpoints should:
- Return proper status codes
- Include appropriate error messages
- Validate input data
- Secure protected endpoints
- Handle token expiration correctly

---

**Ready to test! Start your Django server and begin testing! 🚀**

