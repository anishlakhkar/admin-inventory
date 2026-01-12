package org.cencora.ordermanagement.dto;

import java.math.BigDecimal;

public class OrderItemResponse {
    
    public Long id;
    public Long orderId;
    public Long productId;
    public Integer quantity;
    public BigDecimal unitPrice;
    public Boolean prescriptionRequired;
}
