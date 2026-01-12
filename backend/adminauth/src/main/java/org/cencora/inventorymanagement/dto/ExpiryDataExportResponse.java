package org.cencora.inventorymanagement.dto;

import java.time.LocalDate;
import java.util.List;

public class ExpiryDataExportResponse {
    
    private String reportName;
    private String generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private Long totalBatches;
    private Long expiringSoonCount;
    private Long expiredCount;
    private List<ExpiryItem> items;
    
    public ExpiryDataExportResponse() {
    }
    
    // Getters and Setters
    public String getReportName() {
        return reportName;
    }
    
    public void setReportName(String reportName) {
        this.reportName = reportName;
    }
    
    public String getGeneratedDate() {
        return generatedDate;
    }
    
    public void setGeneratedDate(String generatedDate) {
        this.generatedDate = generatedDate;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public Long getTotalBatches() {
        return totalBatches;
    }
    
    public void setTotalBatches(Long totalBatches) {
        this.totalBatches = totalBatches;
    }
    
    public Long getExpiringSoonCount() {
        return expiringSoonCount;
    }
    
    public void setExpiringSoonCount(Long expiringSoonCount) {
        this.expiringSoonCount = expiringSoonCount;
    }
    
    public Long getExpiredCount() {
        return expiredCount;
    }
    
    public void setExpiredCount(Long expiredCount) {
        this.expiredCount = expiredCount;
    }
    
    public List<ExpiryItem> getItems() {
        return items;
    }
    
    public void setItems(List<ExpiryItem> items) {
        this.items = items;
    }
    
    // Inner class for expiry items
    public static class ExpiryItem {
        private String batchId;
        private String skuId;
        private String productName;
        private String category;
        private String warehouseId;
        private String warehouseName;
        private LocalDate expiry;
        private Long daysUntilExpiry;
        private String status; // "Expired", "Expiring Soon", "Valid"
        private Long quantity;
        private String personaType;
        
        public ExpiryItem() {
        }
        
        public ExpiryItem(String batchId, String skuId, String productName, String category,
                         String warehouseId, String warehouseName, LocalDate expiry, Long daysUntilExpiry,
                         String status, Long quantity, String personaType) {
            this.batchId = batchId;
            this.skuId = skuId;
            this.productName = productName;
            this.category = category;
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.expiry = expiry;
            this.daysUntilExpiry = daysUntilExpiry;
            this.status = status;
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
        
        public String getSkuId() {
            return skuId;
        }
        
        public void setSkuId(String skuId) {
            this.skuId = skuId;
        }
        
        public String getProductName() {
            return productName;
        }
        
        public void setProductName(String productName) {
            this.productName = productName;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
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
        
        public LocalDate getExpiry() {
            return expiry;
        }
        
        public void setExpiry(LocalDate expiry) {
            this.expiry = expiry;
        }
        
        public Long getDaysUntilExpiry() {
            return daysUntilExpiry;
        }
        
        public void setDaysUntilExpiry(Long daysUntilExpiry) {
            this.daysUntilExpiry = daysUntilExpiry;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public Long getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }
        
        public String getPersonaType() {
            return personaType;
        }
        
        public void setPersonaType(String personaType) {
            this.personaType = personaType;
        }
    }
}
