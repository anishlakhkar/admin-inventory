package org.cencora.inventorymanagement.dto;

import java.time.LocalDate;

public class RecentReportResponse {
    
    private Long id;
    private String reportName;
    private String reportType;
    private LocalDate generatedDate;
    private String format;
    private String size;
    private String downloadUrl;
    
    public RecentReportResponse() {
    }
    
    public RecentReportResponse(Long id, String reportName, String reportType, 
                               LocalDate generatedDate, String format, String size, String downloadUrl) {
        this.id = id;
        this.reportName = reportName;
        this.reportType = reportType;
        this.generatedDate = generatedDate;
        this.format = format;
        this.size = size;
        this.downloadUrl = downloadUrl;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getReportName() {
        return reportName;
    }
    
    public void setReportName(String reportName) {
        this.reportName = reportName;
    }
    
    public String getReportType() {
        return reportType;
    }
    
    public void setReportType(String reportType) {
        this.reportType = reportType;
    }
    
    public LocalDate getGeneratedDate() {
        return generatedDate;
    }
    
    public void setGeneratedDate(LocalDate generatedDate) {
        this.generatedDate = generatedDate;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public String getSize() {
        return size;
    }
    
    public void setSize(String size) {
        this.size = size;
    }
    
    public String getDownloadUrl() {
        return downloadUrl;
    }
    
    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
