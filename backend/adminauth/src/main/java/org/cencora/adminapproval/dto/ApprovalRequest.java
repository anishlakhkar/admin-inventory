package org.cencora.adminapproval.dto;

import jakarta.validation.constraints.NotNull;
import org.cencora.adminapproval.model.AccountStatus;

public class ApprovalRequest {
    
    @NotNull(message = "Account status is required")
    public AccountStatus accountStatus;
}
