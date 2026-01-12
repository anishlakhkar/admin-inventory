package org.cencora.adminapproval.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.cencora.adminapproval.model.UserType;

import java.util.Set;

public class SignupRequest {
    
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
    
    @NotNull(message = "At least one user type is required")
    public Set<UserType> userTypes;
}
