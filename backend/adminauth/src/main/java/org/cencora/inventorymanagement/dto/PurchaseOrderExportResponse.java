package org.cencora.inventorymanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderExportResponse {
    
    private String reportName;
    private String generatedDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private Long totalPurchaseOrders;
    private BigDecimal totalAmount;
    private Long pendingCount;
    private Long approvedCount;
    private Long rejectedCount;
    private List<PurchaseOrderItem> items;
    
    public PurchaseOrderExportResponse() {
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
    
    public Long getTotalPurchaseOrders() {
        return totalPurchaseOrders;
    }
    
    public void setTotalPurchaseOrders(Long totalPurchaseOrders) {
        this.totalPurchaseOrders = totalPurchaseOrders;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Long getPendingCount() {
        return pendingCount;
    }
    
    public void setPendingCount(Long pendingCount) {
        this.pendingCount = pendingCount;
    }
    
    public Long getApprovedCount() {
        return approvedCount;
    }
    
    public void setApprovedCount(Long approvedCount) {
        this.approvedCount = approvedCount;
    }
    
    public Long getRejectedCount() {
        return rejectedCount;
    }
    
    public void setRejectedCount(Long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
    
    public List<PurchaseOrderItem> getItems() {
        return items;
    }
    
    public void setItems(List<PurchaseOrderItem> items) {
        this.items = items;
    }
    
    // Inner class for purchase order items
    public static class PurchaseOrderItem {
        private Long poId;
        private String poNumber;
        private Long orderId;
        private String status;
        private BigDecimal totalAmount;
        private String comments;
        private String approvedRejectedBy;
        private LocalDateTime createdAt;
        private LocalDateTime approvedRejectedAt;
        private LocalDateTime updatedAt;
        
        public PurchaseOrderItem() {
        }
        
        public PurchaseOrderItem(Long poId, String poNumber, Long orderId, String status,
                                BigDecimal totalAmount, String comments, String approvedRejectedBy,
                                LocalDateTime createdAt, LocalDateTime approvedRejectedAt, LocalDateTime updatedAt) {
            this.poId = poId;
            this.poNumber = poNumber;
            this.orderId = orderId;
            this.status = status;
            this.totalAmount = totalAmount;
            this.comments = comments;
            this.approvedRejectedBy = approvedRejectedBy;
            this.createdAt = createdAt;
            this.approvedRejectedAt = approvedRejectedAt;
            this.updatedAt = updatedAt;
        }
        
        // Getters and Setters
        public Long getPoId() {
            return poId;
        }
        
        public void setPoId(Long poId) {
            this.poId = poId;
        }
        
        public String getPoNumber() {
            return poNumber;
        }
        
        public void setPoNumber(String poNumber) {
            this.poNumber = poNumber;
        }
        
        public Long getOrderId() {
            return orderId;
        }
        
        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public BigDecimal getTotalAmount() {
            return totalAmount;
        }
        
        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }
        
        public String getComments() {
            return comments;
        }
        
        public void setComments(String comments) {
            this.comments = comments;
        }
        
        public String getApprovedRejectedBy() {
            return approvedRejectedBy;
        }
        
        public void setApprovedRejectedBy(String approvedRejectedBy) {
            this.approvedRejectedBy = approvedRejectedBy;
        }
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
        
        public LocalDateTime getApprovedRejectedAt() {
            return approvedRejectedAt;
        }
        
        public void setApprovedRejectedAt(LocalDateTime approvedRejectedAt) {
            this.approvedRejectedAt = approvedRejectedAt;
        }
        
        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }
        
        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
}
