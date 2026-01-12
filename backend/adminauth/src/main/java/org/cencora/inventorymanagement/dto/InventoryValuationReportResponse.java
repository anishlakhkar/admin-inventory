package org.cencora.inventorymanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InventoryValuationReportResponse {
    
    private String reportName;
    private String generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private BigDecimal totalValuation;
    private List<WarehouseValuation> warehouseValuations;
    private List<ProductValuation> productValuations;
    
    public InventoryValuationReportResponse() {
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
    
    public BigDecimal getTotalValuation() {
        return totalValuation;
    }
    
    public void setTotalValuation(BigDecimal totalValuation) {
        this.totalValuation = totalValuation;
    }
    
    public List<WarehouseValuation> getWarehouseValuations() {
        return warehouseValuations;
    }
    
    public void setWarehouseValuations(List<WarehouseValuation> warehouseValuations) {
        this.warehouseValuations = warehouseValuations;
    }
    
    public List<ProductValuation> getProductValuations() {
        return productValuations;
    }
    
    public void setProductValuations(List<ProductValuation> productValuations) {
        this.productValuations = productValuations;
    }
    
    // Inner classes
    public static class WarehouseValuation {
        private String warehouseId;
        private String warehouseName;
        private Long totalProducts;
        private Long totalQuantity;
        private BigDecimal totalValue;
        
        public WarehouseValuation() {
        }
        
        public WarehouseValuation(String warehouseId, String warehouseName, Long totalProducts, 
                                  Long totalQuantity, BigDecimal totalValue) {
            this.warehouseId = warehouseId;
            this.warehouseName = warehouseName;
            this.totalProducts = totalProducts;
            this.totalQuantity = totalQuantity;
            this.totalValue = totalValue;
        }
        
        // Getters and Setters
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
    }
    
    public static class ProductValuation {
        private String skuId;
        private String productName;
        private String category;
        private String warehouseId;
        private Long quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalValue;
        
        public ProductValuation() {
        }
        
        public ProductValuation(String skuId, String productName, String category, 
                               String warehouseId, Long quantity, BigDecimal unitPrice, BigDecimal totalValue) {
            this.skuId = skuId;
            this.productName = productName;
            this.category = category;
            this.warehouseId = warehouseId;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.totalValue = totalValue;
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
        
        public Long getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }
        
        public BigDecimal getUnitPrice() {
            return unitPrice;
        }
        
        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
        
        public BigDecimal getTotalValue() {
            return totalValue;
        }
        
        public void setTotalValue(BigDecimal totalValue) {
            this.totalValue = totalValue;
        }
    }
}
