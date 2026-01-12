package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotNull;
import org.cencora.ordermanagement.model.PrescriptionStatus;

public class ApprovePrescriptionRequest {
    
    @NotNull(message = "Admin user ID is required")
    public Long adminUserId;
    
    @NotNull(message = "Status is required")
    public PrescriptionStatus status;
    
    public String reviewNotes;
}
