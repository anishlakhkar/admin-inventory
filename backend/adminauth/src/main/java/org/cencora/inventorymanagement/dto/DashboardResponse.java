package org.cencora.inventorymanagement.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {
    
    private SummaryCards summaryCards;
    private List<StockItem> stockData;
    private List<LowStockAlert> lowStockAlerts;
    private List<ExpiryItem> expiryData;
    
    // Getters and Setters
    public SummaryCards getSummaryCards() {
        return summaryCards;
    }
    
    public void setSummaryCards(SummaryCards summaryCards) {
        this.summaryCards = summaryCards;
    }
    
    public List<StockItem> getStockData() {
        return stockData;
    }
    
    public void setStockData(List<StockItem> stockData) {
        this.stockData = stockData;
    }
    
    public List<LowStockAlert> getLowStockAlerts() {
        return lowStockAlerts;
    }
    
    public void setLowStockAlerts(List<LowStockAlert> lowStockAlerts) {
        this.lowStockAlerts = lowStockAlerts;
    }
    
    public List<ExpiryItem> getExpiryData() {
        return expiryData;
    }
    
    public void setExpiryData(List<ExpiryItem> expiryData) {
        this.expiryData = expiryData;
    }
    
    // Inner classes
    public static class SummaryCards {
        private BigDecimal totalStockValue;
        private Long lowStockItems;
        private Long expiringSoon;
        private Long totalProducts;
        
        public SummaryCards() {}
        
        public SummaryCards(BigDecimal totalStockValue, Long lowStockItems, 
                          Long expiringSoon, Long totalProducts) {
            this.totalStockValue = totalStockValue;
            this.lowStockItems = lowStockItems;
            this.expiringSoon = expiringSoon;
            this.totalProducts = totalProducts;
        }
        
        public BigDecimal getTotalStockValue() {
            return totalStockValue;
        }
        
        public void setTotalStockValue(BigDecimal totalStockValue) {
            this.totalStockValue = totalStockValue;
        }
        
        public Long getLowStockItems() {
            return lowStockItems;
        }
        
        public void setLowStockItems(Long lowStockItems) {
            this.lowStockItems = lowStockItems;
        }
        
        public Long getExpiringSoon() {
            return expiringSoon;
        }
        
        public void setExpiringSoon(Long expiringSoon) {
            this.expiringSoon = expiringSoon;
        }
        
        public Long getTotalProducts() {
            return totalProducts;
        }
        
        public void setTotalProducts(Long totalProducts) {
            this.totalProducts = totalProducts;
        }
    }
    
    public static class StockItem {
        private String skuId;
        private String productName;
        private Long stock;
        private String warehouse;
        private String status;
        
        public StockItem() {}
        
        public StockItem(String skuId, String productName, Long stock, 
                        String warehouse, String status) {
            this.skuId = skuId;
            this.productName = productName;
            this.stock = stock;
            this.warehouse = warehouse;
            this.status = status;
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
        
        public Long getStock() {
            return stock;
        }
        
        public void setStock(Long stock) {
            this.stock = stock;
        }
        
        public String getWarehouse() {
            return warehouse;
        }
        
        public void setWarehouse(String warehouse) {
            this.warehouse = warehouse;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
    
    public static class LowStockAlert {
        private String product;
        private String sku;
        private Long current;
        private Long threshold;
        private String warehouse;
        
        public LowStockAlert() {}
        
        public LowStockAlert(String product, String sku, Long current, 
                           Long threshold, String warehouse) {
            this.product = product;
            this.sku = sku;
            this.current = current;
            this.threshold = threshold;
            this.warehouse = warehouse;
        }
        
        public String getProduct() {
            return product;
        }
        
        public void setProduct(String product) {
            this.product = product;
        }
        
        public String getSku() {
            return sku;
        }
        
        public void setSku(String sku) {
            this.sku = sku;
        }
        
        public Long getCurrent() {
            return current;
        }
        
        public void setCurrent(Long current) {
            this.current = current;
        }
        
        public Long getThreshold() {
            return threshold;
        }
        
        public void setThreshold(Long threshold) {
            this.threshold = threshold;
        }
        
        public String getWarehouse() {
            return warehouse;
        }
        
        public void setWarehouse(String warehouse) {
            this.warehouse = warehouse;
        }
    }
    
    public static class ExpiryItem {
        private String batch;
        private String product;
        private String expiry;
        private Long quantity;
        private String status;
        
        public ExpiryItem() {}
        
        public ExpiryItem(String batch, String product, String expiry, 
                         Long quantity, String status) {
            this.batch = batch;
            this.product = product;
            this.expiry = expiry;
            this.quantity = quantity;
            this.status = status;
        }
        
        public String getBatch() {
            return batch;
        }
        
        public void setBatch(String batch) {
            this.batch = batch;
        }
        
        public String getProduct() {
            return product;
        }
        
        public void setProduct(String product) {
            this.product = product;
        }
        
        public String getExpiry() {
            return expiry;
        }
        
        public void setExpiry(String expiry) {
            this.expiry = expiry;
        }
        
        public Long getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
}
