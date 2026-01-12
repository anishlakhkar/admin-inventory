package org.cencora.inventorymanagement.repository;

import org.cencora.inventorymanagement.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductRepository implements PanacheRepository<Product> {
    
    public Optional<Product> findBySkuIdAndWarehouseId(String skuId, String warehouseId) {
        return find("skuId = ?1 AND warehouseId = ?2", skuId, warehouseId).firstResultOptional();
    }
    
    public List<Product> findByWarehouseId(String warehouseId) {
        return find("warehouseId", warehouseId).list();
    }
    
    public List<Product> findByWarehouseIdAndSearch(String warehouseId, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findByWarehouseId(warehouseId);
        }
        String searchPattern = "%" + searchTerm.toLowerCase() + "%";
        return find("warehouseId = ?1 AND (LOWER(productName) LIKE ?2 OR LOWER(skuId) LIKE ?2)", 
                   warehouseId, searchPattern).list();
    }
    
    public long countByWarehouseId(String warehouseId) {
        return count("warehouseId", warehouseId);
    }
}
