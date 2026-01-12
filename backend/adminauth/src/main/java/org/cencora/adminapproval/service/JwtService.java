package org.cencora.adminapproval.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.cencora.adminapproval.model.UserType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class JwtService {
    
    @ConfigProperty(name = "jwt.issuer", defaultValue = "adminauth")
    String issuer;
    
    @ConfigProperty(name = "jwt.expiration.hours", defaultValue = "24")
    Long expirationHours;
    
    @ConfigProperty(name = "smallrye.jwt.sign.key.secret")
    String jwtSecret;
    
    public String generateToken(Long userId, String email, Set<UserType> userTypes) {
        Set<String> roles = userTypes.stream()
                .map(ut -> "ROLE_" + ut.name())
                .collect(Collectors.toSet());
        
        try {
            return Jwt.issuer(issuer)
                    .subject(email)
                    .claim("userId", userId)
                    .claim("email", email)
                    .groups(roles)
                    .expiresIn(Duration.ofHours(expirationHours))
                    .signWithSecret(jwtSecret);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token: " + e.getMessage() + ". Secret length: " + (jwtSecret != null ? jwtSecret.length() : "null"), e);
        }
    }
}
