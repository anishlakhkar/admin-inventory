package org.cencora.adminapproval.dto;

import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;

import java.time.LocalDateTime;
import java.util.Set;

public class UserResponse {
    public Long id;
    public String email;
    public String firstName;
    public String lastName;
    public String phoneNo;
    public String platform;
    public String businessInfo;
    public AccountStatus accountStatus;
    public Set<UserType> userTypes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    
    public UserResponse() {
    }
    
    public UserResponse(Long id, String email, String firstName, String lastName,
                       String phoneNo, String platform, String businessInfo,
                       AccountStatus accountStatus, Set<UserType> userTypes, 
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNo = phoneNo;
        this.platform = platform;
        this.businessInfo = businessInfo;
        this.accountStatus = accountStatus;
        this.userTypes = userTypes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
