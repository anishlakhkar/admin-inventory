package org.cencora.inventorymanagement.entity;

import org.cencora.inventorymanagement.enums.PersonaType;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "product_batch",
       uniqueConstraints = @UniqueConstraint(columnNames = {"batch_id", "warehouse_id", "sku_id"}))
public class ProductBatch {
    
    @Id
    @Column(name = "batch_id", nullable = false, length = 50)
    private String batchId;
    
    @Column(name = "warehouse_id", nullable = false, length = 10)
    private String warehouseId;
    
    @Column(name = "sku_id", nullable = false, length = 50)
    private String skuId;
    
    @Column(nullable = false)
    private LocalDate expiry;
    
    @Column(nullable = false)
    private Long quantity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "persona_type", nullable = false, length = 10)
    private PersonaType personaType = PersonaType.BOTH;
    
    // Constructors
    public ProductBatch() {
    }
    
    public ProductBatch(String batchId, String warehouseId, String skuId, 
                       LocalDate expiry, Long quantity) {
        this.batchId = batchId;
        this.warehouseId = warehouseId;
        this.skuId = skuId;
        this.expiry = expiry;
        this.quantity = quantity;
        this.personaType = PersonaType.BOTH;
    }
    
    public ProductBatch(String batchId, String warehouseId, String skuId, 
                       LocalDate expiry, Long quantity, PersonaType personaType) {
        this.batchId = batchId;
        this.warehouseId = warehouseId;
        this.skuId = skuId;
        this.expiry = expiry;
        this.quantity = quantity;
        this.personaType = personaType;
    }
    
    // Getters and Setters
    public String getBatchId() {
        return batchId;
    }
    
    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }
    
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public String getSkuId() {
        return skuId;
    }
    
    public void setSkuId(String skuId) {
        this.skuId = skuId;
    }
    
    public LocalDate getExpiry() {
        return expiry;
    }
    
    public void setExpiry(LocalDate expiry) {
        this.expiry = expiry;
    }
    
    public Long getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Long quantity) {
        this.quantity = quantity;
    }
    
    public PersonaType getPersonaType() {
        return personaType;
    }
    
    public void setPersonaType(PersonaType personaType) {
        this.personaType = personaType;
    }
}
