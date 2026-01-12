package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.ExpiryDataExportResponse;
import org.cencora.inventorymanagement.dto.FullInventoryExportResponse;
import org.cencora.inventorymanagement.dto.InventoryValuationReportResponse;
import org.cencora.inventorymanagement.dto.LowStockReportResponse;
import org.cencora.inventorymanagement.dto.PurchaseOrderExportResponse;
import org.cencora.inventorymanagement.dto.RecentReportResponse;
import org.cencora.inventorymanagement.entity.Product;
import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.repository.ProductBatchRepository;
import org.cencora.inventorymanagement.repository.ProductRepository;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.cencora.ordermanagement.entity.PurchaseOrder;
import org.cencora.ordermanagement.model.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class ReportService {
    
    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductBatchRepository productBatchRepository;
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    /**
     * Generate Inventory Valuation Report
     * Date range filters products that have batches expiring within the date range
     */
    public InventoryValuationReportResponse generateInventoryValuationReport(
            LocalDate startDate, LocalDate endDate, String format) {
        
        InventoryValuationReportResponse response = new InventoryValuationReportResponse();
        
        // Get all products from all warehouses
        List<Product> allProducts = productRepository.listAll();
        
        // Filter by date range: Only include products that have batches expiring within the date range
        if (startDate != null && endDate != null) {
            final Set<String> productSkuIdsInDateRange = productBatchRepository.listAll().stream()
                .filter(batch -> !batch.getExpiry().isBefore(startDate) && !batch.getExpiry().isAfter(endDate))
                .map(ProductBatch::getSkuId)
                .collect(Collectors.toSet());
            
            // Filter products to only those with batches in date range
            allProducts = allProducts.stream()
                .filter(p -> productSkuIdsInDateRange.contains(p.getSkuId()))
                .collect(Collectors.toList());
        }
        
        // Calculate total valuation
        BigDecimal totalValuation = allProducts.stream()
            .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Group by warehouse
        Map<String, List<Product>> productsByWarehouse = allProducts.stream()
            .collect(Collectors.groupingBy(Product::getWarehouseId));
        
        List<InventoryValuationReportResponse.WarehouseValuation> warehouseValuations = new ArrayList<>();
        
        for (Map.Entry<String, List<Product>> entry : productsByWarehouse.entrySet()) {
            String warehouseId = entry.getKey();
            List<Product> products = entry.getValue();
            
            String warehouseName = "Warehouse " + warehouseId;
            
            Long totalProducts = (long) products.size();
            Long totalQuantity = products.stream()
                .mapToLong(Product::getQuantity)
                .sum();
            
            BigDecimal warehouseValue = products.stream()
                .map(p -> p.getPrice().multiply(new BigDecimal(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            warehouseValuations.add(new InventoryValuationReportResponse.WarehouseValuation(
                warehouseId, warehouseName, totalProducts, totalQuantity, warehouseValue
            ));
        }
        
        // Create product valuations list
        List<InventoryValuationReportResponse.ProductValuation> productValuations = allProducts.stream()
            .map(p -> new InventoryValuationReportResponse.ProductValuation(
                p.getSkuId(),
                p.getProductName(),
                p.getCategory().name(),
                p.getWarehouseId(),
                p.getQuantity(),
                p.getPrice(),
                p.getPrice().multiply(new BigDecimal(p.getQuantity()))
            ))
            .collect(Collectors.toList());
        
        // Set response data
        response.setReportName("Inventory Valuation Report - " + 
            startDate.format(DateTimeFormatter.ofPattern("MMM yyyy")));
        response.setGeneratedDate(LocalDate.now().toString());
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setFormat(format.toUpperCase());
        response.setTotalValuation(totalValuation);
        response.setWarehouseValuations(warehouseValuations);
        response.setProductValuations(productValuations);
        
        return response;
    }
    
    /**
     * Generate Low Stock Report
     * Date range filters products that have batches expiring within the date range
     */
    public LowStockReportResponse generateLowStockReport(
            LocalDate startDate, LocalDate endDate, String format) {
        
        LowStockReportResponse response = new LowStockReportResponse();
        
        // Get all products
        // For Low Stock Export, we export ALL low stock items regardless of date range
        List<Product> allProducts = productRepository.listAll();
        
        // Note: Date range filtering is NOT applied for Low Stock Export
        // This ensures all low stock items are included
        
        // Filter low stock items (quantity < threshold)
        List<LowStockReportResponse.LowStockItem> lowStockItems = allProducts.stream()
            .filter(p -> p.getQuantity() < p.getThresholdQuantity())
            .map(p -> {
                String warehouseName = "Warehouse " + p.getWarehouseId();
                
                Long shortage = p.getThresholdQuantity() - p.getQuantity();
                
                // Calculate days until out (simple estimation)
                Long daysUntilOut = calculateDaysUntilOut(p);
                
                // Calculate priority
                String priority = calculatePriority(p, daysUntilOut);
                
                return new LowStockReportResponse.LowStockItem(
                    p.getSkuId(),
                    p.getProductName(),
                    p.getCategory().name(),
                    p.getWarehouseId(),
                    warehouseName,
                    p.getQuantity(),
                    p.getThresholdQuantity(),
                    shortage,
                    daysUntilOut,
                    priority
                );
            })
            .collect(Collectors.toList());
        
        // Set response data
        response.setReportName("Low Stock Report - All Data");
        response.setGeneratedDate(LocalDate.now().toString());
        response.setStartDate(LocalDate.now().minusYears(10)); // For display purposes
        response.setEndDate(LocalDate.now().plusYears(10)); // For display purposes
        response.setFormat(format.toUpperCase());
        response.setTotalLowStockItems((long) lowStockItems.size());
        response.setLowStockItems(lowStockItems);
        
        return response;
    }
    
    /**
     * Generate Full Inventory Export
     * Shows all products with their current state. Date range is optional and filters by batches in that range.
     */
    public FullInventoryExportResponse generateFullInventoryExport(
            LocalDate startDate, LocalDate endDate, String format, String warehouseId) {
        
        FullInventoryExportResponse response = new FullInventoryExportResponse();
        
        // Get all products (filter by warehouse if provided)
        // For Full Inventory Export, we export ALL products regardless of date range
        List<Product> allProducts;
        if (warehouseId != null && !warehouseId.trim().isEmpty()) {
            allProducts = productRepository.findByWarehouseId(warehouseId);
        } else {
            allProducts = productRepository.listAll();
        }
        
        // Note: Date range filtering is NOT applied for Full Inventory Export
        // This ensures all products are included regardless of batch expiry dates
        
        // Convert to export items
        List<FullInventoryExportResponse.InventoryItem> items = allProducts.stream()
            .map(p -> {
                String warehouseName = "Warehouse " + p.getWarehouseId();
                BigDecimal totalValue = p.getPrice().multiply(new BigDecimal(p.getQuantity()));
                
                return new FullInventoryExportResponse.InventoryItem(
                    p.getSkuId(),
                    p.getProductName(),
                    p.getCategory().name(),
                    p.getWarehouseId(),
                    warehouseName,
                    p.getQuantity(),
                    p.getPrice(),
                    totalValue,
                    p.getStorageType().name(),
                    p.getDosageForm().name()
                );
            })
            .collect(Collectors.toList());
        
        // Calculate totals
        Long totalProducts = (long) items.size();
        Long totalQuantity = items.stream()
            .mapToLong(FullInventoryExportResponse.InventoryItem::getQuantity)
            .sum();
        BigDecimal totalValue = items.stream()
            .map(FullInventoryExportResponse.InventoryItem::getTotalValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Set response data
        response.setReportName("Full Inventory Export - All Data");
        response.setGeneratedDate(LocalDate.now().toString());
        response.setStartDate(LocalDate.now().minusYears(10)); // For display purposes
        response.setEndDate(LocalDate.now().plusYears(10)); // For display purposes
        response.setFormat(format.toUpperCase());
        response.setTotalProducts(totalProducts);
        response.setTotalQuantity(totalQuantity);
        response.setTotalValue(totalValue);
        response.setItems(items);
        
        return response;
    }
    
    /**
     * Generate Expiry Data Export
     */
    public ExpiryDataExportResponse generateExpiryDataExport(
            LocalDate startDate, LocalDate endDate, String format, String warehouseId) {
        
        ExpiryDataExportResponse response = new ExpiryDataExportResponse();
        
        // Get all batches (filter by warehouse if provided)
        List<ProductBatch> allBatches;
        if (warehouseId != null && !warehouseId.trim().isEmpty()) {
            allBatches = productBatchRepository.findByWarehouseId(warehouseId);
        } else {
            allBatches = productBatchRepository.listAll();
        }
        
        // For Expiry Data Export, we export ALL batches regardless of date range
        // Date range is kept in the response for reference but doesn't filter the data
        LocalDate today = LocalDate.now();
        List<ProductBatch> batchesInRange = allBatches; // Include all batches
        
        // Get all products for batch details
        List<Product> allProducts = productRepository.listAll();
        Map<String, Product> productMap = allProducts.stream()
            .collect(Collectors.toMap(Product::getSkuId, p -> p));
        
        // Convert to export items
        List<ExpiryDataExportResponse.ExpiryItem> items = new ArrayList<>();
        long expiringSoonCount = 0;
        long expiredCount = 0;
        
        for (ProductBatch batch : batchesInRange) {
            Product product = productMap.get(batch.getSkuId());
            if (product == null) continue;
            
            long daysUntilExpiry = ChronoUnit.DAYS.between(today, batch.getExpiry());
            String status;
            if (daysUntilExpiry < 0) {
                status = "Expired";
                expiredCount++;
            } else if (daysUntilExpiry <= 30) {
                status = "Expiring Soon";
                expiringSoonCount++;
            } else {
                status = "Valid";
            }
            
            String warehouseName = "Warehouse " + batch.getWarehouseId();
            
            items.add(new ExpiryDataExportResponse.ExpiryItem(
                batch.getBatchId(),
                batch.getSkuId(),
                product.getProductName(),
                product.getCategory().name(),
                batch.getWarehouseId(),
                warehouseName,
                batch.getExpiry(),
                daysUntilExpiry,
                status,
                batch.getQuantity(),
                batch.getPersonaType().name()
            ));
        }
        
        // Set response data
        response.setReportName("Expiry Data Export - All Data");
        response.setGeneratedDate(LocalDate.now().toString());
        response.setStartDate(LocalDate.now().minusYears(10)); // For display purposes
        response.setEndDate(LocalDate.now().plusYears(10)); // For display purposes
        response.setFormat(format.toUpperCase());
        response.setTotalBatches((long) items.size());
        response.setExpiringSoonCount(expiringSoonCount);
        response.setExpiredCount(expiredCount);
        response.setItems(items);
        
        return response;
    }
    
    /**
     * Generate Purchase Order Export
     */
    public PurchaseOrderExportResponse generatePurchaseOrderExport(
            LocalDate startDate, LocalDate endDate, String format) {
        
        PurchaseOrderExportResponse response = new PurchaseOrderExportResponse();
        
        // Convert LocalDate to LocalDateTime for filtering
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get all purchase orders within date range (filter by createdAt)
        List<PurchaseOrder> allPurchaseOrders = PurchaseOrder.listAll();
        List<PurchaseOrder> purchaseOrdersInRange = allPurchaseOrders.stream()
            .filter(po -> {
                LocalDateTime createdAt = po.createdAt;
                return createdAt != null && !createdAt.isBefore(startDateTime) && !createdAt.isAfter(endDateTime);
            })
            .collect(Collectors.toList());
        
        // Convert to export items
        List<PurchaseOrderExportResponse.PurchaseOrderItem> items = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        long pendingCount = 0;
        long approvedCount = 0;
        long rejectedCount = 0;
        
        for (PurchaseOrder po : purchaseOrdersInRange) {
            String status = po.status != null ? po.status.toString() : "UNKNOWN";
            
            // Count by status
            if (po.status == PurchaseOrderStatus.PENDING) {
                pendingCount++;
            } else if (po.status == PurchaseOrderStatus.APPROVED) {
                approvedCount++;
            } else if (po.status == PurchaseOrderStatus.REJECTED) {
                rejectedCount++;
            }
            
            totalAmount = totalAmount.add(po.totalAmount != null ? po.totalAmount : BigDecimal.ZERO);
            
            String approvedRejectedBy = null;
            if (po.approvedRejectedBy != null) {
                String firstName = po.approvedRejectedBy.firstName != null ? po.approvedRejectedBy.firstName : "";
                String lastName = po.approvedRejectedBy.lastName != null ? po.approvedRejectedBy.lastName : "";
                approvedRejectedBy = (firstName + " " + lastName).trim();
                if (approvedRejectedBy.isEmpty()) {
                    approvedRejectedBy = po.approvedRejectedBy.email;
                }
            }
            
            items.add(new PurchaseOrderExportResponse.PurchaseOrderItem(
                po.poId,
                po.poNumber,
                po.order != null ? po.order.id : null,
                status,
                po.totalAmount,
                po.comments,
                approvedRejectedBy,
                po.createdAt,
                po.approvedRejectedAt,
                po.updatedAt
            ));
        }
        
        // Set response data
        response.setReportName("Purchase Orders Export - All Data");
        response.setGeneratedDate(LocalDate.now().toString());
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setFormat(format.toUpperCase());
        response.setTotalPurchaseOrders((long) items.size());
        response.setTotalAmount(totalAmount);
        response.setPendingCount(pendingCount);
        response.setApprovedCount(approvedCount);
        response.setRejectedCount(rejectedCount);
        response.setItems(items);
        
        return response;
    }
    
    /**
     * Get recent reports
     * Currently returns empty list as reports are generated on-demand and not stored
     * In future, this can be enhanced to store report history in database
     */
    public List<RecentReportResponse> getRecentReports() {
        // Reports are generated on-demand from current inventory data
        // No historical report storage exists yet
        // Return empty list - only show reports that have actually been generated
        return new ArrayList<>();
    }
    
    /**
     * Calculate estimated days until stock runs out
     */
    private Long calculateDaysUntilOut(Product product) {
        Long quantity = product.getQuantity();
        Long threshold = product.getThresholdQuantity();
        
        if (quantity == 0) {
            return 0L;
        }
        
        // Simple estimation: if stock is 50% of threshold, assume it will last 15 days
        double ratio = (double) quantity / threshold;
        return Math.max(1L, (long) (ratio * 30));
    }
    
    /**
     * Calculate priority based on stock level and days until out
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
}
