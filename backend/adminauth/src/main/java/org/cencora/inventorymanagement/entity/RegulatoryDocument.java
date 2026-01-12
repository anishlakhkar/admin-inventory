package org.cencora.inventorymanagement.entity;

import org.cencora.inventorymanagement.enums.DocumentStatus;
import org.cencora.inventorymanagement.enums.DocumentType;
import org.cencora.inventorymanagement.enums.ExpiryStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "regulatory_document")
public class RegulatoryDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "supplier_id", length = 50)
    private String supplierId;
    
    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType documentType;
    
    @Column(name = "document_number", length = 100)
    private String documentNumber;
    
    @Column(name = "document_file_url", length = 500)
    private String documentFileUrl;
    
    @Column(name = "file_type", length = 10)
    private String fileType = "PDF";
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "upload_date", nullable = false)
    private LocalDate uploadDate;
    
    @Column(name = "issue_date")
    private LocalDate issueDate;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "validation_score")
    private Integer validationScore;
    
    @Column(name = "validation_issues", columnDefinition = "TEXT")
    private String validationIssues; // JSON array as string
    
    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;
    
    @Column(name = "keyword_matches")
    private Integer keywordMatches = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "expiry_status", length = 20)
    private ExpiryStatus expiryStatus = ExpiryStatus.NOT_FOUND;
    
    @Column(name = "days_until_expiry")
    private Integer daysUntilExpiry;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING_REVIEW;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "verified_by", length = 100)
    private String verifiedBy;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "issuing_authority", length = 255)
    private String issuingAuthority;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (uploadDate == null) {
            uploadDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public RegulatoryDocument() {
    }
    
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
    
    public String getValidationIssues() {
        return validationIssues;
    }
    
    public void setValidationIssues(String validationIssues) {
        this.validationIssues = validationIssues;
    }
    
    public String getExtractedText() {
        return extractedText;
    }
    
    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
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
