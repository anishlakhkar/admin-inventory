# Step-by-Step Guide: Creating Dummy B2B Orders via API

## Prerequisites
- Backend server running on `http://localhost:9090`
- API client (Postman, curl, or similar)
- Admin user credentials (for PO approval)

---

## Overview: B2B Order Flow

For B2B orders, the workflow is:
1. **Create B2B User** (if needed)
2. **Create Prescription** (optional, if order requires prescription)
3. **Create B2B Order** (status will be `PROCESSING`)
4. **Create Purchase Order (PO)** for the B2B order
5. **Approve/Reject PO** (admin action - updates order status to `CONFIRMED` or `CANCELLED`)

---

## Step 1: Create B2B User (If Needed)

If you don't have a B2B user, create one first using the signup API.

### API Endpoint
```
POST http://localhost:9090/api/auth/signup
Content-Type: application/json
```

### Request Body:
```json
{
  "email": "business1@example.com",
  "password": "Password123!",
  "firstName": "Business",
  "lastName": "Owner",
  "phoneNo": "+1234567892",
  "platform": "MedBiz",
  "businessInfo": "Healthcare Solutions Inc.",
  "userTypes": ["B2B"]
}
```

**Note:** B2B users are created with `PENDING_APPROVAL` status and need admin approval to become `ACTIVE`.

### Expected Response:
```json
{
  "id": 3,
  "email": "business1@example.com",
  "firstName": "Business",
  "lastName": "Owner",
  "phoneNo": "+1234567892",
  "platform": "MedBiz",
  "businessInfo": "Healthcare Solutions Inc.",
  "accountStatus": "PENDING_APPROVAL",
  "userTypes": ["B2B"],
  "createdAt": "2026-01-11T10:00:00",
  "updatedAt": "2026-01-11T10:00:00"
}
```

**⚠️ Important:** 
- Save the `id` field from the response
- User will be in `PENDING_APPROVAL` status - you may need to approve it first via admin API

---

## Step 2: Create Prescription (Optional - If Order Requires Prescription)

If your B2B order requires a prescription, create it first.

### API Endpoint
```
POST http://localhost:9090/api/prescriptions
Content-Type: application/json
```

### Request Body:
```json
{
  "userId": 3,
  "doctorName": "Dr. Sarah Johnson",
  "prescriptionDate": "2026-01-10",
  "validUntil": "2026-02-10",
  "fileUrl": "https://example.com/prescriptions/prescription-business-2026-01-10.pdf",
  "status": "UPLOADED"
}
```

### Expected Response:
```json
{
  "id": 1,
  "user": {
    "id": 3,
    "email": "business1@example.com",
    ...
  },
  "doctorName": "Dr. Sarah Johnson",
  "prescriptionDate": "2026-01-10",
  "validUntil": "2026-02-10",
  "fileUrl": "https://example.com/prescriptions/prescription-business-2026-01-10.pdf",
  "status": "UPLOADED",
  "reviewNotes": null,
  "reviewedBy": null,
  "createdAt": "2026-01-11T10:01:00",
  "updatedAt": "2026-01-11T10:01:00"
}
```

**⚠️ Important:** Save the `id` field from the response if you need to link it to the order.

---

## Step 3: Create B2B Order

Create the B2B order. It will automatically have status `PROCESSING` (waiting for PO approval).

### API Endpoint
```
POST http://localhost:9090/api/orders
Content-Type: application/json
```

