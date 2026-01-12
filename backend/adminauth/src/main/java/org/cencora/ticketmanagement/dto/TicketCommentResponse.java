package org.cencora.ticketmanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;

import java.time.LocalDateTime;

public class TicketCommentResponse {
    public Long commentId;
    public Long ticketId;
    public UserResponse commentedBy;
    public String comment;
    public LocalDateTime createdAt;
}
