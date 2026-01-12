# JWT Authentication Guide

## Overview
This API uses JWT (JSON Web Tokens) for authentication and authorization. After logging in, you'll receive a JWT token that you must include in subsequent API requests.

## How to Get a JWT Token

### Step 1: Login
Make a POST request to `/api/auth/login` with your credentials:

```bash
POST http://localhost:9090/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

### Step 2: Extract the Token
The response will contain a JWT token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "admin@example.com",
  "userTypes": ["ADMIN"]
}
```

**Save the `token` value** - you'll need it for authenticated requests.

## How to Use JWT Token for Authorization

### Include Token in Request Headers
Add the token to the `Authorization` header with the `Bearer` prefix:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example: Using cURL
```bash
curl -X PUT http://localhost:9090/api/users/1/approval \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "accountStatus": "ACTIVE"
  }'
```

### Example: Using JavaScript/Fetch
```javascript
const token = "YOUR_JWT_TOKEN_HERE";

fetch('http://localhost:9090/api/users/1/approval', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accountStatus: 'ACTIVE'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Example: Using Axios (React)
```javascript
import axios from 'axios';

const token = localStorage.getItem('jwtToken'); // Store token after login

axios.put('http://localhost:9090/api/users/1/approval', 
  { accountStatus: 'ACTIVE' },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

## Protected Endpoints

### Admin-Only Endpoints
The following endpoint requires **ADMIN** role:

- `PUT /api/users/{id}/approval` - Approve/Reject users

### Public Endpoints (No Authentication Required)
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/setup/admin` - Create first admin

### Other User Endpoints
Currently, other user management endpoints are accessible without authentication. You can add `@RolesAllowed` annotations to protect them if needed.

## Token Expiration
- Default expiration: **24 hours**
- After expiration, you'll need to login again to get a new token
- If you get a `401 Unauthorized` error, your token may have expired

## Error Responses

### 401 Unauthorized
- Missing or invalid token
- Token expired
- User doesn't have required role

```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
- User doesn't have required permissions (e.g., non-admin trying to approve users)

```json
{
  "message": "Forbidden"
}
```

## React Frontend Integration Example

```javascript
// 1. Login and store token
const login = async (email, password) => {
  const response = await fetch('http://localhost:9090/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('jwtToken', data.token);
  return data;
};

// 2. Create axios instance with token
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api'
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Use in components
const approveUser = async (userId, status) => {
  try {
    const response = await api.put(`/users/${userId}/approval`, {
      accountStatus: status
    });
    console.log('User approved:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
  }
};
```

## Testing with Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:9090/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "yourpassword"
     }
     ```
   - Copy the `token` from the response

2. **Approval Request:**
   - Method: PUT
   - URL: `http://localhost:9090/api/users/1/approval`
   - Headers:
     - `Authorization`: `Bearer YOUR_TOKEN_HERE`
     - `Content-Type`: `application/json`
   - Body (raw JSON):
     ```json
     {
       "accountStatus": "ACTIVE"
     }
     ```

## Security Notes

- **Never expose your JWT secret key** in client-side code
- Store tokens securely (use httpOnly cookies in production)
- Implement token refresh mechanism for better UX
- Always use HTTPS in production
- Validate tokens on the server side (already implemented)