### Order 1: B2B Order (PROCESSING status) - 5 Items
```json
{
  "userId": 3,
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0001",
  "subtotalAmt": 2500.00,
  "totalAmt": 2750.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 501,
      "quantity": 5,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    },
    {
      "productId": 502,
      "quantity": 3,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    },
    {
      "productId": 503,
      "quantity": 2,
      "unitPrice": 250.00,
      "prescriptionRequired": false
    },
    {
      "productId": 504,
      "quantity": 4,
      "unitPrice": 150.00,
      "prescriptionRequired": false
    },
    {
      "productId": 505,
      "quantity": 1,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 2: B2B Order (PROCESSING status) - 5 Items (with Prescription)
```json
{
  "userId": 3,
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0002",
  "subtotalAmt": 3200.00,
  "totalAmt": 3520.00,
  "prescriptionRequired": true,
  "prescriptionId": 1,
  "orderItems": [
    {
      "productId": 601,
      "quantity": 2,
      "unitPrice": 800.00,
      "prescriptionRequired": true
    },
    {
      "productId": 602,
      "quantity": 4,
      "unitPrice": 250.00,
      "prescriptionRequired": false
    },
    {
      "productId": 603,
      "quantity": 1,
      "unitPrice": 600.00,
      "prescriptionRequired": true
    },
    {
      "productId": 604,
      "quantity": 3,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    },
    {
      "productId": 605,
      "quantity": 2,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 3: B2B Order (PROCESSING status) - 5 Items
```json
{
  "userId": 3,
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0003",
  "subtotalAmt": 1800.00,
  "totalAmt": 1980.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 701,
      "quantity": 3,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    },
    {
      "productId": 702,
      "quantity": 2,
      "unitPrice": 250.00,
      "prescriptionRequired": false
    },
    {
      "productId": 703,
      "quantity": 4,
      "unitPrice": 100.00,
      "prescriptionRequired": false
    },
    {
      "productId": 704,
      "quantity": 1,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    },
    {
      "productId": 705,
      "quantity": 2,
      "unitPrice": 150.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 4: B2B Order (PROCESSING status) - 5 Items
```json
{
  "userId": 3,
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0004",
  "subtotalAmt": 4500.00,
  "totalAmt": 4950.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 801,
      "quantity": 5,
      "unitPrice": 500.00,
      "prescriptionRequired": false
    },
    {
      "productId": 802,
      "quantity": 3,
      "unitPrice": 400.00,
      "prescriptionRequired": false
    },
    {
      "productId": 803,
      "quantity": 2,
      "unitPrice": 350.00,
      "prescriptionRequired": false
    },
    {
      "productId": 804,
      "quantity": 4,
      "unitPrice": 200.00,
      "prescriptionRequired": false
    },
    {
      "productId": 805,
      "quantity": 1,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    }
  ]
}
```

### Order 5: B2B Order (PROCESSING status) - 5 Items
```json
{
  "userId": 3,
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0005",
  "subtotalAmt": 2800.00,
  "totalAmt": 3080.00,
  "prescriptionRequired": false,
  "orderItems": [
    {
      "productId": 901,
      "quantity": 2,
      "unitPrice": 700.00,
      "prescriptionRequired": false
    },
    {
      "productId": 902,
      "quantity": 3,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    },
    {
      "productId": 903,
      "quantity": 1,
      "unitPrice": 400.00,
      "prescriptionRequired": false
    },
    {
      "productId": 904,
      "quantity": 4,
      "unitPrice": 150.00,
      "prescriptionRequired": false
    },
    {
      "productId": 905,
      "quantity": 2,
      "unitPrice": 250.00,
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
    "id": 3,
    "email": "business1@example.com",
    ...
  },
  "orderType": "B2B",
  "orderNumber": "ORD-B2B-2026-0001",
  "subtotalAmt": 2500.00,
  "totalAmt": 2750.00,
  "status": "PROCESSING",
  "purchaseOrder": null,
  "prescriptionRequired": false,
  "prescription": null,
  "orderItems": [
    {
      "id": 1,
      "orderId": 1,
      "productId": 501,
      "quantity": 5,
      "unitPrice": 300.00,
      "prescriptionRequired": false
    },
    ...
  ],
  "createdAt": "2026-01-11T10:05:00",
  "updatedAt": "2026-01-11T10:05:00"
}
```

**⚠️ Important:** 
- Save the `id` field from the response - you'll need it for creating PO
- Order status will be `PROCESSING` (waiting for PO approval)

---

## Step 4: Create Purchase Order (PO) for B2B Order

For each B2B order, create a Purchase Order.

### API Endpoint
```
POST http://localhost:9090/api/purchase-orders
Content-Type: application/json
```

### PO for Order 1:
```json
{
  "orderId": 1,
  "totalAmount": 2750.00,
  "comments": "Bulk order for Q1 2026 inventory"
}
```

### PO for Order 2:
```json
{
  "orderId": 2,
  "totalAmount": 3520.00,
  "comments": "Prescription-based order for clinic supplies"
}
```

### PO for Order 3:
```json
{
  "orderId": 3,
  "totalAmount": 1980.00,
  "comments": "Regular monthly order"
}
```

### PO for Order 4:
```json
{
  "orderId": 4,
  "totalAmount": 4950.00,
  "comments": "Large volume order for distribution"
}
```

### PO for Order 5:
```json
{
  "orderId": 5,
  "totalAmount": 3080.00,
  "comments": "Quarterly stock replenishment"
}
```

### Expected Response:
```json
{
  "poId": 1,
  "poNumber": "PO-2026-0001",
  "orderId": 1,
  "status": null,
  "totalAmount": 2750.00,
  "comments": "Bulk order for Q1 2026 inventory",
  "approvedRejectedBy": null,
  "createdAt": "2026-01-11T10:06:00",
  "approvedRejectedAt": null,
  "updatedAt": "2026-01-11T10:06:00"
}
```

**⚠️ Important:** 
- Save the `poId` field - you'll need it for approval/rejection
- PO status will be `null` initially (pending approval)
- PO number is auto-generated (format: PO-YYYY-XXXX)

---

## Step 5: Approve/Reject Purchase Orders (Admin Action)

As an admin, approve or reject the POs. This will update the order status:
- **APPROVED** → Order status becomes `CONFIRMED`
- **REJECTED** → Order status becomes `CANCELLED`

### API Endpoint
```
PUT http://localhost:9090/api/purchase-orders/{poId}/status
Content-Type: application/json
```

**Note:** You need to be logged in as an ADMIN user to approve/reject POs.

### Get Admin JWT Token First:
```
POST http://localhost:9090/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Save the `token` from the response.

### Approve PO 1 (Example - All Approved):
```json
{
  "adminUserId": 1,
  "status": "APPROVED",
  "comments": "Order approved - All items in stock"
}
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json
```

### Approve PO 2:
```json
{
  "adminUserId": 1,
  "status": "APPROVED",
  "comments": "Prescription verified and approved"
}
```

### Approve PO 3:
```json
{
  "adminUserId": 1,
  "status": "APPROVED",
  "comments": "Standard order approved"
}
```

### Approve PO 4:
```json
{
  "adminUserId": 1,
  "status": "APPROVED",
  "comments": "Large order approved after verification"
}
```

### Reject PO 5 (Example - One Rejected):
```json
{
  "adminUserId": 1,
  "status": "REJECTED",
  "comments": "Order rejected - Insufficient credit limit"
}
```

### Expected Response (Approved):
```json
{
  "poId": 1,
  "poNumber": "PO-2026-0001",
  "orderId": 1,
  "status": "APPROVED",
  "totalAmount": 2750.00,
  "comments": "Order approved - All items in stock",
  "approvedRejectedBy": {
    "id": 1,
    "email": "admin@example.com",
    ...
  },
  "createdAt": "2026-01-11T10:06:00",
  "approvedRejectedAt": "2026-01-11T10:07:00",
  "updatedAt": "2026-01-11T10:07:00"
}
```

After approval, if you check the order again, its status will be `CONFIRMED`:
```
GET http://localhost:9090/api/orders/1
```

The response will show:
```json
{
  "id": 1,
  ...
  "status": "CONFIRMED",
  "purchaseOrder": {
    "poId": 1,
    "poNumber": "PO-2026-0001",
    "status": "APPROVED",
    ...
  },
  ...
}
```

---

## Important Notes

1. **User ID**: Replace `userId` value (3) with your actual B2B user ID
2. **Order Status Flow**:
   - Initially: `PROCESSING` (when B2B order is created)
   - After PO Approved: `CONFIRMED`
   - After PO Rejected: `CANCELLED`
3. **Purchase Orders**: 
   - Must be created for B2B orders
   - PO status starts as `null` (pending)
   - Admin must approve/reject via PUT endpoint
4. **Order Numbers**: Must be unique - change `orderNumber` for each order
5. **Product IDs**: The `productId` values are dummy - adjust based on your actual products
6. **Authentication**: 
   - Order/Prescription creation: No auth required (`@PermitAll`)
   - PO Approval/Rejection: Requires ADMIN role and JWT token
7. **Prescriptions**: Optional - only include if `prescriptionRequired: true`

---

## Quick Test with curl

### 1. Create B2B User:
```bash
curl -X POST http://localhost:9090/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business1@example.com",
    "password": "Password123!",
    "firstName": "Business",
    "lastName": "Owner",
    "phoneNo": "+1234567892",
    "platform": "MedBiz",
    "businessInfo": "Healthcare Solutions Inc.",
    "userTypes": ["B2B"]
  }'
```

### 2. Create Prescription (Optional):
```bash
curl -X POST http://localhost:9090/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "doctorName": "Dr. Sarah Johnson",
    "prescriptionDate": "2026-01-10",
    "validUntil": "2026-02-10",
    "fileUrl": "https://example.com/prescriptions/prescription-business-2026-01-10.pdf",
    "status": "UPLOADED"
  }'
```

### 3. Create B2B Order:
```bash
curl -X POST http://localhost:9090/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "orderType": "B2B",
    "orderNumber": "ORD-B2B-2026-0001",
    "subtotalAmt": 2500.00,
    "totalAmt": 2750.00,
    "prescriptionRequired": false,
    "orderItems": [
      {"productId": 501, "quantity": 5, "unitPrice": 300.00, "prescriptionRequired": false},
      {"productId": 502, "quantity": 3, "unitPrice": 200.00, "prescriptionRequired": false},
      {"productId": 503, "quantity": 2, "unitPrice": 250.00, "prescriptionRequired": false},
      {"productId": 504, "quantity": 4, "unitPrice": 150.00, "prescriptionRequired": false},
      {"productId": 505, "quantity": 1, "unitPrice": 200.00, "prescriptionRequired": false}
    ]
  }'
```

### 4. Create Purchase Order:
```bash
curl -X POST http://localhost:9090/api/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "totalAmount": 2750.00,
    "comments": "Bulk order for Q1 2026 inventory"
  }'
```

### 5. Login as Admin:
```bash
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the token from the response.

### 6. Approve Purchase Order:
```bash
curl -X PUT http://localhost:9090/api/purchase-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "adminUserId": 1,
    "status": "APPROVED",
    "comments": "Order approved - All items in stock"
  }'
```

---

## Verify Orders Created

### Get All Orders:
```
GET http://localhost:9090/api/orders
```

### Get Orders by Type (B2B):
```
GET http://localhost:9090/api/orders?orderType=B2B
```

### Get Orders by Status:
```
GET http://localhost:9090/api/orders?status=PROCESSING
GET http://localhost:9090/api/orders?status=CONFIRMED
GET http://localhost:9090/api/orders?status=CANCELLED
```

### Get Order by ID:
```
GET http://localhost:9090/api/orders/1
```

### Get All Purchase Orders:
```
GET http://localhost:9090/api/purchase-orders
```

### Get Purchase Orders by Status:
```
GET http://localhost:9090/api/purchase-orders?status=APPROVED
GET http://localhost:9090/api/purchase-orders?status=REJECTED
```

### Get Purchase Order by Order ID:
```
GET http://localhost:9090/api/purchase-orders/order/1
```

---

## Summary: Complete B2B Order Workflow

1. ✅ Create B2B User (ID: 3)
2. ✅ Create Prescription (Optional, if needed)
3. ✅ Create B2B Order → Status: `PROCESSING`
4. ✅ Create Purchase Order for the order
5. ✅ Login as Admin
6. ✅ Approve/Reject PO → Order Status: `CONFIRMED` or `CANCELLED`

**Key Difference from B2C:**
- B2B orders require PO creation and approval
- B2C orders are automatically `CONFIRMED`
- B2B orders can be `CANCELLED` if PO is rejected
