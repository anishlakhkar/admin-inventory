package org.cencora.ordermanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PurchaseOrderResponse {
    public Long poId;
    public String poNumber;
    public Long orderId;
    public PurchaseOrderStatus status;
    public BigDecimal totalAmount;
    public String comments;
    public UserResponse approvedRejectedBy;
    public LocalDateTime createdAt;
    public LocalDateTime approvedRejectedAt;
    public LocalDateTime updatedAt;
}
