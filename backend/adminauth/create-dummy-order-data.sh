#!/bin/bash

# Base URL
BASE_URL="http://localhost:9090"

# B2C User ID
USER_ID=5

echo "Creating prescription for user ID: $USER_ID"

# Create Prescription
PRESCRIPTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/prescriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 5,
    "doctorName": "Dr. Rajesh Kumar",
    "prescriptionDate": "2026-01-08",
    "validUntil": "2026-02-08",
    "fileUrl": "https://example.com/prescriptions/prescription-niraj-2026-01-08.pdf",
    "status": "UPLOADED"
  }')

echo "Prescription Response: $PRESCRIPTION_RESPONSE"
PRESCRIPTION_ID=$(echo $PRESCRIPTION_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$PRESCRIPTION_ID" ]; then
  echo "Failed to create prescription. Trying to extract from response..."
  PRESCRIPTION_ID=$(echo $PRESCRIPTION_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
fi

echo "Prescription ID: $PRESCRIPTION_ID"

# Wait a moment
sleep 1

echo ""
echo "Creating order with medicine items..."

# Create Order with Order Items
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": $USER_ID,
    \"orderType\": \"B2C\",
    \"orderNumber\": \"ORD-B2C-2026-001\",
    \"subtotalAmt\": 1250.00,
    \"totalAmt\": 1475.00,
    \"status\": \"PENDING\",
    \"prescriptionRequired\": true,
    \"prescriptionId\": $PRESCRIPTION_ID,
    \"orderItems\": [
      {
        \"productId\": 1001,
        \"quantity\": 2,
        \"unitPrice\": 250.00,
        \"prescriptionRequired\": true
      },
      {
        \"productId\": 1002,
        \"quantity\": 1,
        \"unitPrice\": 450.00,
        \"prescriptionRequired\": true
      },
      {
        \"productId\": 1003,
        \"quantity\": 3,
        \"unitPrice\": 100.00,
        \"prescriptionRequired\": false
      }
    ]
  }")

echo "Order Response: $ORDER_RESPONSE"
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ORDER_ID" ]; then
  ORDER_ID=$(echo $ORDER_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
fi

echo ""
echo "Order ID: $ORDER_ID"
echo ""
echo "Dummy data created successfully!"
echo "Prescription ID: $PRESCRIPTION_ID"
echo "Order ID: $ORDER_ID"
