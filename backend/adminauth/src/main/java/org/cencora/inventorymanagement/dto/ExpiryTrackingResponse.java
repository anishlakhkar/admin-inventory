package org.cencora.inventorymanagement.dto;

import java.time.LocalDate;

public class ExpiryTrackingResponse {
    private String batchId;
    private String productName;
    private String skuId;
    private LocalDate expiry;
    private Long quantity;
    private String warehouse;
    private Long daysLeft;
    private String status; // Critical, Expiring Soon, Monitor, Good

    public ExpiryTrackingResponse() {
    }

    public ExpiryTrackingResponse(String batchId, String productName, String skuId, 
                                 LocalDate expiry, Long quantity, String warehouse, 
                                 Long daysLeft, String status) {
        this.batchId = batchId;
        this.productName = productName;
        this.skuId = skuId;
        this.expiry = expiry;
        this.quantity = quantity;
        this.warehouse = warehouse;
        this.daysLeft = daysLeft;
        this.status = status;
    }

    // Getters and Setters
    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
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

    public String getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
    }

    public Long getDaysLeft() {
        return daysLeft;
    }

    public void setDaysLeft(Long daysLeft) {
        this.daysLeft = daysLeft;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
