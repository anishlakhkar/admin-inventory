package org.cencora.ordermanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.time.LocalDate;

public class CreatePrescriptionRequest {
    
    @NotNull(message = "User ID is required")
    public Long userId;
    
    public String doctorName;
    
    @NotNull(message = "Prescription date is required")
    public LocalDate prescriptionDate;
    
    @NotNull(message = "Valid until date is required")
    public LocalDate validUntil;
    
    @NotBlank(message = "File URL is required")
    public String fileUrl;
    
    public PrescriptionStatus status;
}
