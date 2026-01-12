package org.cencora.ticketmanagement.dto;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {
    
    @NotNull(message = "Admin user ID is required")
    public Long adminUserId;
    
    @NotNull(message = "Executive user ID is required")
    public Long executiveId;
    
    public String comment;
}
