package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotNull;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;

public class UpdatePurchaseOrderStatusRequest {
    @NotNull(message = "Admin user ID is required")
    public Long adminUserId;
    
    @NotNull(message = "Status is required")
    public PurchaseOrderStatus status;
    
    public String comments;
}
