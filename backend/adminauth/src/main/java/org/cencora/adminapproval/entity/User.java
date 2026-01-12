package org.cencora.adminapproval.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.model.AccountStatus;
import org.cencora.adminapproval.model.UserType;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
public class User extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @Column(nullable = false, unique = true)
    public String email;
    
    @Column(nullable = false)
    public String password;
    
    @Column(name = "first_name")
    public String firstName;
    
    @Column(name = "last_name")
    public String lastName;
    
    @Column(name = "phone_no")
    public String phoneNo;
    
    @Column(name = "platform")
    public String platform;
    
    @Column(name = "business_info", columnDefinition = "TEXT")
    public String businessInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    public AccountStatus accountStatus;
    
    @ElementCollection(targetClass = UserType.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_types", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "user_type")
    public Set<UserType> userTypes = new HashSet<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
