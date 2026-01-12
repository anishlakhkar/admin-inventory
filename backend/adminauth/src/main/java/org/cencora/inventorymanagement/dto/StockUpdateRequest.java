package org.cencora.inventorymanagement.dto;

import jakarta.validation.constraints.*;

public class StockUpdateRequest {
    
    @NotBlank(message = "Warehouse ID is required")
    @Size(max = 10, message = "Warehouse ID must not exceed 10 characters")
    private String warehouseId;
    
    @NotBlank(message = "SKU ID is required")
    @Size(max = 50, message = "SKU ID must not exceed 50 characters")
    private String skuId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be 0 or greater")
    private Long quantity;
    
    // Getters and Setters
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public String getSkuId() {
        return skuId;
    }
    
    public void setSkuId(String skuId) {
        this.skuId = skuId;
    }
    
    public Long getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Long quantity) {
        this.quantity = quantity;
    }
}
