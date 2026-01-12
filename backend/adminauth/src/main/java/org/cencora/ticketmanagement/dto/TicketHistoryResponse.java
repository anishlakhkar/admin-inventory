package org.cencora.ticketmanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.ticketmanagement.model.TicketStatus;

import java.time.LocalDateTime;

public class TicketHistoryResponse {
    public Long historyId;
    public Long ticketId;
    public UserResponse actionBy;
    public TicketStatus oldStatus;
    public TicketStatus newStatus;
    public UserResponse oldAssignee;
    public UserResponse newAssignee;
    public String comment;
    public LocalDateTime createdAt;
}
