package org.cencora.ticketmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddCommentRequest {
    
    @NotNull(message = "User ID is required")
    public Long userId;
    
    @NotBlank(message = "Comment is required")
    public String comment;
}
