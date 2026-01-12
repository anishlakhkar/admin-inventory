package org.cencora.inventorymanagement.dto;

public class LowStockAlertResponse {
    private String skuId;
    private String productName;
    private Long currentStock;
    private Long threshold;
    private String warehouse;
    private Long daysUntilOut; // Estimated days until stock runs out
    private String priority; // Critical, High, Medium

    public LowStockAlertResponse() {
    }

    public LowStockAlertResponse(String skuId, String productName, Long currentStock, 
                                Long threshold, String warehouse, 
                                Long daysUntilOut, String priority) {
        this.skuId = skuId;
        this.productName = productName;
        this.currentStock = currentStock;
        this.threshold = threshold;
        this.warehouse = warehouse;
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

    public String getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
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
