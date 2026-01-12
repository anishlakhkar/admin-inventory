package org.cencora.ticketmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddAttachmentRequest {
    
    @NotNull(message = "User ID is required")
    public Long userId;
    
    @NotBlank(message = "File URL is required")
    public String fileUrl;
    
    public String fileName;
    
    public Long fileSize;
}
