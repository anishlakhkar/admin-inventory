package org.cencora.inventorymanagement.repository;

import org.cencora.inventorymanagement.entity.RegulatoryDocument;
import org.cencora.inventorymanagement.enums.DocumentStatus;
import org.cencora.inventorymanagement.enums.DocumentType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class RegulatoryDocumentRepository implements PanacheRepository<RegulatoryDocument> {
    
    public List<RegulatoryDocument> findByStatus(DocumentStatus status) {
        return find("status", status).list();
    }
    
    public List<RegulatoryDocument> findByCompanyName(String companyName) {
        return find("companyName", companyName).list();
    }
    
    public List<RegulatoryDocument> findByDocumentType(DocumentType documentType) {
        return find("documentType", documentType).list();
    }
    
    public List<RegulatoryDocument> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate) {
        return find("expiryDate BETWEEN ?1 AND ?2", startDate, endDate).list();
    }
    
    public List<RegulatoryDocument> findExpiringSoon(LocalDate today, LocalDate alertDate) {
        return find("expiryDate BETWEEN ?1 AND ?2 AND status != ?3", 
                   today, alertDate, DocumentStatus.EXPIRING_SOON).list();
    }
    
    public List<RegulatoryDocument> findByStatusAndScoreGreaterThan(DocumentStatus status, Integer minScore) {
        return find("status = ?1 AND validationScore >= ?2", status, minScore).list();
    }
}
