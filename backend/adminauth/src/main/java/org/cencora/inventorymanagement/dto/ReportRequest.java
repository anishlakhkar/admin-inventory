package org.cencora.inventorymanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReportRequest {
    
    @NotBlank(message = "Report type is required")
    private String reportType; // "inventory-valuation" or "low-stock"
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotBlank(message = "Output format is required")
    private String format; // "pdf", "xlsx", "csv"
    
    public ReportRequest() {
    }
    
    public ReportRequest(String reportType, LocalDate startDate, LocalDate endDate, String format) {
        this.reportType = reportType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.format = format;
    }
    
    // Getters and Setters
    public String getReportType() {
        return reportType;
    }
    
    public void setReportType(String reportType) {
        this.reportType = reportType;
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
}
