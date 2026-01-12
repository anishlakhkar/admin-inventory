package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class CreatePurchaseOrderRequest {
    @NotNull(message = "Order ID is required")
    public Long orderId;
    
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    public BigDecimal totalAmount;
    
    public String comments;
}
