package org.cencora.inventorymanagement.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class ExportRequest {
    
    @NotBlank(message = "Export type is required")
    private String exportType; // "full-inventory", "low-stock", "expiry-data", "purchase-orders"
    
    // Date range is optional - if not provided, all data will be exported
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @NotBlank(message = "Output format is required")
    private String format; // "pdf", "xlsx", "csv"
    
    private String warehouseId; // Optional: filter by warehouse
    
    public ExportRequest() {
    }
    
    public ExportRequest(String exportType, LocalDate startDate, LocalDate endDate, String format) {
        this.exportType = exportType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.format = format;
    }
    
    // Getters and Setters
    public String getExportType() {
        return exportType;
    }
    
    public void setExportType(String exportType) {
        this.exportType = exportType;
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
    
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
}
