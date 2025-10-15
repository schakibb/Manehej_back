# Manehej Admin API - Postman Testing Guide

## Overview

This document provides a comprehensive guide for testing the Manehej Admin API using Postman. The API provides secure admin authentication with login, profile management, and password change functionality.

## Base URL
```
http://localhost:3001
```

## Rate Limiting

The API implements rate limiting for security:
- **Login attempts**: 5 requests per 15 minutes per IP
- **Password changes**: 3 requests per hour per IP  
- **General API**: 100 requests per 15 minutes per IP

When rate limits are exceeded, you'll receive:
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

## Setup Instructions

### 1. Environment Setup
1. Create a new environment in Postman called "Manehej Admin API"
2. Add the following variables:
   - `base_url`: `http://localhost:3001`
   - `access_token`: (leave empty, will be set automatically via cookies)
   - `refresh_token`: (leave empty, will be set automatically via cookies)

### 2. Cookie Settings
1. Go to Postman Settings (gear icon)
2. Go to "General" tab
3. Enable "Send cookies automatically"
4. This ensures cookies are automatically sent with requests

### 3. Pre-requisites
- Start the server: `npm run dev`
- Run database migrations: `npm run db:migrate`
- Seed admin user: `npm run db:seed`

### 4. Default Admin Credentials
- **Email**: `admin@manehej.com`
- **Password**: `Admin123!@#`

---

## API Endpoints Testing

### 1. Health Check

**GET** `/health`

Tests if the API server is running.

#### Postman Setup:
- **Method**: GET
- **URL**: `{{base_url}}/health`

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Admin API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### 2. Root Endpoint

**GET** `/`

Returns API information and available endpoints.

#### Postman Setup:
- **Method**: GET
- **URL**: `{{base_url}}/`

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Manehej Admin API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/admin/auth"
  }
}
```

---

### 3. Admin Login

**POST** `/api/admin/auth/login`

Authenticates admin and sets HTTP-only cookies with access and refresh tokens.

#### Postman Setup:
- **Method**: POST
- **URL**: `{{base_url}}/api/admin/auth/login`
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body** (raw JSON):
```json
{
  "email": "admin@manehej.com",
  "password": "Admin123!@#"
}
```

#### Expected Response (200 OK):
Sets HTTP-only cookies: `accessToken`, `refreshToken`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid-string",
    "name": "System Administrator",
    "email": "admin@manehej.com",
    "role": "ADMIN",
    "is_active": true,
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Postman Test Script:
Add this to the "Tests" tab to verify cookies are set:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data) {
        console.log("Admin login successful");
        console.log("Admin data:", response.data);
        
        // Check if cookies are set
        const cookies = pm.cookies.all();
        const accessToken = cookies.find(c => c.name === 'accessToken');
        const refreshToken = cookies.find(c => c.name === 'refreshToken');
        
        if (accessToken && refreshToken) {
            console.log("Access and refresh tokens set in cookies");
        } else {
            console.log("Warning: Cookies not set properly");
        }
    }
}
```

#### Error Responses:

**Validation Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Invalid email format, Password must be at least 8 characters"
}
```

**Invalid Credentials (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Account Deactivated (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

**Rate Limit Exceeded (429 Too Many Requests)**:
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later."
}
```

---

### 4. Get Admin Profile

**GET** `/api/admin/auth/profile`

🔒 **Protected Route** - Requires Authentication

Returns the current admin's profile information.

#### Postman Setup:
- **Method**: GET
- **URL**: `{{base_url}}/api/admin/auth/profile`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid-string",
    "name": "System Administrator",
    "email": "admin@manehej.com",
    "role": "ADMIN",
    "is_active": true,
    "last_login": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Error Responses:

**Unauthorized (401)**:
```json
{
  "success": false,
  "message": "Access denied. Authentication required."
}
```

**Session Expired (401)**:
```json
{
  "success": false,
  "message": "Session expired. Please login again."
}
```

