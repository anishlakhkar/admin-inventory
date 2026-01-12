package org.cencora.ordermanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.cencora.adminapproval.entity.User;
import org.cencora.ordermanagement.model.OrderStatus;
import org.cencora.ordermanagement.model.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders", uniqueConstraints = {
    @UniqueConstraint(columnNames = "order_number")
})
public class Order extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    public OrderType orderType;
    
    @Column(name = "order_number", nullable = false, unique = true)
    public String orderNumber;
    
    @Column(name = "subtotal_amt", nullable = false, precision = 19, scale = 2)
    public BigDecimal subtotalAmt;
    
    @Column(name = "total_amt", nullable = false, precision = 19, scale = 2)
    public BigDecimal totalAmt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    public OrderStatus status;
    
    @OneToOne(mappedBy = "order", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    public PurchaseOrder purchaseOrder;
    
    @Column(name = "prescription_required", nullable = false)
    public Boolean prescriptionRequired;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prescription_id")
    public Prescription prescription;
    
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
}
