package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateOrderItemRequest {
    
    @NotNull(message = "Product ID is required")
    public Long productId;
    
    @NotNull(message = "Quantity is required")
    public Integer quantity;
    
    @NotNull(message = "Unit price is required")
    public BigDecimal unitPrice;
    
    @NotNull(message = "Prescription required flag is required")
    public Boolean prescriptionRequired;
}