---

### 5. Update Admin Profile

**PUT** `/api/admin/auth/profile`

🔒 **Protected Route** - Requires Authentication

Updates the admin's profile information.

#### Postman Setup:
- **Method**: PUT
- **URL**: `{{base_url}}/api/admin/auth/profile`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically
- **Body** (raw JSON):
```json
{
  "name": "Updated Admin Name",
  "email": "updated@manehej.com"
}
```

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-string",
    "name": "Updated Admin Name",
    "email": "updated@manehej.com",
    "role": "ADMIN",
    "is_active": true,
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
}
```

#### Error Responses:

**Validation Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Name must be at least 2 characters, Invalid email format"
}
```

**Email Already Exists (409 Conflict)**:
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Unauthorized (401)**:
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### 6. Change Admin Password

**PUT** `/api/admin/auth/change-password`

🔒 **Protected Route** - Requires Authentication

Changes the admin's password.

#### Postman Setup:
- **Method**: PUT
- **URL**: `{{base_url}}/api/admin/auth/change-password`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically
- **Body** (raw JSON):
```json
{
  "current_password": "Admin123!@#",
  "new_password": "NewSecurePass123!@#",
  "confirm_password": "NewSecurePass123!@#"
}
```

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Error Responses:

**Validation Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Current password is required, New password must be at least 8 characters, New password and confirm password don't match"
}
```

**Invalid Current Password (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Weak Password (422 Unprocessable Entity)**:
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter"
}
```

**Rate Limit Exceeded (429 Too Many Requests)**:
```json
{
  "success": false,
  "message": "Too many password change attempts, please try again later."
}
```

---

### 7. Admin Logout

**POST** `/api/admin/auth/logout`

🔒 **Protected Route** - Requires Authentication

Logs out the admin and invalidates the session.

#### Postman Setup:
- **Method**: POST
- **URL**: `{{base_url}}/api/admin/auth/logout`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Postman Test Script:
Add this to verify cookies are cleared after logout:
```javascript
if (pm.response.code === 200) {
    console.log("Admin logout successful");
    
    // Check if cookies are cleared
    const cookies = pm.cookies.all();
    const accessToken = cookies.find(c => c.name === 'accessToken');
    const refreshToken = cookies.find(c => c.name === 'refreshToken');
    
    if (!accessToken && !refreshToken) {
        console.log("Cookies cleared successfully");
    } else {
        console.log("Warning: Cookies not cleared properly");
    }
}
```

#### Error Responses:

**Unauthorized (401)**:
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### 8. Refresh Token

**POST** `/api/admin/auth/refresh-token`

🔒 **Protected Route** - Requires Authentication

Generates a new JWT token.

#### Postman Setup:
- **Method**: POST
- **URL**: `{{base_url}}/api/admin/auth/refresh-token`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Postman Test Script:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.accessToken) {
        console.log("New access token generated and set in cookies");
        
        // Check if new access token cookie is set
        const cookies = pm.cookies.all();
        const accessToken = cookies.find(c => c.name === 'accessToken');
        
        if (accessToken) {
            console.log("Access token cookie updated successfully");
        } else {
            console.log("Warning: Access token cookie not updated");
        }
    }
}
```

---

### 9. Get Current Admin Info

**GET** `/api/admin/auth/me`

🔒 **Protected Route** - Requires Authentication

Returns current admin information (alias for profile endpoint).

#### Postman Setup:
- **Method**: GET
- **URL**: `{{base_url}}/api/admin/auth/me`
- **Headers**:
  - `Content-Type`: `application/json`
- **Note**: No Authorization header needed - cookies are sent automatically

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid-string",
    "name": "System Administrator",
    "email": "admin@manehej.com",
    "role": "ADMIN",
    "is_active": true,
    "last_login": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Postman Collection Setup

### 1. Create Collection
1. Create a new collection called "Manehej Admin API"
2. Set the collection variables:
   - `base_url`: `http://localhost:3001`

