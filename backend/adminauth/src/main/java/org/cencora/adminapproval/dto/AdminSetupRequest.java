package org.cencora.adminapproval.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminSetupRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    public String email;
    
    @NotBlank(message = "Password is required")
    public String password;
    
    public String firstName;
    
    public String lastName;
    
    public String phoneNo;
    
    public String platform;
    
    public String businessInfo;
}
