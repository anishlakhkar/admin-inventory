package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.ExpiryTrackingResponse;
import org.cencora.inventorymanagement.dto.LowStockAlertResponse;
import org.cencora.inventorymanagement.dto.StockLevelResponse;
import org.cencora.inventorymanagement.entity.Product;
import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.repository.ProductBatchRepository;
import org.cencora.inventorymanagement.repository.ProductRepository;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class MonitoringService {
    
    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductBatchRepository productBatchRepository;
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    /**
     * Get stock levels for all products with status calculation
     */
    public List<StockLevelResponse> getStockLevels(String warehouseId, String category, String status) {
        List<Product> products;
        
        // Handle "all" warehouses
        if (warehouseId == null || warehouseId.trim().isEmpty() || warehouseId.equalsIgnoreCase("all")) {
            // Get all products from all warehouses
            products = productRepository.listAll();
        } else {
            // Validate warehouse
            warehouseRepository.findByWarehouseId(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
            
            products = productRepository.findByWarehouseId(warehouseId);
        }
        
        return products.stream()
            .filter(p -> category == null || category.equals("all") || p.getCategory().name().equals(category))
            .map(product -> {
                String stockStatus = calculateStockStatus(product);
                
                // Filter by status if provided
                if (status != null && !status.equals("all") && !stockStatus.equals(status)) {
                    return null;
                }
                
                // Calculate max stock (threshold * 5 as a reasonable max)
                Long maxStock = product.getThresholdQuantity() * 5;
                
                return new StockLevelResponse(
                    product.getSkuId(),
                    product.getProductName(),
                    product.getCategory().name(),
                    product.getQuantity(),
                    product.getThresholdQuantity(),
                    maxStock,
                    "Warehouse " + product.getWarehouseId(),
                    stockStatus
                );
            })
            .filter(item -> item != null)
            .collect(Collectors.toList());
    }
    
    /**
     * Get low stock alerts
     */
    public List<LowStockAlertResponse> getLowStockAlerts(String warehouseId, String category) {
        List<Product> products;
        
        // Handle "all" warehouses
        if (warehouseId == null || warehouseId.trim().isEmpty() || warehouseId.equalsIgnoreCase("all")) {
            // Get all products from all warehouses
            products = productRepository.listAll();
        } else {
            // Validate warehouse
            warehouseRepository.findByWarehouseId(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
            
            products = productRepository.findByWarehouseId(warehouseId);
        }
        
        return products.stream()
            .filter(p -> category == null || category.equals("all") || p.getCategory().name().equals(category))
            .filter(product -> product.getQuantity() < product.getThresholdQuantity())
            .map(product -> {
                Long daysUntilOut = calculateDaysUntilOut(product);
                String priority = calculatePriority(product, daysUntilOut);
                
                return new LowStockAlertResponse(
                    product.getSkuId(),
                    product.getProductName(),
                    product.getQuantity(),
                    product.getThresholdQuantity(),
                    "Warehouse " + product.getWarehouseId(),
                    daysUntilOut,
                    priority
                );
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get expiry tracking data
     */
    public List<ExpiryTrackingResponse> getExpiryTracking(String warehouseId, String category, Integer daysFilter) {
        List<ProductBatch> batches;
        
        // Handle "all" warehouses
        if (warehouseId == null || warehouseId.trim().isEmpty() || warehouseId.equalsIgnoreCase("all")) {
            // Get all batches from all warehouses
            batches = productBatchRepository.listAll();
        } else {
            // Validate warehouse
            warehouseRepository.findByWarehouseId(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
            
            batches = productBatchRepository.findByWarehouseId(warehouseId);
        }
        
        LocalDate today = LocalDate.now();
        
        return batches.stream()
            .filter(batch -> {
                // Filter by category if provided
                if (category != null && !category.equals("all")) {
                    Product product = productRepository.findBySkuIdAndWarehouseId(
                        batch.getSkuId(), batch.getWarehouseId()).orElse(null);
                    if (product == null || !product.getCategory().name().equals(category)) {
                        return false;
                    }
                }
                
                // Filter by days if provided
                if (daysFilter != null) {
                    long daysLeft = ChronoUnit.DAYS.between(today, batch.getExpiry());
                    return daysLeft <= daysFilter && daysLeft >= 0;
                }
                
                // Only show batches that haven't expired yet
                return !batch.getExpiry().isBefore(today);
            })
            .map(batch -> {
                Product product = productRepository.findBySkuIdAndWarehouseId(
                    batch.getSkuId(), batch.getWarehouseId()).orElse(null);
                
                if (product == null) {
                    return null;
                }
                
                long daysLeft = ChronoUnit.DAYS.between(today, batch.getExpiry());
                String status = calculateExpiryStatus(daysLeft);
                
                return new ExpiryTrackingResponse(
                    batch.getBatchId(),
                    product.getProductName(),
                    batch.getSkuId(),
                    batch.getExpiry(),
                    batch.getQuantity(),
                    "Warehouse " + batch.getWarehouseId(),
                    daysLeft,
                    status
                );
            })
            .filter(item -> item != null)
            .sorted((a, b) -> Long.compare(a.getDaysLeft(), b.getDaysLeft())) // Sort by days left ascending
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate stock status: Optimal, Below Min, or Critical
     */
    private String calculateStockStatus(Product product) {
        Long quantity = product.getQuantity();
        Long threshold = product.getThresholdQuantity();
        
        if (quantity >= threshold) {
            return "Optimal";
        } else if (quantity >= threshold * 0.5) {
            return "Below Min";
        } else {
            return "Critical";
        }
    }
    
    /**
     * Calculate priority for low stock alerts
     */
    private String calculatePriority(Product product, Long daysUntilOut) {
        Long quantity = product.getQuantity();
        Long threshold = product.getThresholdQuantity();
        double percentage = (double) quantity / threshold;
        
        if (percentage < 0.3 || daysUntilOut <= 7) {
            return "Critical";
        } else if (percentage < 0.6 || daysUntilOut <= 14) {
            return "High";
        } else {
            return "Medium";
        }
    }
    
    /**
     * Calculate estimated days until stock runs out
     * This is a simple estimation - in real scenario, you'd use historical consumption data
     */
    private Long calculateDaysUntilOut(Product product) {
        // Simple estimation: assume average daily consumption based on threshold
        // If stock is below threshold, estimate based on how much below
        Long quantity = product.getQuantity();
        Long threshold = product.getThresholdQuantity();
        
        if (quantity == 0) {
            return 0L;
        }
        
        // Estimate: if stock is 50% of threshold, assume it will last 15 days
        // This is a simplified calculation
        double ratio = (double) quantity / threshold;
        return Math.max(1L, (long) (ratio * 30)); // Rough estimate
    }
    
    /**
     * Calculate expiry status based on days left
     */
    private String calculateExpiryStatus(long daysLeft) {
        if (daysLeft <= 30) {
            return "Critical";
        } else if (daysLeft <= 60) {
            return "Expiring Soon";
        } else if (daysLeft <= 90) {
            return "Monitor";
        } else {
            return "Good";
        }
    }
}
