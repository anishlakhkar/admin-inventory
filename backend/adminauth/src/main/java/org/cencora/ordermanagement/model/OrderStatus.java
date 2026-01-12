package org.cencora.ordermanagement.model;

public enum OrderStatus {
    PROCESSING,    // B2B: Waiting for PO approval
    CONFIRMED,     // B2C: Auto-confirmed | B2B: After PO approved
    SHIPPED,       // Order has been shipped
    DELIVERED,     // Order delivered to customer
    CANCELLED      // B2B: When PO is rejected
}
