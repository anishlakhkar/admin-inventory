package org.cencora.inventorymanagement.entity;

import org.cencora.inventorymanagement.enums.StorageType;
import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "zone")
public class Zone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "warehouse_id", nullable = false, length = 10)
    private String warehouseId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false, length = 20)
    private StorageType storageType;
    
    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;
    
    @Column(name = "current_capacity", nullable = false)
    private Integer currentCapacity;
    
    @ElementCollection
    @CollectionTable(name = "zone_product_list", joinColumns = @JoinColumn(name = "zone_id"))
    @MapKeyColumn(name = "sku_id")
    @Column(name = "quantity")
    private Map<String, Integer> productList = new HashMap<>();
    
    // Constructors
    public Zone() {
    }
    
    public Zone(String warehouseId, StorageType storageType, 
                Integer totalCapacity, Integer currentCapacity) {
        this.warehouseId = warehouseId;
        this.storageType = storageType;
        this.totalCapacity = totalCapacity;
        this.currentCapacity = currentCapacity;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public StorageType getStorageType() {
        return storageType;
    }
    
    public void setStorageType(StorageType storageType) {
        this.storageType = storageType;
    }
    
    public Integer getTotalCapacity() {
        return totalCapacity;
    }
    
    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }
    
    public Integer getCurrentCapacity() {
        return currentCapacity;
    }
    
    public void setCurrentCapacity(Integer currentCapacity) {
        this.currentCapacity = currentCapacity;
    }
    
    public Map<String, Integer> getProductList() {
        return productList;
    }
    
    public void setProductList(Map<String, Integer> productList) {
        this.productList = productList;
    }
}
