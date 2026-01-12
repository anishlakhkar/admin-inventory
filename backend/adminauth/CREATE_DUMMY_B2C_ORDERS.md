# Step-by-Step Guide: Creating Dummy B2C Orders via API

## Prerequisites
- Backend server running on `http://localhost:9090`
- API client (Postman, curl, or similar)

---

## Step 1: Create B2C Users (If Needed)

If you don't have B2C users, create them first using the signup API.

### API Endpoint
```
POST http://localhost:9090/api/auth/signup
Content-Type: application/json
```

### Request Body for User 1:
```json
{
  "email": "customer1@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNo": "+1234567890",
  "userTypes": ["B2C"]
}
```

### Request Body for User 2:
```json
{
  "email": "customer2@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNo": "+1234567891",
  "userTypes": ["B2C"]
}
```

### Expected Response:
```json
{
  "id": 5,
  "email": "customer1@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNo": "+1234567890",
  "platform": null,
  "businessInfo": null,
  "accountStatus": "ACTIVE",
  "userTypes": ["B2C"],
  "createdAt": "2026-01-11T10:00:00",
  "updatedAt": "2026-01-11T10:00:00"
}
```

**⚠️ Important:** Save the `id` field from the response - you'll need it for creating orders!

---

## Step 2: Create B2C Orders

For each order, use the orders API endpoint.

### API Endpoint
```
POST http://localhost:9090/api/orders
Content-Type: application/json
```

