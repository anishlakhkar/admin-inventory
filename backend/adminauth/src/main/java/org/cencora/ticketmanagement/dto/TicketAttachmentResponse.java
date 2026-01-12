package org.cencora.ticketmanagement.dto;

import org.cencora.adminapproval.dto.UserResponse;

import java.time.LocalDateTime;

public class TicketAttachmentResponse {
    public Long attachmentId;
    public Long ticketId;
    public UserResponse uploadedBy;
    public String fileUrl;
    public String fileName;
    public Long fileSize;
    public LocalDateTime createdAt;
}
