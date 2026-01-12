package org.cencora.inventorymanagement.dto;

import org.cencora.inventorymanagement.enums.DocumentStatus;
import org.cencora.inventorymanagement.enums.DocumentType;
import org.cencora.inventorymanagement.enums.ExpiryStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RegulatoryDocumentResponse {
    private Long id;
    private String supplierId;
    private String companyName;
    private DocumentType documentType;
    private String documentNumber;
    private String documentFileUrl;
    private String fileType;
    private Long fileSize;
    private LocalDate uploadDate;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private Integer validationScore;
    private List<String> validationIssues;
    private Integer keywordMatches;
    private ExpiryStatus expiryStatus;
    private Integer daysUntilExpiry;
    private DocumentStatus status;
    private String rejectionReason;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private String issuingAuthority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSupplierId() {
        return supplierId;
    }
    
    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public DocumentType getDocumentType() {
        return documentType;
    }
    
    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }
    
    public String getDocumentNumber() {
        return documentNumber;
    }
    
    public void setDocumentNumber(String documentNumber) {
        this.documentNumber = documentNumber;
    }
    
    public String getDocumentFileUrl() {
        return documentFileUrl;
    }
    
    public void setDocumentFileUrl(String documentFileUrl) {
        this.documentFileUrl = documentFileUrl;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public LocalDate getUploadDate() {
        return uploadDate;
    }
    
    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }
    
    public LocalDate getIssueDate() {
        return issueDate;
    }
    
    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }
    
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public Integer getValidationScore() {
        return validationScore;
    }
    
    public void setValidationScore(Integer validationScore) {
        this.validationScore = validationScore;
    }
    
    public List<String> getValidationIssues() {
        return validationIssues;
    }
    
    public void setValidationIssues(List<String> validationIssues) {
        this.validationIssues = validationIssues;
    }
    
    public Integer getKeywordMatches() {
        return keywordMatches;
    }
    
    public void setKeywordMatches(Integer keywordMatches) {
        this.keywordMatches = keywordMatches;
    }
    
    public ExpiryStatus getExpiryStatus() {
        return expiryStatus;
    }
    
    public void setExpiryStatus(ExpiryStatus expiryStatus) {
        this.expiryStatus = expiryStatus;
    }
    
    public Integer getDaysUntilExpiry() {
        return daysUntilExpiry;
    }
    
    public void setDaysUntilExpiry(Integer daysUntilExpiry) {
        this.daysUntilExpiry = daysUntilExpiry;
    }
    
    public DocumentStatus getStatus() {
        return status;
    }
    
    public void setStatus(DocumentStatus status) {
        this.status = status;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public String getVerifiedBy() {
        return verifiedBy;
    }
    
    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
    
    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }
    
    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
    
    public String getIssuingAuthority() {
        return issuingAuthority;
    }
    
    public void setIssuingAuthority(String issuingAuthority) {
        this.issuingAuthority = issuingAuthority;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
