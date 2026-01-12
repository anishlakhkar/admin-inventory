package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.entity.Warehouse;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;

@ApplicationScoped
public class StartupService {
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    @Transactional
    void onStart(@Observes StartupEvent ev) {
        // Initialize warehouses if they don't exist
        initializeWarehouses();
    }
    
    private void initializeWarehouses() {
        // Warehouse 001 - New York (example location)
        if (warehouseRepository.findByWarehouseId("001").isEmpty()) {
            Warehouse wh001 = new Warehouse();
            wh001.setWarehouseId("001");
            wh001.setUsername("warehouse001");
            wh001.setPassword("warehouse001"); // In production, this should be hashed
            wh001.setLatitude(new BigDecimal("40.7128"));
            wh001.setLongitude(new BigDecimal("-74.0060"));
            wh001.setLocationPinCode("10001");
            wh001.setTotalZone(3); // 3 storage types: AMBIENT, FROZEN, REFRIGERATED
            warehouseRepository.persist(wh001);
        }
        
        // Warehouse 002 - Los Angeles (example location)
        if (warehouseRepository.findByWarehouseId("002").isEmpty()) {
            Warehouse wh002 = new Warehouse();
            wh002.setWarehouseId("002");
            wh002.setUsername("warehouse002");
            wh002.setPassword("warehouse002");
            wh002.setLatitude(new BigDecimal("34.0522"));
            wh002.setLongitude(new BigDecimal("-118.2437"));
            wh002.setLocationPinCode("90001");
            wh002.setTotalZone(3);
            warehouseRepository.persist(wh002);
        }
        
        // Warehouse 003 - Chicago (example location)
        if (warehouseRepository.findByWarehouseId("003").isEmpty()) {
            Warehouse wh003 = new Warehouse();
            wh003.setWarehouseId("003");
            wh003.setUsername("warehouse003");
            wh003.setPassword("warehouse003");
            wh003.setLatitude(new BigDecimal("41.8781"));
            wh003.setLongitude(new BigDecimal("-87.6298"));
            wh003.setLocationPinCode("60601");
            wh003.setTotalZone(3);
            warehouseRepository.persist(wh003);
        }
        
        // Warehouse 004 - Houston (example location)
        if (warehouseRepository.findByWarehouseId("004").isEmpty()) {
            Warehouse wh004 = new Warehouse();
            wh004.setWarehouseId("004");
            wh004.setUsername("warehouse004");
            wh004.setPassword("warehouse004");
            wh004.setLatitude(new BigDecimal("29.7604"));
            wh004.setLongitude(new BigDecimal("-95.3698"));
            wh004.setLocationPinCode("77001");
            wh004.setTotalZone(3);
            warehouseRepository.persist(wh004);
        }
    }
}
