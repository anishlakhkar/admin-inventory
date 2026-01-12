package org.cencora.adminapproval.dto;

import org.cencora.adminapproval.model.UserType;

import java.util.Set;

public class LoginResponse {
    public String token;
    public Long userId;
    public String email;
    public Set<UserType> userTypes;
    
    public LoginResponse() {
    }
    
    public LoginResponse(String token, Long userId, String email, Set<UserType> userTypes) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.userTypes = userTypes;
    }
}
