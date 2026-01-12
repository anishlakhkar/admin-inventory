package org.cencora.ordermanagement.dto;

import java.math.BigDecimal;

public class UpdateOrderItemRequest {
    
    public Long productId;
    public Integer quantity;
    public BigDecimal unitPrice;
    public Boolean prescriptionRequired;
}
