package org.cencora.inventorymanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class FullInventoryExportResponse {
    
    private String reportName;
    private String generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private Long totalProducts;
    private Long totalQuantity;
    private BigDecimal totalValue;
    private List<InventoryItem> items;
    
    public FullInventoryExportResponse() {
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
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Long getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(Long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public BigDecimal getTotalValue() {
        return totalValue;
    }
    
    public void setTotalValue(BigDecimal totalValue) {
        this.totalValue = totalValue;
    }
    
    public List<InventoryItem> getItems() {
        return items;
    }
    
    public void setItems(List<InventoryItem> items) {
        this.items = items;
    }
    
    // Inner class for inventory items
    public static class InventoryItem {
        private String skuId;
        private String productName;
        private String category;
        private String warehouseId;
        private String warehouseName;
        private Long quantity;
        private BigDecimal price;
        private BigDecimal totalValue;
        private String storageType;
        private String dosageForm;
        
        public InventoryItem() {
        }
        
        public InventoryItem(String skuId, String productName, String category, String warehouseId,
                           String warehouseName, Long quantity, BigDecimal price, BigDecimal totalValue,
                           String storageType, String dosageForm) {
            this.skuId = skuId;
            this.productName = productName;
            this.category = category;
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.quantity = quantity;
            this.price = price;
            this.totalValue = totalValue;
            this.storageType = storageType;
            this.dosageForm = dosageForm;
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
        
        public Long getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }
        
        public BigDecimal getPrice() {
            return price;
        }
        
        public void setPrice(BigDecimal price) {
            this.price = price;
        }
        
        public BigDecimal getTotalValue() {
            return totalValue;
        }
        
        public void setTotalValue(BigDecimal totalValue) {
            this.totalValue = totalValue;
        }
        
        public String getStorageType() {
            return storageType;
        }
        
        public void setStorageType(String storageType) {
            this.storageType = storageType;
        }
        
        public String getDosageForm() {
            return dosageForm;
        }
        
        public void setDosageForm(String dosageForm) {
            this.dosageForm = dosageForm;
        }
    }
}
