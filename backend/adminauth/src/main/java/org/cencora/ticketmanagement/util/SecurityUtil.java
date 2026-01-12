package org.cencora.ticketmanagement.util;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.SecurityContext;
import org.cencora.adminapproval.entity.User;
import org.cencora.adminapproval.model.UserType;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.Set;

@ApplicationScoped
public class SecurityUtil {
    
    public Long getCurrentUserId(JsonWebToken jwt) {
        if (jwt == null) {
            return null;
        }
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim instanceof Number) {
            return ((Number) userIdClaim).longValue();
        }
        return null;
    }
    
    public boolean hasRole(JsonWebToken jwt, UserType userType) {
        if (jwt == null) {
            return false;
        }
        Set<String> groups = jwt.getGroups();
        return groups != null && groups.contains("ROLE_" + userType.name());
    }
    
    public boolean hasAnyRole(JsonWebToken jwt, UserType... userTypes) {
        if (jwt == null) {
            return false;
        }
        Set<String> groups = jwt.getGroups();
        if (groups == null) {
            return false;
        }
        for (UserType userType : userTypes) {
            if (groups.contains("ROLE_" + userType.name())) {
                return true;
            }
        }
        return false;
    }
}
