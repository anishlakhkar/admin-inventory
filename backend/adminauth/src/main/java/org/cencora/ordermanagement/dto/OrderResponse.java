package org.cencora.ordermanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.ordermanagement.model.OrderStatus;
import org.cencora.ordermanagement.model.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    
    public Long id;
    public UserResponse user;
    public OrderType orderType;
    public String orderNumber;
    public BigDecimal subtotalAmt;
    public BigDecimal totalAmt;
    public OrderStatus status;
    public PurchaseOrderResponse purchaseOrder;  // Only for B2B orders
    public Boolean prescriptionRequired;
    public PrescriptionResponse prescription;
    public List<OrderItemResponse> orderItems;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
