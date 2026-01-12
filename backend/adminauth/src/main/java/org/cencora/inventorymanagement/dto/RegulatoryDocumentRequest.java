package org.cencora.inventorymanagement.dto;

import org.cencora.inventorymanagement.enums.DocumentType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class RegulatoryDocumentRequest {
    
    @Size(max = 50, message = "Supplier ID must not exceed 50 characters")
    private String supplierId;
    
    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String companyName;
    
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    @Size(max = 100, message = "Document number must not exceed 100 characters")
    private String documentNumber;
    
    @Size(max = 500, message = "Document file URL must not exceed 500 characters")
    private String documentFileUrl;
    
    @Size(max = 10, message = "File type must not exceed 10 characters")
    private String fileType = "PDF";
    
    private Long fileSize;
    
    private LocalDate uploadDate;
    
    private LocalDate issueDate;
    
    private LocalDate expiryDate;
    
    @Size(max = 255, message = "Issuing authority must not exceed 255 characters")
    private String issuingAuthority;
    
    // Optional: For manual text entry (for testing keyword matching)
    private String extractedText;
    
    // Getters and Setters
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
    
    public String getIssuingAuthority() {
        return issuingAuthority;
    }
    
    public void setIssuingAuthority(String issuingAuthority) {
        this.issuingAuthority = issuingAuthority;
    }
    
    public String getExtractedText() {
        return extractedText;
    }
    
    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
}
