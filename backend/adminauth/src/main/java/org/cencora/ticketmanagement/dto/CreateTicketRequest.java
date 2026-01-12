package org.cencora.ticketmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.cencora.ticketmanagement.model.Priority;
import org.cencora.ticketmanagement.model.TicketType;

public class CreateTicketRequest {
    
    @NotNull(message = "Raised by user ID is required")
    public Long raisedByUserId;
    
    @NotBlank(message = "Title is required")
    public String title;
    
    public String description;
    
    @NotNull(message = "Ticket type is required")
    public TicketType ticketType;
    
    @NotNull(message = "Priority is required")
    public Priority priority;
}
