package org.cencora.adminapproval.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.cencora.adminapproval.dto.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;

import java.util.Set;

@ApplicationScoped
public class AuthService {
    
    @Inject
    PasswordService passwordService;
    
    @Inject
    JwtService jwtService;
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = User.findByEmail(request.email);
        
        if (user == null) {
            throw new NotFoundException("Invalid email or password");
        }
        
        if (!passwordService.verifyPassword(request.password, user.password)) {
            throw new ForbiddenException("Invalid email or password");
        }
        
        if (user.accountStatus != AccountStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active. Current status: " + user.accountStatus);
        }
        
        try {
            String token = jwtService.generateToken(user.id, user.email, user.userTypes);
            return new LoginResponse(token, user.id, user.email, user.userTypes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate authentication token: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (User.findByEmail(request.email) != null) {
            throw new BadRequestException("Email already exists");
        }
        
        // Check if trying to create ADMIN user and admin already exists
        if (request.userTypes.contains(UserType.ADMIN)) {
            Number result = (Number) User.getEntityManager()
                    .createNativeQuery("SELECT COUNT(DISTINCT u.id) FROM users u INNER JOIN user_types ut ON u.id = ut.user_id WHERE ut.user_type = ?1")
                    .setParameter(1, UserType.ADMIN.name())
                    .getSingleResult();
            
            long adminCount = result != null ? result.longValue() : 0L;
            
            if (adminCount > 0) {
                throw new BadRequestException("Admin user already exists. Cannot create another admin user through signup.");
            }
        }
        
        User user = new User();
        user.email = request.email;
        user.password = passwordService.hashPassword(request.password);
        user.firstName = request.firstName;
        user.lastName = request.lastName;
        user.phoneNo = request.phoneNo;
        user.platform = request.platform;
        user.businessInfo = request.businessInfo;
        user.userTypes = request.userTypes;
        
        // Set account status based on user types
        // B2B and WAREHOUSE require admin approval
        if (request.userTypes.contains(UserType.B2B) || request.userTypes.contains(UserType.WAREHOUSE)) {
            user.accountStatus = AccountStatus.PENDING_APPROVAL;
        } else {
            // B2C and ADMIN can be active immediately
            user.accountStatus = AccountStatus.ACTIVE;
        }
        
        user.persist();
        
        return mapToUserResponse(user);
    }
    
    @Transactional
    public UserResponse setupAdmin(AdminSetupRequest request) {
        // Check if any admin already exists using native query for MySQL 5.6 compatibility
        Number result = (Number) User.getEntityManager()
                .createNativeQuery("SELECT COUNT(DISTINCT u.id) FROM users u INNER JOIN user_types ut ON u.id = ut.user_id WHERE ut.user_type = ?1")
                .setParameter(1, UserType.ADMIN.name())
                .getSingleResult();
        
        long adminCount = result != null ? result.longValue() : 0L;
        
        if (adminCount > 0) {
            throw new BadRequestException("Admin already exists. Use signup endpoint instead.");
        }
        
        if (User.findByEmail(request.email) != null) {
            throw new BadRequestException("Email already exists");
        }
        
        User user = new User();
        user.email = request.email;
        user.password = passwordService.hashPassword(request.password);
        user.firstName = request.firstName;
        user.lastName = request.lastName;
        user.phoneNo = request.phoneNo;
        user.platform = request.platform;
        user.businessInfo = request.businessInfo;
        user.userTypes = Set.of(UserType.ADMIN);
        user.accountStatus = AccountStatus.ACTIVE;
        
        user.persist();
        
        return mapToUserResponse(user);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.phoneNo,
            user.platform,
            user.businessInfo,
            user.accountStatus,
            user.userTypes,
            user.createdAt,
            user.updatedAt
        );
    }
}
