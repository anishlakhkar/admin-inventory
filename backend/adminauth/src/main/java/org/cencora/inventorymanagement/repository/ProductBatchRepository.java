package org.cencora.inventorymanagement.repository;

import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.enums.PersonaType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductBatchRepository implements PanacheRepository<ProductBatch> {
    
    public Optional<ProductBatch> findByBatchIdAndWarehouseId(String batchId, String warehouseId) {
        return find("batchId = ?1 AND warehouseId = ?2", batchId, warehouseId).firstResultOptional();
    }
    
    public List<ProductBatch> findBySkuIdAndWarehouseId(String skuId, String warehouseId) {
        return find("skuId = ?1 AND warehouseId = ?2 ORDER BY expiry ASC", skuId, warehouseId).list();
    }
    
    public List<ProductBatch> findByWarehouseId(String warehouseId) {
        return find("warehouseId", warehouseId).list();
    }
    
    public List<ProductBatch> findExpiringSoon(String warehouseId, LocalDate expiryDate) {
        return find("warehouseId = ?1 AND expiry <= ?2 AND expiry >= CURRENT_DATE ORDER BY expiry ASC", 
                   warehouseId, expiryDate).list();
    }
    
    public List<ProductBatch> findLowStockBatches(String warehouseId, String skuId, Long threshold) {
        return find("warehouseId = ?1 AND skuId = ?2 AND quantity <= ?3 ORDER BY expiry ASC", 
                   warehouseId, skuId, threshold).list();
    }
    
    // Find batches by persona type
    public List<ProductBatch> findByPersonaType(String warehouseId, PersonaType personaType) {
        // B2B can access: B2B and BOTH batches
        // B2C can access: B2C and BOTH batches
        if (personaType == PersonaType.B2B) {
            return find("warehouseId = ?1 AND (personaType = ?2 OR personaType = ?3) ORDER BY expiry ASC", 
                       warehouseId, PersonaType.B2B, PersonaType.BOTH).list();
        } else if (personaType == PersonaType.B2C) {
            return find("warehouseId = ?1 AND (personaType = ?2 OR personaType = ?3) ORDER BY expiry ASC", 
                       warehouseId, PersonaType.B2C, PersonaType.BOTH).list();
        } else {
            return findByWarehouseId(warehouseId);
        }
    }
    
    // Find batches by SKU and persona type
    public List<ProductBatch> findBySkuIdAndPersonaType(String skuId, String warehouseId, PersonaType personaType) {
        if (personaType == PersonaType.B2B) {
            return find("skuId = ?1 AND warehouseId = ?2 AND (personaType = ?3 OR personaType = ?4) ORDER BY expiry ASC", 
                       skuId, warehouseId, PersonaType.B2B, PersonaType.BOTH).list();
        } else if (personaType == PersonaType.B2C) {
            return find("skuId = ?1 AND warehouseId = ?2 AND (personaType = ?3 OR personaType = ?4) ORDER BY expiry ASC", 
                       skuId, warehouseId, PersonaType.B2C, PersonaType.BOTH).list();
        } else {
            return findBySkuIdAndWarehouseId(skuId, warehouseId);
        }
    }
}
