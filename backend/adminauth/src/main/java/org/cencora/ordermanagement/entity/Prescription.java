package org.cencora.ordermanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.ordermanagement.model.PrescriptionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
public class Prescription extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
    
    @Column(name = "doctor_name")
    public String doctorName;
    
    @Column(name = "prescription_date", nullable = false)
    public LocalDate prescriptionDate;
    
    @Column(name = "valid_until", nullable = false)
    public LocalDate validUntil;
    
    @Column(name = "file_url", nullable = false)
    public String fileUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public PrescriptionStatus status;
    
    @Column(name = "review_notes", columnDefinition = "TEXT")
    public String reviewNotes;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by")
    public User reviewedBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = PrescriptionStatus.UPLOADED;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
