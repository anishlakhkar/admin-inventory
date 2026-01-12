package org.cencora.ticketmanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.ticketmanagement.model.Priority;
import org.cencora.ticketmanagement.model.TicketStatus;
import org.cencora.ticketmanagement.model.TicketType;

import java.time.LocalDateTime;

public class TicketResponse {
    public Long ticketId;
    public UserResponse raisedBy;
    public UserResponse assignedTo;
    public TicketType ticketType;
    public Priority priority;
    public TicketStatus status;
    public String title;
    public String description;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
