package org.cencora.ordermanagement.dto;

import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.time.LocalDate;

public class UpdatePrescriptionRequest {
    
    public String doctorName;
    
    public LocalDate prescriptionDate;
    
    public LocalDate validUntil;
    
    public String fileUrl;
    
    public PrescriptionStatus status;
}
