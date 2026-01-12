package org.cencora.adminapproval.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.cencora.adminapproval.dto.ApprovalRequest;
import org.cencora.adminapproval.dto.UpdateUserRequest;
import org.cencora.adminapproval.dto.UserResponse;
import org.cencora.adminapproval.entity.User;
import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {
    
    public List<UserResponse> getAllUsers() {
        return User.listAll().stream()
                .map(user -> mapToUserResponse((User) user))
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getUsersByStatus(AccountStatus status) {
        return User.find("accountStatus", status).list().stream()
                .map(user -> mapToUserResponse((User) user))
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getUsersByType(UserType type) {
        // Use native query for MySQL 5.6 compatibility
        @SuppressWarnings("unchecked")
        List<Object> results = User.getEntityManager()
                .createNativeQuery("SELECT DISTINCT u.id FROM users u INNER JOIN user_types ut ON u.id = ut.user_id WHERE ut.user_type = ?1")
                .setParameter(1, type.name())
                .getResultList();
        
        return results.stream()
                .map(result -> {
                    Long id = ((Number) result).longValue();
                    User user = User.findById(id);
                    return user != null ? mapToUserResponse(user) : null;
                })
                .filter(user -> user != null)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found with id: " + id);
        }
        return mapToUserResponse(user);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found with id: " + id);
        }
        
        if (request.email != null && !request.email.equals(user.email)) {
            User existingUser = User.findByEmail(request.email);
            if (existingUser != null && !existingUser.id.equals(id)) {
                throw new BadRequestException("Email already exists");
            }
            user.email = request.email;
        }
        
        if (request.firstName != null) {
            user.firstName = request.firstName;
        }

        if (request.lastName != null) {
            user.lastName = request.lastName;
        }

        if (request.phoneNo != null) {
            user.phoneNo = request.phoneNo;
        }

        if (request.platform != null) {
            user.platform = request.platform;
        }

        if (request.businessInfo != null) {
            user.businessInfo = request.businessInfo;
        }
        
        if (request.userTypes != null && !request.userTypes.isEmpty()) {
            // Check if trying to set userType to ADMIN
            if (request.userTypes.contains(UserType.ADMIN)) {
                // Check if user is already an admin
                boolean isCurrentUserAdmin = user.userTypes != null && user.userTypes.contains(UserType.ADMIN);
                
                if (!isCurrentUserAdmin) {
                    // User is not currently an admin, check if admin already exists
                    Number result = (Number) User.getEntityManager()
                            .createNativeQuery("SELECT COUNT(DISTINCT u.id) FROM users u INNER JOIN user_types ut ON u.id = ut.user_id WHERE ut.user_type = ?1")
                            .setParameter(1, UserType.ADMIN.name())
                            .getSingleResult();
                    
                    long adminCount = result != null ? result.longValue() : 0L;
                    
                    if (adminCount > 0) {
                        throw new BadRequestException("Admin user already exists. Cannot change user type to ADMIN.");
                    }
                }
                // If user is already an admin, allow the update (they can keep admin status or add other types)
            }
            
            user.userTypes = request.userTypes;
        }
        
        // Automatically set accountStatus based on userTypes
        if (user.userTypes != null && !user.userTypes.isEmpty()) {
            // B2B and WAREHOUSE require admin approval
            if (user.userTypes.contains(UserType.B2B) || user.userTypes.contains(UserType.WAREHOUSE)) {
                user.accountStatus = AccountStatus.PENDING_APPROVAL;
            } 
            // B2C is automatically active
            else if (user.userTypes.contains(UserType.B2C)) {
                user.accountStatus = AccountStatus.ACTIVE;
            }
            // For ADMIN or other types, use provided accountStatus if available
            else if (request.accountStatus != null) {
                user.accountStatus = request.accountStatus;
            }
        } else if (request.accountStatus != null) {
            // If no userTypes provided, use the provided accountStatus
            user.accountStatus = request.accountStatus;
        }
        
        user.persist();
        
        return mapToUserResponse(user);
    }
    
    @Transactional
    public UserResponse approveUser(Long id, ApprovalRequest request) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found with id: " + id);
        }
        
        user.accountStatus = request.accountStatus;
        user.persist();
        
        return mapToUserResponse(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = User.findById(id);
        if (user == null) {
            throw new NotFoundException("User not found with id: " + id);
        }
        user.delete();
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
