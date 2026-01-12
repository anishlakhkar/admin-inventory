package org.cencora.inventorymanagement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "warehouse")
public class Warehouse {
    
    @Id
    @Column(name = "warehouse_id", length = 10)
    private String warehouseId;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "location_pin_code", nullable = false, length = 10)
    private String locationPinCode;
    
    @Column(name = "total_zone", nullable = false)
    private Integer totalZone;
    
    // Constructors
    public Warehouse() {
    }
    
    public Warehouse(String warehouseId, String username, String password, 
                     BigDecimal latitude, BigDecimal longitude, 
                     String locationPinCode, Integer totalZone) {
        this.warehouseId = warehouseId;
        this.username = username;
        this.password = password;
        this.latitude = latitude;
        this.longitude = longitude;
        this.locationPinCode = locationPinCode;
        this.totalZone = totalZone;
    }
    
    // Getters and Setters
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public BigDecimal getLatitude() {
        return latitude;
    }
    
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }
    
    public BigDecimal getLongitude() {
        return longitude;
    }
    
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }
    
    public String getLocationPinCode() {
        return locationPinCode;
    }
    
    public void setLocationPinCode(String locationPinCode) {
        this.locationPinCode = locationPinCode;
    }
    
    public Integer getTotalZone() {
        return totalZone;
    }
    
    public void setTotalZone(Integer totalZone) {
        this.totalZone = totalZone;
    }
}
