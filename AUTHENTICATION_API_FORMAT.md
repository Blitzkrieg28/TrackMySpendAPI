# Authentication API Format Documentation

This document outlines the exact format for sign-up and sign-in API endpoints that your frontend should use.

## 🔐 User Authentication

### 1. User Sign-In
**Endpoint:** `POST /user/signin`

#### Request Format:
```json
{
  "email": "user@example.com",
  "password": "pass@123"
}
```

#### Request Requirements:
- **Content-Type:** `application/json`
- **email:** Must be a valid email format
- **password:** Must be 5-10 characters with at least one special character (`!@#$%^&*(),.?":{}|<>`)

#### Success Response (200):
```json
{
  "middlewareMessage": "middleware validation successfull!!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Sign-in successful"
}
```

#### Error Responses:
- **403 - Invalid Credentials:**
```json
{
  "message": "Invalid credentials"
}
```

- **404 - Validation Failed:**
```json
{
  "message": "invalid inputs,if new-> sign-up first!!!"
}
```

---

### 2. User Sign-Up
**Endpoint:** `POST /user/signup`

#### Request Format:
```json
{
  "name": "John Doe",
  "email": "newuser@example.com",
  "password": "new@123"
}
```

#### Request Requirements:
- **Content-Type:** `application/json`
- **name:** Must be 2-50 characters
- **email:** Must be a valid email format
- **password:** Must be 5-10 characters with at least one special character (`!@#$%^&*(),.?":{}|<>`)

#### Success Response (201):
```json
{
  "middlewareMessage": "middleware validation successfull!!",
  "message": "Sign-up successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses:
- **409 - Email Already Taken:**
```json
{
  "message": "Email already taken"
}
```

- **404 - Validation Failed:**
```json
{
  "message": "invalid inputs,if new-> sign-up first!!!"
}
```

---

## 👨‍💼 Admin Authentication

### 3. Admin Sign-In
**Endpoint:** `POST /admin/signin`

#### Request Format:
```json
{
  "email": "admin@example.com",
  "password": "admin@123"
}
```

#### Request Requirements:
- **Content-Type:** `application/json`
- **email:** Must be a valid email format
- **password:** Must be 5-10 characters with at least one special character (`!@#$%^&*(),.?":{}|<>`)

#### Success Response (200):
```json
{
  "middlewareMessage": "middleware validation successfull!!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "you got a token for your sign-in!!!"
}
```

#### Error Responses:
- **403 - Admin Not Found:**
```json
{
  "message": "admin not found!!"
}
```

- **404 - Validation Failed:**
```json
{
  "message": "invalid inputs,if new-> sign-up first!!!"
}
```

---

## 🔑 Token Usage

### Protected Route Authentication
After receiving a token from sign-in/sign-up, include it in the Authorization header for all protected routes:

```javascript
// Example fetch request
fetch('/expense/viewexpense', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your-jwt-token-here',
    'Content-Type': 'application/json'
  }
})
```

### Token Format:
- **Header:** `Authorization: Bearer <token>`
- **Expiry:** 1 hour from creation
- **Payload:** Contains user ID, email, and name

---

## 📋 Validation Rules

### Name Requirements (Sign-up only):
- Length: 2-50 characters
- Example: `John Doe`

### Email Requirements:
- Must be a valid email format
- Example: `user@example.com`

### Password Requirements:
- Length: 5-10 characters
- Must contain at least one special character from: `!@#$%^&*(),.?":{}|<>`
- Examples: `pass@123`, `secret!`, `admin@456`

---

## 🚨 Error Handling

### Common Error Status Codes:
- **200/201:** Success
- **403:** Invalid credentials or admin not found
- **404:** Validation failed (invalid input format)
- **409:** Email already exists (sign-up only)
- **401:** Missing or invalid token (protected routes)

### Frontend Implementation Tips:
1. Store the received token in localStorage or secure storage
2. Include token in all subsequent API calls
3. Handle token expiry by redirecting to login
4. Validate input format before sending requests
5. Show appropriate error messages based on response status

---

## 📝 Example Frontend Code

```javascript
// Sign-in function
async function signIn(email, password) {
  try {
    const response = await fetch('/user/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token
      localStorage.setItem('token', data.token);
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

// Sign-up function
async function signUp(name, email, password) {
  try {
    const response = await fetch('/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token
      localStorage.setItem('token', data.token);
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

// Protected route example
async function getExpenses() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/expense/viewexpense', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
``` 