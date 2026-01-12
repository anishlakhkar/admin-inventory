package org.cencora.ordermanagement.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem extends PanacheEntityBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    public Order order;
    
    @Column(name = "product_id", nullable = false)
    public Long productId;
    
    @Column(name = "quantity", nullable = false)
    public Integer quantity;
    
    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    public BigDecimal unitPrice;
    
    @Column(name = "prescription_required", nullable = false)
    public Boolean prescriptionRequired;
}
