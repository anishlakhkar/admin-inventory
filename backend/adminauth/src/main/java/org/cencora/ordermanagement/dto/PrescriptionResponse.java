package org.cencora.ordermanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PrescriptionResponse {
    
    public Long id;
    public UserResponse user;
    public String doctorName;
    public LocalDate prescriptionDate;
    public LocalDate validUntil;
    public String fileUrl;
    public PrescriptionStatus status;
    public String reviewNotes;
    public UserResponse reviewedBy;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
