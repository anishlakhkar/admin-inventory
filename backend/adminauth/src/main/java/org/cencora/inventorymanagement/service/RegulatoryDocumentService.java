package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.RegulatoryDocumentRequest;
import org.cencora.inventorymanagement.dto.RegulatoryDocumentResponse;
import org.cencora.inventorymanagement.entity.RegulatoryDocument;
import org.cencora.inventorymanagement.enums.DocumentStatus;
import org.cencora.inventorymanagement.enums.DocumentType;
import org.cencora.inventorymanagement.enums.ExpiryStatus;
import org.cencora.inventorymanagement.repository.RegulatoryDocumentRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class RegulatoryDocumentService {
    
    @Inject
    RegulatoryDocumentRepository documentRepository;
    
    // Keyword sets for each document type (30% weight)
    private static final Map<DocumentType, List<String>> DOCUMENT_KEYWORDS = Map.of(
        DocumentType.BUSINESS_LICENSE, Arrays.asList(
            "business license", "registration number", "trade license", 
            "issued by", "valid until", "business registration", "license number"
        ),
        DocumentType.PHARMACEUTICAL_LICENSE, Arrays.asList(
            "pharmaceutical", "drug license", "fda", "drug control authority",
            "pharmacy license", "regulatory", "pharmaceutical license"
        ),
        DocumentType.TAX_CERTIFICATE, Arrays.asList(
            "tax", "gst", "vat", "tax registration", "tin", 
            "tax identification number", "validity", "tax certificate"
        ),
        DocumentType.GMP_CERTIFICATE, Arrays.asList(
            "gmp", "good manufacturing practice", "quality", "certification",
            "iso", "manufacturing standards", "gmp certificate"
        ),
        DocumentType.INSURANCE_CERTIFICATE, Arrays.asList(
            "insurance", "policy number", "coverage", "insured", 
            "liability", "premium", "valid from", "insurance certificate"
        ),
        DocumentType.QUALITY_CERTIFICATION, Arrays.asList(
            "iso", "quality", "certification", "standard", "iso 9001",
            "iso 13485", "quality management", "quality certification"
        )
    );
    
    public List<RegulatoryDocumentResponse> getAllDocuments() {
        return documentRepository.listAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public List<RegulatoryDocumentResponse> getDocumentsByStatus(DocumentStatus status) {
        return documentRepository.findByStatus(status).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    public RegulatoryDocumentResponse getDocumentById(Long id) {
        RegulatoryDocument document = documentRepository.findById(id);
        if (document == null) {
            throw new NotFoundException("Document not found with id: " + id);
        }
        return toResponse(document);
    }
    
    @Transactional
    public RegulatoryDocumentResponse createDocument(RegulatoryDocumentRequest request) {
        RegulatoryDocument document = new RegulatoryDocument();
        
        // Set basic fields
        document.setSupplierId(request.getSupplierId());
        document.setCompanyName(request.getCompanyName());
        document.setDocumentType(request.getDocumentType());
        document.setDocumentNumber(request.getDocumentNumber());
        document.setDocumentFileUrl(request.getDocumentFileUrl());
        document.setFileType(request.getFileType() != null ? request.getFileType() : "PDF");
        document.setFileSize(request.getFileSize());
        document.setUploadDate(request.getUploadDate() != null ? request.getUploadDate() : LocalDate.now());
        document.setIssueDate(request.getIssueDate());
        document.setExpiryDate(request.getExpiryDate());
        document.setIssuingAuthority(request.getIssuingAuthority());
        document.setStatus(DocumentStatus.PENDING_REVIEW);
        
        // Set extracted text (from manual entry or will be from OCR later)
        String extractedText = request.getExtractedText();
        if (extractedText == null || extractedText.trim().isEmpty()) {
            // If no text provided, create a basic text from available fields
            extractedText = buildTextFromFields(request);
        }
        document.setExtractedText(extractedText);
        
        // Run validation scoring
        ValidationResult validationResult = calculateValidationScore(
            request.getDocumentType(),
            extractedText,
            request.getExpiryDate(),
            request.getCompanyName(),
            request.getDocumentNumber(),
            request.getIssueDate(),
            request.getIssuingAuthority()
        );
        
        // Set validation results
        document.setValidationScore(validationResult.score);
        document.setValidationIssues(validationResult.issuesJson);
        document.setKeywordMatches(validationResult.keywordMatches);
        document.setExpiryStatus(validationResult.expiryStatus);
        document.setDaysUntilExpiry(validationResult.daysUntilExpiry);
        
        // Auto-verify if score is high enough
        if (validationResult.score >= 90) {
            document.setStatus(DocumentStatus.AUTO_VERIFIED);
            document.setVerifiedBy("System");
            document.setVerifiedAt(LocalDateTime.now());
        } else if (validationResult.expiryStatus == ExpiryStatus.EXPIRING_SOON) {
            document.setStatus(DocumentStatus.EXPIRING_SOON);
        }
        
        documentRepository.persist(document);
        return toResponse(document);
    }
    
    @Transactional
    public RegulatoryDocumentResponse verifyDocument(Long id, String verifiedBy) {
        RegulatoryDocument document = documentRepository.findById(id);
        if (document == null) {
            throw new NotFoundException("Document not found with id: " + id);
        }
        
        document.setStatus(DocumentStatus.VERIFIED);
        document.setVerifiedBy(verifiedBy);
        document.setVerifiedAt(LocalDateTime.now());
        document.setRejectionReason(null);
        
        documentRepository.persist(document);
        return toResponse(document);
    }
    
    @Transactional
    public RegulatoryDocumentResponse rejectDocument(Long id, String rejectionReason, String rejectedBy) {
        RegulatoryDocument document = documentRepository.findById(id);
        if (document == null) {
            throw new NotFoundException("Document not found with id: " + id);
        }
        
        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionReason(rejectionReason);
        document.setVerifiedBy(rejectedBy);
        document.setVerifiedAt(LocalDateTime.now());
        
        documentRepository.persist(document);
        return toResponse(document);
    }
    
    @Transactional
    public List<RegulatoryDocumentResponse> runAutoVerification(Integer threshold) {
        List<RegulatoryDocument> pendingDocs = documentRepository.findByStatus(DocumentStatus.PENDING_REVIEW);
        List<RegulatoryDocumentResponse> verified = new ArrayList<>();
        
        for (RegulatoryDocument doc : pendingDocs) {
            if (doc.getValidationScore() != null && doc.getValidationScore() >= threshold) {
                doc.setStatus(DocumentStatus.AUTO_VERIFIED);
                doc.setVerifiedBy("System");
                doc.setVerifiedAt(LocalDateTime.now());
                documentRepository.persist(doc);
                verified.add(toResponse(doc));
            }
        }
        
        return verified;
    }
    
    @Transactional
    public List<RegulatoryDocumentResponse> runExpiryCheck(Integer alertDays) {
        LocalDate today = LocalDate.now();
        LocalDate alertDate = today.plusDays(alertDays);
        
        List<RegulatoryDocument> expiringDocs = documentRepository.findExpiringSoon(today, alertDate);
        List<RegulatoryDocumentResponse> updated = new ArrayList<>();
        
        for (RegulatoryDocument doc : expiringDocs) {
            if (doc.getStatus() != DocumentStatus.EXPIRING_SOON && 
                doc.getStatus() != DocumentStatus.REJECTED) {
                doc.setStatus(DocumentStatus.EXPIRING_SOON);
                documentRepository.persist(doc);
                updated.add(toResponse(doc));
            }
        }
        
        return updated;
    }
    
    @Transactional
    public void deleteDocument(Long id) {
        RegulatoryDocument document = documentRepository.findById(id);
        if (document == null) {
            throw new NotFoundException("Document not found with id: " + id);
        }
        documentRepository.delete(document);
    }
    
    // Validation Scoring Logic
    private ValidationResult calculateValidationScore(
            DocumentType documentType,
            String extractedText,
            LocalDate expiryDate,
            String companyName,
            String documentNumber,
            LocalDate issueDate,
            String issuingAuthority) {
        
        ValidationResult result = new ValidationResult();
        List<String> issues = new ArrayList<>();
        int totalScore = 0;
        
        // 1. Keyword Matching (30% weight = 30 points)
        int keywordScore = calculateKeywordScore(documentType, extractedText);
        totalScore += keywordScore;
        result.keywordMatches = countKeywordMatches(documentType, extractedText);
        
        // 2. Expiry Date Validation (30% weight = 30 points)
        int expiryScore = calculateExpiryScore(expiryDate, result);
        totalScore += expiryScore;
        
        // 3. Required Fields Check (25% weight = 25 points)
        int fieldsScore = calculateFieldsScore(companyName, documentNumber, issueDate, issuingAuthority, issues);
        totalScore += fieldsScore;
        
        // 4. Format Validation (10% weight = 10 points)
        int formatScore = calculateFormatScore(extractedText, issues);
        totalScore += formatScore;
        
        // 5. Quality Score (5% weight = 5 points)
        int qualityScore = calculateQualityScore(extractedText, issues);
        totalScore += qualityScore;
        
        // Ensure score is between 0-100
        result.score = Math.max(0, Math.min(100, totalScore));
        result.issues = issues;
        result.issuesJson = String.join(", ", issues);
        
        return result;
    }
    
    private int calculateKeywordScore(DocumentType documentType, String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        
        List<String> keywords = DOCUMENT_KEYWORDS.get(documentType);
        if (keywords == null || keywords.isEmpty()) {
            return 15; // Default score if no keywords defined
        }
        
        String lowerText = text.toLowerCase();
        int matches = 0;
        
        for (String keyword : keywords) {
            if (lowerText.contains(keyword.toLowerCase())) {
                matches++;
            }
        }
        
        // Calculate score: (matches / total_keywords) * 30
        double matchRatio = (double) matches / keywords.size();
        return (int) Math.round(matchRatio * 30);
    }
    
    private int countKeywordMatches(DocumentType documentType, String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        
        List<String> keywords = DOCUMENT_KEYWORDS.get(documentType);
        if (keywords == null) {
            return 0;
        }
        
        String lowerText = text.toLowerCase();
        int matches = 0;
        
        for (String keyword : keywords) {
            if (lowerText.contains(keyword.toLowerCase())) {
                matches++;
            }
        }
        
        return matches;
    }
    
    private int calculateExpiryScore(LocalDate expiryDate, ValidationResult result) {
        if (expiryDate == null) {
            result.expiryStatus = ExpiryStatus.NOT_FOUND;
            result.daysUntilExpiry = null;
            return 0; // No expiry date found
        }
        
        LocalDate today = LocalDate.now();
        long daysUntil = ChronoUnit.DAYS.between(today, expiryDate);
        result.daysUntilExpiry = (int) daysUntil;
        
        if (daysUntil < 0) {
            result.expiryStatus = ExpiryStatus.EXPIRED;
            return 10; // Expired but date exists
        } else if (daysUntil <= 30) {
            result.expiryStatus = ExpiryStatus.EXPIRING_SOON;
            return 20; // Expiring soon
        } else if (daysUntil <= 90) {
            result.expiryStatus = ExpiryStatus.VALID;
            return 25; // Valid but expiring in 3 months
        } else {
            result.expiryStatus = ExpiryStatus.VALID;
            return 30; // Valid for more than 3 months
        }
    }
    
    private int calculateFieldsScore(String companyName, String documentNumber, 
                                    LocalDate issueDate, String issuingAuthority, 
                                    List<String> issues) {
        int score = 0;
        
        if (companyName != null && !companyName.trim().isEmpty()) {
            score += 10;
        } else {
            issues.add("Company name missing");
        }
        
        if (documentNumber != null && !documentNumber.trim().isEmpty()) {
            score += 5;
        } else {
            issues.add("Document number missing");
        }
        
        if (issueDate != null) {
            score += 5;
        } else {
            issues.add("Issue date missing");
        }
        
        if (issuingAuthority != null && !issuingAuthority.trim().isEmpty()) {
            score += 5;
        } else {
            issues.add("Issuing authority missing");
        }
        
        return score;
    }
    
    private int calculateFormatScore(String text, List<String> issues) {
        int score = 10; // Default full score
        
        if (text == null || text.trim().isEmpty()) {
            issues.add("No extractable text found");
            return 0;
        }
        
        // Check if text is too short (might be corrupted)
        if (text.length() < 50) {
            issues.add("Text content too short");
            score -= 5;
        }
        
        return score;
    }
    
    private int calculateQualityScore(String text, List<String> issues) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        
        // Basic quality checks
        // Check for common document indicators
        boolean hasNumbers = text.matches(".*\\d+.*");
        boolean hasLetters = text.matches(".*[a-zA-Z]+.*");
        
        if (hasNumbers && hasLetters) {
            return 5; // Good quality
        } else if (hasLetters) {
            return 3; // Moderate quality
        } else {
            issues.add("Low quality text extraction");
            return 1;
        }
    }
    
    private String buildTextFromFields(RegulatoryDocumentRequest request) {
        StringBuilder text = new StringBuilder();
        
        if (request.getCompanyName() != null) {
            text.append(request.getCompanyName()).append(" ");
        }
        if (request.getDocumentNumber() != null) {
            text.append("Document Number: ").append(request.getDocumentNumber()).append(" ");
        }
        if (request.getIssuingAuthority() != null) {
            text.append("Issued by: ").append(request.getIssuingAuthority()).append(" ");
        }
        if (request.getIssueDate() != null) {
            text.append("Issue Date: ").append(request.getIssueDate()).append(" ");
        }
        if (request.getExpiryDate() != null) {
            text.append("Expiry Date: ").append(request.getExpiryDate()).append(" ");
        }
        
        // Add document type keywords to help with matching
        List<String> keywords = DOCUMENT_KEYWORDS.get(request.getDocumentType());
        if (keywords != null && !keywords.isEmpty()) {
            text.append(String.join(" ", keywords.subList(0, Math.min(3, keywords.size()))));
        }
        
        return text.toString();
    }
    
    private RegulatoryDocumentResponse toResponse(RegulatoryDocument document) {
        RegulatoryDocumentResponse response = new RegulatoryDocumentResponse();
        response.setId(document.getId());
        response.setSupplierId(document.getSupplierId());
        response.setCompanyName(document.getCompanyName());
        response.setDocumentType(document.getDocumentType());
        response.setDocumentNumber(document.getDocumentNumber());
        response.setDocumentFileUrl(document.getDocumentFileUrl());
        response.setFileType(document.getFileType());
        response.setFileSize(document.getFileSize());
        response.setUploadDate(document.getUploadDate());
        response.setIssueDate(document.getIssueDate());
        response.setExpiryDate(document.getExpiryDate());
        response.setValidationScore(document.getValidationScore());
        response.setKeywordMatches(document.getKeywordMatches());
        response.setExpiryStatus(document.getExpiryStatus());
        response.setDaysUntilExpiry(document.getDaysUntilExpiry());
        response.setStatus(document.getStatus());
        response.setRejectionReason(document.getRejectionReason());
        response.setVerifiedBy(document.getVerifiedBy());
        response.setVerifiedAt(document.getVerifiedAt());
        response.setIssuingAuthority(document.getIssuingAuthority());
        response.setCreatedAt(document.getCreatedAt());
        response.setUpdatedAt(document.getUpdatedAt());
        
        // Parse validation issues from JSON string
        if (document.getValidationIssues() != null && !document.getValidationIssues().trim().isEmpty()) {
            List<String> issues = Arrays.asList(document.getValidationIssues().split(",\\s*"));
            response.setValidationIssues(issues);
        } else {
            response.setValidationIssues(new ArrayList<>());
        }
        
        return response;
    }
    
    // Helper class for validation results
    private static class ValidationResult {
        int score = 0;
        List<String> issues = new ArrayList<>();
        String issuesJson = "";
        int keywordMatches = 0;
        ExpiryStatus expiryStatus = ExpiryStatus.NOT_FOUND;
        Integer daysUntilExpiry = null;
    }
}
