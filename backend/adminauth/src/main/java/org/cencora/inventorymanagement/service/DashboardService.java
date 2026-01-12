package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.DashboardResponse;
import org.cencora.inventorymanagement.entity.Product;
import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.enums.Category;
import org.cencora.inventorymanagement.repository.ProductBatchRepository;
import org.cencora.inventorymanagement.repository.ProductRepository;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class DashboardService {
    
    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductBatchRepository productBatchRepository;
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    public DashboardResponse getDashboardData(String warehouseId, String category, String status) {
        List<Product> products;
        List<ProductBatch> batches;
        
        // Handle "all" warehouses
        if (warehouseId == null || warehouseId.trim().isEmpty() || warehouseId.equalsIgnoreCase("all")) {
            // Get all products from all warehouses
            products = productRepository.listAll();
            batches = productBatchRepository.listAll();
        } else {
            // Validate warehouse exists
            warehouseRepository.findByWarehouseId(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
            
            products = productRepository.findByWarehouseId(warehouseId);
            batches = productBatchRepository.findByWarehouseId(warehouseId);
        }
        
        // Apply category filter if provided
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            try {
                Category categoryEnum = Category.valueOf(category.toUpperCase());
                products = products.stream()
                    .filter(p -> p.getCategory() == categoryEnum)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid category, ignore filter
            }
        }
        
        // Apply status filter if provided (filter by stock status)
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            products = products.stream()
                .filter(p -> {
                    String productStatus = determineStockStatus(p);
                    return productStatus.equalsIgnoreCase(status) || 
                           (status.equalsIgnoreCase("in") && productStatus.equals("In Stock")) ||
                           (status.equalsIgnoreCase("low") && productStatus.equals("Low Stock")) ||
                           (status.equalsIgnoreCase("critical") && (productStatus.equals("Critical") || productStatus.equals("Out of Stock")));
                })
                .collect(Collectors.toList());
        }
        
        // Calculate summary cards
        DashboardResponse.SummaryCards summaryCards = calculateSummaryCards(products, batches);
        
        // Get stock data (top 10 products)
        List<DashboardResponse.StockItem> stockData = getStockData(products, warehouseId);
        
        // Get low stock alerts
        List<DashboardResponse.LowStockAlert> lowStockAlerts = getLowStockAlerts(products, warehouseId);
        
        // Get expiry data
        List<DashboardResponse.ExpiryItem> expiryData = getExpiryData(batches, products);
        
        DashboardResponse response = new DashboardResponse();
        response.setSummaryCards(summaryCards);
        response.setStockData(stockData);
        response.setLowStockAlerts(lowStockAlerts);
        response.setExpiryData(expiryData);
        
        return response;
    }
    
    private DashboardResponse.SummaryCards calculateSummaryCards(List<Product> products, List<ProductBatch> batches) {
        // Calculate total stock value
        BigDecimal totalStockValue = products.stream()
            .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Count low stock items (quantity < thresholdQuantity)
        long lowStockItems = products.stream()
            .filter(p -> p.getQuantity() < p.getThresholdQuantity())
            .count();
        
        // Count expiring soon (within next 60 days)
        LocalDate today = LocalDate.now();
        LocalDate expiryThreshold = today.plusDays(60);
        long expiringSoon = batches.stream()
            .filter(b -> !b.getExpiry().isBefore(today) && !b.getExpiry().isAfter(expiryThreshold))
            .count();
        
        // Total products count
        long totalProducts = products.size();
        
        return new DashboardResponse.SummaryCards(
            totalStockValue,
            lowStockItems,
            expiringSoon,
            totalProducts
        );
    }
    
    private List<DashboardResponse.StockItem> getStockData(List<Product> products, String warehouseDisplayName) {
        return products.stream()
            .limit(10) // Top 10 products
            .map(product -> {
                String status = determineStockStatus(product);
                String displayWarehouse = warehouseDisplayName.equals("All Warehouses") 
                    ? "Warehouse " + product.getWarehouseId()
                    : warehouseDisplayName;
                return new DashboardResponse.StockItem(
                    product.getSkuId(),
                    product.getProductName(),
                    product.getQuantity(),
                    displayWarehouse,
                    status
                );
            })
            .collect(Collectors.toList());
    }
    
    private List<DashboardResponse.LowStockAlert> getLowStockAlerts(List<Product> products, String warehouseDisplayName) {
        return products.stream()
            .filter(p -> p.getQuantity() < p.getThresholdQuantity())
            .limit(10) // Top 10 low stock alerts
            .map(product -> {
                String displayWarehouse = warehouseDisplayName.equals("All Warehouses") 
                    ? "Warehouse " + product.getWarehouseId()
                    : warehouseDisplayName;
                return new DashboardResponse.LowStockAlert(
                    product.getProductName(),
                    product.getSkuId(),
                    product.getQuantity(),
                    product.getThresholdQuantity(),
                    displayWarehouse
                );
            })
            .collect(Collectors.toList());
    }
    
    private List<DashboardResponse.ExpiryItem> getExpiryData(List<ProductBatch> batches, List<Product> products) {
        LocalDate today = LocalDate.now();
        LocalDate criticalThreshold = today.plusDays(30); // Critical if expiring within 30 days
        LocalDate warningThreshold = today.plusDays(60); // Warning if expiring within 60 days
        
        return batches.stream()
            .filter(b -> b.getExpiry().isAfter(today) && b.getExpiry().isBefore(warningThreshold))
            .sorted((b1, b2) -> b1.getExpiry().compareTo(b2.getExpiry())) // Sort by expiry date
            .limit(10) // Top 10 expiring batches
            .map(batch -> {
                String productName = products.stream()
                    .filter(p -> p.getSkuId().equals(batch.getSkuId()))
                    .findFirst()
                    .map(Product::getProductName)
                    .orElse("Unknown Product");
                
                String status;
                if (batch.getExpiry().isBefore(criticalThreshold)) {
                    status = "Critical";
                } else if (batch.getExpiry().isBefore(today.plusDays(45))) {
                    status = "Expiring Soon";
                } else {
                    status = "Monitor";
                }
                
                return new DashboardResponse.ExpiryItem(
                    batch.getBatchId(),
                    productName,
                    batch.getExpiry().toString(),
                    batch.getQuantity(),
                    status
                );
            })
            .collect(Collectors.toList());
    }
    
    private String determineStockStatus(Product product) {
        if (product.getQuantity() == 0) {
            return "Out of Stock";
        } else if (product.getQuantity() < product.getThresholdQuantity() * 0.5) {
            return "Critical";
        } else if (product.getQuantity() < product.getThresholdQuantity()) {
            return "Low Stock";
        } else {
            return "In Stock";
        }
    }
}
