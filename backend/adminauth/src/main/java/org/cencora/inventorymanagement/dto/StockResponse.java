package org.cencora.inventorymanagement.dto;

import java.util.List;

public class StockResponse {
    private String skuId;
    private String warehouseId;
    private String warehouseName;
    private String productName;
    private String productSku;
    private Long onHand;
    private Long reserved;
    private Long blocked;
    private Long available;
    private List<BatchInfo> batches;
    
    public static class BatchInfo {
        private String batchId;
        private Long quantity;
        private String expiry;
        
        // Getters and Setters
        public String getBatchId() {
            return batchId;
        }
        
        public void setBatchId(String batchId) {
            this.batchId = batchId;
        }
        
        public Long getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }
        
        public String getExpiry() {
            return expiry;
        }
        
        public void setExpiry(String expiry) {
            this.expiry = expiry;
        }
    }
    
    // Getters and Setters
    public String getSkuId() {
        return skuId;
    }
    
    public void setSkuId(String skuId) {
        this.skuId = skuId;
    }
    
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public String getWarehouseName() {
        return warehouseName;
    }
    
    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getProductSku() {
        return productSku;
    }
    
    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }
    
    public Long getOnHand() {
        return onHand;
    }
    
    public void setOnHand(Long onHand) {
        this.onHand = onHand;
    }
    
    public Long getReserved() {
        return reserved;
    }
    
    public void setReserved(Long reserved) {
        this.reserved = reserved;
    }
    
    public Long getBlocked() {
        return blocked;
    }
    
    public void setBlocked(Long blocked) {
        this.blocked = blocked;
    }
    
    public Long getAvailable() {
        return available;
    }
    
    public void setAvailable(Long available) {
        this.available = available;
    }
    
    public List<BatchInfo> getBatches() {
        return batches;
    }
    
    public void setBatches(List<BatchInfo> batches) {
        this.batches = batches;
    }
}
