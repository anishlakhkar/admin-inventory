package org.cencora.adminapproval.dto;

import jakarta.validation.constraints.Email;
import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;

import java.util.Set;

public class UpdateUserRequest {
    @Email(message = "Email should be valid")
    public String email;
    
    public String firstName;
    
    public String lastName;
    
    public String phoneNo;
    
    public String platform;
    
    public String businessInfo;
    
    public AccountStatus accountStatus;
    
    public Set<UserType> userTypes;
}
