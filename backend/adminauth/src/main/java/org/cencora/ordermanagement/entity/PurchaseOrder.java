package org.cencora.ordermanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders", uniqueConstraints = {
    @UniqueConstraint(columnNames = "po_number")
})
public class PurchaseOrder extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "po_id")
    public Long poId;
    
    @Column(name = "po_number", nullable = false, unique = true)
    public String poNumber;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    public Order order;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public PurchaseOrderStatus status;  // PENDING initially, then APPROVED or REJECTED
    
    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    public BigDecimal totalAmount;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    public String comments;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approved_rejected_by")
    public User approvedRejectedBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "approved_rejected_at")
    public LocalDateTime approvedRejectedAt;
    
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
}
