package org.cencora.inventorymanagement.dto;

import java.time.LocalDate;
import java.util.List;

public class LowStockReportResponse {
    
    private String reportName;
    private String generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private Long totalLowStockItems;
    private List<LowStockItem> lowStockItems;
    
    public LowStockReportResponse() {
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
    
    public Long getTotalLowStockItems() {
        return totalLowStockItems;
    }
    
    public void setTotalLowStockItems(Long totalLowStockItems) {
        this.totalLowStockItems = totalLowStockItems;
    }
    
    public List<LowStockItem> getLowStockItems() {
        return lowStockItems;
    }
    
    public void setLowStockItems(List<LowStockItem> lowStockItems) {
        this.lowStockItems = lowStockItems;
    }
    
    // Inner class
    public static class LowStockItem {
        private String skuId;
        private String productName;
        private String category;
        private String warehouseId;
        private String warehouseName;
        private Long currentStock;
        private Long threshold;
        private Long shortage;
        private Long daysUntilOut;
        private String priority;
        
        public LowStockItem() {
        }
        
        public LowStockItem(String skuId, String productName, String category, 
                           String warehouseId, String warehouseName, Long currentStock, 
                           Long threshold, Long shortage, Long daysUntilOut, String priority) {
            this.skuId = skuId;
            this.productName = productName;
            this.category = category;
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.currentStock = currentStock;
            this.threshold = threshold;
            this.shortage = shortage;
            this.daysUntilOut = daysUntilOut;
            this.priority = priority;
        }
        
        // Getters and Setters
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
        
        public Long getCurrentStock() {
            return currentStock;
        }
        
        public void setCurrentStock(Long currentStock) {
            this.currentStock = currentStock;
        }
        
        public Long getThreshold() {
            return threshold;
        }
        
        public void setThreshold(Long threshold) {
            this.threshold = threshold;
        }
        
        public Long getShortage() {
            return shortage;
        }
        
        public void setShortage(Long shortage) {
            this.shortage = shortage;
        }
        
        public Long getDaysUntilOut() {
            return daysUntilOut;
        }
        
        public void setDaysUntilOut(Long daysUntilOut) {
            this.daysUntilOut = daysUntilOut;
        }
        
        public String getPriority() {
            return priority;
        }
        
        public void setPriority(String priority) {
            this.priority = priority;
        }
    }
}
