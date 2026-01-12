package org.cencora.ordermanagement.dto;

import org.cencora.ordermanagement.model.OrderType;

import java.math.BigDecimal;

public class UpdateOrderRequest {
    
    public OrderType orderType;
    public String orderNumber;
    public BigDecimal subtotalAmt;
    public BigDecimal totalAmt;
    public String status;
    public Boolean prescriptionRequired;
    public Long prescriptionId;
}
