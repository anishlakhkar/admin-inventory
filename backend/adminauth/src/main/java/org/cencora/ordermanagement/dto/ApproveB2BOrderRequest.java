package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotNull;

public class ApproveB2BOrderRequest {
    
    @NotNull(message = "Admin user ID is required")
    public Long adminUserId;
    
    public String notes;
}
