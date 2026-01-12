package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.PageResponse;
import org.cencora.inventorymanagement.dto.StockResponse;
import org.cencora.inventorymanagement.dto.StockUpdateRequest;
import org.cencora.inventorymanagement.entity.Product;
import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.entity.Warehouse;
import org.cencora.inventorymanagement.entity.Zone;
import org.cencora.inventorymanagement.enums.StorageType;
import org.cencora.inventorymanagement.repository.ProductBatchRepository;
import org.cencora.inventorymanagement.repository.ProductRepository;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import org.cencora.inventorymanagement.repository.ZoneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class StockService {
    
    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductBatchRepository productBatchRepository;
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    @Inject
    ZoneRepository zoneRepository;
    
    public PageResponse<StockResponse> getAllStock(String warehouseId, int page, int size) {
        // Validate warehouse exists
        Warehouse warehouse = warehouseRepository.findByWarehouseId(warehouseId)
            .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
        
        List<Product> products = productRepository.findByWarehouseId(warehouseId);
        
        // Apply pagination
        int totalElements = products.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);
        
        List<Product> pagedProducts = fromIndex < totalElements 
            ? products.subList(fromIndex, toIndex) 
            : List.of();
        
        List<StockResponse> content = pagedProducts.stream()
            .map(product -> toStockResponse(product, warehouse))
            .collect(Collectors.toList());
        
        return new PageResponse<>(content, totalElements, totalPages, size, page);
    }
    
    public StockResponse getStockById(String skuId, String warehouseId) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        Warehouse warehouse = warehouseRepository.findByWarehouseId(warehouseId)
            .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
        
        return toStockResponse(product, warehouse);
    }
    
    public List<StockResponse> getLowStock(String warehouseId, Long threshold) {
        // Validate warehouse exists
        warehouseRepository.findByWarehouseId(warehouseId)
            .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
        
        List<Product> products = productRepository.findByWarehouseId(warehouseId);
        
        return products.stream()
            .filter(product -> {
                if (threshold != null) {
                    return product.getQuantity() <= threshold;
                }
                return product.getQuantity() <= product.getThresholdQuantity();
            })
            .map(product -> {
                Warehouse warehouse = warehouseRepository.findByWarehouseId(warehouseId).orElse(null);
                return toStockResponse(product, warehouse);
            })
            .collect(Collectors.toList());
    }
    
    @Transactional
    public StockResponse updateStock(String skuId, String warehouseId, StockUpdateRequest request) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        Warehouse warehouse = warehouseRepository.findByWarehouseId(warehouseId)
            .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
        
        long oldQuantity = product.getQuantity();
        long newQuantity = request.getQuantity();
        long quantityChange = newQuantity - oldQuantity;
        
        // Update product quantity
        product.setQuantity(newQuantity);
        productRepository.persist(product);
        
        // Update batches - this is a simplified update
        // In a real scenario, you might want to create/update specific batches
        List<ProductBatch> batches = productBatchRepository.findBySkuIdAndWarehouseId(skuId, warehouseId);
        
        // If no batches exist and quantity > 0, create a default batch
        if (batches.isEmpty() && newQuantity > 0) {
            ProductBatch batch = new ProductBatch();
            batch.setBatchId("BATCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            batch.setWarehouseId(warehouseId);
            batch.setSkuId(skuId);
            batch.setExpiry(LocalDate.now().plusMonths(12)); // Default 12 months expiry
            batch.setQuantity(newQuantity);
            productBatchRepository.persist(batch);
        } else if (!batches.isEmpty()) {
            // Update the first batch with the new quantity
            // In a real scenario, you'd want more sophisticated batch management
            ProductBatch firstBatch = batches.get(0);
            firstBatch.setQuantity(newQuantity);
            productBatchRepository.persist(firstBatch);
            
            // Remove other batches if quantity is 0
            if (newQuantity == 0) {
                for (int i = 1; i < batches.size(); i++) {
                    productBatchRepository.delete(batches.get(i));
                }
            }
        }
        
        // Update zone capacity
        updateZoneCapacity(warehouseId, product.getStorageType(), quantityChange);
        
        return toStockResponse(product, warehouse);
    }
    
    private void updateZoneCapacity(String warehouseId, StorageType storageType, long quantityChange) {
        Zone zone = zoneRepository.findByWarehouseIdAndStorageType(warehouseId, storageType)
            .orElse(null);
        
        if (zone != null) {
            int newCapacity = (int) (zone.getCurrentCapacity() + quantityChange);
            if (newCapacity < 0) {
                newCapacity = 0;
            }
            if (newCapacity > zone.getTotalCapacity()) {
                newCapacity = zone.getTotalCapacity();
            }
            zone.setCurrentCapacity(newCapacity);
            zoneRepository.persist(zone);
        }
    }
    
    private StockResponse toStockResponse(Product product, Warehouse warehouse) {
        StockResponse response = new StockResponse();
        response.setSkuId(product.getSkuId());
        response.setWarehouseId(product.getWarehouseId());
        response.setWarehouseName(warehouse != null ? "Warehouse " + warehouse.getWarehouseId() : null);
        response.setProductName(product.getProductName());
        response.setProductSku(product.getSkuId());
        response.setOnHand(product.getQuantity());
        response.setReserved(0L); // Reserved quantity would come from order system
        response.setBlocked(0L); // Blocked quantity would come from quality control
        response.setAvailable(product.getQuantity()); // Available = onHand - reserved - blocked
        
        // Get batch information
        List<ProductBatch> batches = productBatchRepository.findBySkuIdAndWarehouseId(
            product.getSkuId(), product.getWarehouseId());
        
        List<StockResponse.BatchInfo> batchInfos = batches.stream()
            .sorted(Comparator.comparing(ProductBatch::getExpiry))
            .map(batch -> {
                StockResponse.BatchInfo batchInfo = new StockResponse.BatchInfo();
                batchInfo.setBatchId(batch.getBatchId());
                batchInfo.setQuantity(batch.getQuantity());
                batchInfo.setExpiry(batch.getExpiry().toString());
                return batchInfo;
            })
            .collect(Collectors.toList());
        
        response.setBatches(batchInfos);
        
        return response;
    }
}
