package org.cencora.inventorymanagement.repository;

import org.cencora.inventorymanagement.entity.Zone;
import org.cencora.inventorymanagement.enums.StorageType;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ZoneRepository implements PanacheRepository<Zone> {
    
    public List<Zone> findByWarehouseId(String warehouseId) {
        return find("warehouseId", warehouseId).list();
    }
    
    public Optional<Zone> findByWarehouseIdAndStorageType(String warehouseId, StorageType storageType) {
        return find("warehouseId = ?1 AND storageType = ?2", warehouseId, storageType).firstResultOptional();
    }
    
    public List<Zone> findByWarehouseIdAndStorageTypeList(String warehouseId, StorageType storageType) {
        return find("warehouseId = ?1 AND storageType = ?2", warehouseId, storageType).list();
    }
}