### Order 1: B2C Order (CONFIRMED status) - 5 Items
```json
{
  "userId": 5,
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0001",
  "subtotalAmt": 1250.00,
  "totalAmt": 1375.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 101,
      "quantity": 2,
      "unitPrice": 250.00,
      "prescriptionRequired": false
    },
    {
      "productId": 102,
      "quantity": 1,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    },
    {
      "productId": 103,
      "quantity": 3,
      "unitPrice": 150.00,
      "prescriptionRequired": false
    },
    {
      "productId": 104,
      "quantity": 1,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    },
    {
      "productId": 105,
      "quantity": 2,
      "unitPrice": 75.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 2: B2C Order (CONFIRMED status) - 5 Items (with Prescription)
```json
{
  "userId": 6,
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0002",
  "subtotalAmt": 890.50,
  "totalAmt": 979.55,
  "prescriptionRequired": true,
  "orderItems": [
    {
      "productId": 201,
      "quantity": 1,
      "unitPrice": 450.00,
      "prescriptionRequired": true
    },
    {
      "productId": 202,
      "quantity": 2,
      "unitPrice": 120.25,
      "prescriptionRequired": false
    },
    {
      "productId": 203,
      "quantity": 1,
      "unitPrice": 200.00,
      "prescriptionRequired": true
    },
    {
      "productId": 204,
      "quantity": 3,
      "unitPrice": 50.00,
      "prescriptionRequired": false
    },
    {
      "productId": 205,
      "quantity": 1,
      "unitPrice": 70.25,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 3: B2C Order (CONFIRMED status) - 5 Items
```json
{
  "userId": 5,
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0003",
  "subtotalAmt": 650.00,
  "totalAmt": 715.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 301,
      "quantity": 2,
      "unitPrice": 150.00,
      "prescriptionRequired": false
    },
    {
      "productId": 302,
      "quantity": 1,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    },
    {
      "productId": 303,
      "quantity": 1,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    },
    {
      "productId": 304,
      "quantity": 2,
      "unitPrice": 50.00,
      "prescriptionRequired": false
    },
    {
      "productId": 305,
      "quantity": 1,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 4: B2C Order (CONFIRMED status) - 5 Items
```json
{
  "userId": 6,
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0004",
  "subtotalAmt": 1120.00,
  "totalAmt": 1232.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 401,
      "quantity": 1,
      "unitPrice": 500.00,
      "prescriptionRequired": false
    },
    {
      "productId": 402,
      "quantity": 2,
      "unitPrice": 180.00,
      "prescriptionRequired": false
    },
    {
      "productId": 403,
      "quantity": 1,
      "unitPrice": 120.00,
      "prescriptionRequired": false
    },
    {
      "productId": 404,
      "quantity": 3,
      "unitPrice": 80.00,
      "prescriptionRequired": false
    },
    {
      "productId": 405,
      "quantity": 1,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 5: B2C Order (CONFIRMED status) - 5 Items
```json
{
  "userId": 5,
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0005",
  "subtotalAmt": 980.75,
  "totalAmt": 1078.83,
  "prescriptionRequired": true,
  "orderItems": [
    {
      "productId": 501,
      "quantity": 1,
      "unitPrice": 350.00,
      "prescriptionRequired": true
    },
    {
      "productId": 502,
      "quantity": 2,
      "unitPrice": 150.25,
      "prescriptionRequired": false
    },
    {
      "productId": 503,
      "quantity": 1,
      "unitPrice": 180.50,
      "prescriptionRequired": true
    },
    {
      "productId": 504,
      "quantity": 2,
      "unitPrice": 75.00,
      "prescriptionRequired": false
    },
    {
      "productId": 505,
      "quantity": 1,
      "unitPrice": 125.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Expected Response:
```json
{
  "id": 1,
  "user": {
    "id": 5,
    "email": "customer1@example.com",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "orderType": "B2C",
  "orderNumber": "ORD-2026-0001",
  "subtotalAmt": 1250.00,
  "totalAmt": 1375.00,
  "status": "CONFIRMED",
  "purchaseOrder": null,
  "prescriptionRequired": false,
  "prescription": null,
  "orderItems": [
    {
      "id": 1,
      "orderId": 1,
      "productId": 101,
      "quantity": 2,
      "unitPrice": 250.00,
      "prescriptionRequired": false
    },
    ...
  ],
  "createdAt": "2026-01-11T10:05:00",
  "updatedAt": "2026-01-11T10:05:00"
}
```

---

## Important Notes

1. **User IDs**: Replace `userId` values (5, 6) with the actual user IDs from Step 1
2. **Order Status**: B2C orders are automatically set to `CONFIRMED` status (no PO needed)
3. **Order Numbers**: Must be unique - change `orderNumber` for each order
4. **Product IDs**: The `productId` values are dummy - adjust based on your actual products
5. **No Authentication Required**: Both endpoints are `@PermitAll`, so no JWT token needed

---

## Quick Test with curl

### Create User 1:
```bash
curl -X POST http://localhost:9090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer1@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNo": "+1234567890",
    "userTypes": ["B2C"]
  }'
```

### Create Order 1:
```bash
curl -X POST http://localhost:9090/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 5,
    "orderType": "B2C",
    "orderNumber": "ORD-2026-0001",
    "subtotalAmt": 1250.00,
    "totalAmt": 1375.00,
    "prescriptionRequired": false,
    "orderItems": [
      {"productId": 101, "quantity": 2, "unitPrice": 250.00, "prescriptionRequired": false},
      {"productId": 102, "quantity": 1, "unitPrice": 300.00, "prescriptionRequired": false},
      {"productId": 103, "quantity": 3, "unitPrice": 150.00, "prescriptionRequired": false},
      {"productId": 104, "quantity": 1, "unitPrice": 100.00, "prescriptionRequired": false},
      {"productId": 105, "quantity": 2, "unitPrice": 75.00, "prescriptionRequired": false}
    ]
  }'
```

---

## Verify Orders Created

### Get All Orders:
```
GET http://localhost:9090/api/orders
```

### Get Orders by Type (B2C):
```
GET http://localhost:9090/api/orders?orderType=B2C
```

### Get Orders by Status (CONFIRMED):
```
GET http://localhost:9090/api/orders?status=CONFIRMED
```

### Get Order by ID:
```
GET http://localhost:9090/api/orders/1
```