### 2. Pre-request Scripts
Add this to the collection's pre-request script to ensure proper headers:
```javascript
// Set default headers
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});

// Ensure cookies are enabled for all requests
pm.request.options = {
    ...pm.request.options,
    timeout: 5000
};
```

### 3. Test Scripts
Add this to the collection's test script for common validations:
```javascript
// Common response validation
pm.test("Response has success field", function () {
    pm.expect(pm.response.json()).to.have.property("success");
});

pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});
```

---

## Testing Workflow

### Recommended Testing Order:

1. **Health Check** - Verify server is running
2. **Root Endpoint** - Verify API is accessible
3. **Admin Login** - Authenticate and get token
4. **Get Profile** - Verify token works
5. **Update Profile** - Test profile updates
6. **Change Password** - Test password change
7. **Refresh Token** - Test token refresh
8. **Logout** - Test logout functionality

### Testing Different Scenarios:

#### Valid Requests:
- ✅ Login with correct credentials
- ✅ Access protected routes with valid token
- ✅ Update profile with valid data
- ✅ Change password with strong new password

#### Invalid Requests:
- ❌ Login with wrong email/password
- ❌ Access protected routes without token
- ❌ Access protected routes with invalid token
- ❌ Update profile with invalid data
- ❌ Change password with weak password
- ❌ Change password with wrong current password

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Causes:**
- No cookies present
- Invalid or expired tokens
- Session expired

**Solutions:**
- Ensure cookies are enabled in Postman settings
- Re-login to get fresh tokens
- Check that `accessToken` and `refreshToken` cookies are present

### Issue: 400 Bad Request
**Causes:**
- Invalid JSON in request body
- Missing required fields
- Invalid data format

**Solutions:**
- Validate JSON syntax
- Check required fields in request body
- Ensure proper data types

### Issue: 429 Too Many Requests
**Causes:**
- Rate limit exceeded
- Too many login attempts
- Too many password changes

**Solutions:**
- Wait for rate limit window to reset
- Use different IP address for testing
- Reduce request frequency

### Issue: 500 Internal Server Error
**Causes:**
- Server configuration issues
- Database connection problems
- Code errors

**Solutions:**
- Check server logs
- Verify database connection
- Ensure all dependencies are installed

---

## Security Testing

### Test Authentication Bypass:
1. Try accessing protected routes without token
2. Try accessing with malformed token
3. Try accessing with expired token
4. Try accessing with token from different user

### Test Input Validation:
1. Try SQL injection in profile fields
2. Try XSS in profile fields
3. Try extremely long input values
4. Try special characters in passwords

### Test Rate Limiting:
1. Make rapid requests to login endpoint
2. Make rapid requests to password change endpoint
3. Verify rate limiting kicks in appropriately

---

## Performance Testing

### Response Time Tests:
```javascript
// Add to test scripts
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### Load Testing:
- Use Postman's Collection Runner with multiple iterations
- Test concurrent requests to different endpoints
- Monitor server performance during tests

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3001` |
| `access_token` | Access token (set via cookies) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `refresh_token` | Refresh token (set via cookies) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

## Export/Import Collection

### Export Collection:
1. Right-click on collection
2. Select "Export"
3. Choose "Collection v2.1" format
4. Save as `Manehej-Admin-API.postman_collection.json`

### Import Collection:
1. Click "Import" in Postman
2. Select the exported JSON file
3. Collection will be imported with all requests and tests

---

## Additional Resources

- **API Documentation**: See README.md for detailed API documentation
- **Error Codes**: Reference the error handling section above
- **Security**: Review security considerations in README.md
- **Database**: Check Prisma schema for data models

---

## Support

If you encounter issues during testing:
1. Check server logs for error details
2. Verify database connection and migrations
3. Ensure all environment variables are set correctly
4. Review the API documentation for endpoint specifications
