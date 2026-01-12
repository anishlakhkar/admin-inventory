package org.cencora.inventorymanagement.repository;

import org.cencora.inventorymanagement.entity.Warehouse;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class WarehouseRepository implements PanacheRepository<Warehouse> {
    
    public Optional<Warehouse> findByWarehouseId(String warehouseId) {
        return find("warehouseId", warehouseId).firstResultOptional();
    }
    
    public Optional<Warehouse> findByUsername(String username) {
        return find("username", username).firstResultOptional();
    }
}
