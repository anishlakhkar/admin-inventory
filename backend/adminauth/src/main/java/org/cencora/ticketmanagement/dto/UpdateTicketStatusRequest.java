package org.cencora.ticketmanagement.dto;

import jakarta.validation.constraints.NotNull;
import org.cencora.ticketmanagement.model.TicketStatus;

public class UpdateTicketStatusRequest {
    
    @NotNull(message = "User ID is required")
    public Long userId;
    
    @NotNull(message = "Status is required")
    public TicketStatus status;
    
    public String comment;
}
