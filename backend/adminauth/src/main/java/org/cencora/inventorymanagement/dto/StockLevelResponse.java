package org.cencora.inventorymanagement.dto;

public class StockLevelResponse {
    private String skuId;
    private String productName;
    private String category;
    private Long stock;
    private Long minStock; // threshold
    private Long maxStock;
    private String warehouse;
    private String status; // Optimal, Below Min, Critical

    public StockLevelResponse() {
    }

    public StockLevelResponse(String skuId, String productName, String category, 
                             Long stock, Long minStock, Long maxStock, 
                             String warehouse, String status) {
        this.skuId = skuId;
        this.productName = productName;
        this.category = category;
        this.stock = stock;
        this.minStock = minStock;
        this.maxStock = maxStock;
        this.warehouse = warehouse;
        this.status = status;
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

    public Long getStock() {
        return stock;
    }

    public void setStock(Long stock) {
        this.stock = stock;
    }

    public Long getMinStock() {
        return minStock;
    }

    public void setMinStock(Long minStock) {
        this.minStock = minStock;
    }

    public Long getMaxStock() {
        return maxStock;
    }

    public void setMaxStock(Long maxStock) {
        this.maxStock = maxStock;
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
