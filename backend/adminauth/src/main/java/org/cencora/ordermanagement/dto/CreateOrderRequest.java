package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.cencora.ordermanagement.model.OrderType;

import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {
    
    @NotNull(message = "User ID is required")
    public Long userId;
    
    @NotNull(message = "Order type is required")
    public OrderType orderType;
    
    @NotBlank(message = "Order number is required")
    public String orderNumber;
    
    @NotNull(message = "Subtotal amount is required")
    public BigDecimal subtotalAmt;
    
    @NotNull(message = "Total amount is required")
    public BigDecimal totalAmt;
    
    public String status;
    
    @NotNull(message = "Prescription required flag is required")
    public Boolean prescriptionRequired;
    
    public Long prescriptionId;
    
    @NotNull(message = "Order items are required")
    public List<CreateOrderItemRequest> orderItems;
}
