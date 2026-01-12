package org.cencora.inventorymanagement.service;

import org.cencora.inventorymanagement.dto.PageResponse;
import org.cencora.inventorymanagement.dto.ProductRequest;
import org.cencora.inventorymanagement.dto.ProductResponse;
import org.cencora.inventorymanagement.entity.Product;
import org.cencora.inventorymanagement.entity.ProductBatch;
import org.cencora.inventorymanagement.entity.Zone;
import org.cencora.inventorymanagement.enums.PersonaType;
import org.cencora.inventorymanagement.repository.ProductBatchRepository;
import org.cencora.inventorymanagement.repository.ProductRepository;
import org.cencora.inventorymanagement.repository.WarehouseRepository;
import org.cencora.inventorymanagement.repository.ZoneRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductService {
    
    @Inject
    ProductRepository productRepository;
    
    @Inject
    ProductBatchRepository productBatchRepository;
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    @Inject
    ZoneRepository zoneRepository;
    
    public PageResponse<ProductResponse> getAllProducts(String warehouseId, String search, 
                                                       String personaType, int page, int size, String sortBy, String direction) {
        List<Product> products;
        
        // Handle "all" warehouses
        if (warehouseId == null || warehouseId.trim().isEmpty() || warehouseId.equalsIgnoreCase("all")) {
            // Get all products from all warehouses
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                products = productRepository.find("LOWER(productName) LIKE ?1 OR LOWER(skuId) LIKE ?1", searchPattern).list();
            } else {
                products = productRepository.listAll();
            }
        } else {
            // Validate warehouse exists
            warehouseRepository.findByWarehouseId(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found: " + warehouseId));
            
            if (search != null && !search.trim().isEmpty()) {
                products = productRepository.findByWarehouseIdAndSearch(warehouseId, search);
            } else {
                products = productRepository.findByWarehouseId(warehouseId);
            }
        }
        
        // Filter by persona_type if provided
        if (personaType != null && !personaType.trim().isEmpty()) {
            try {
                PersonaType personaTypeEnum = PersonaType.valueOf(personaType.toUpperCase());
                products = products.stream()
                    .filter(p -> {
                        // B2B can see: B2B and BOTH products
                        if (personaTypeEnum == PersonaType.B2B) {
                            return p.getPersonaType() == PersonaType.B2B || p.getPersonaType() == PersonaType.BOTH;
                        }
                        // B2C can see: B2C and BOTH products
                        else if (personaTypeEnum == PersonaType.B2C) {
                            return p.getPersonaType() == PersonaType.B2C || p.getPersonaType() == PersonaType.BOTH;
                        }
                        // For BOTH, show all (or specific filtering logic)
                        return true;
                    })
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid persona type, ignore filter
            }
        }
        
        // Apply sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            products = sortProducts(products, sortBy, direction);
        }
        
        // Apply pagination
        int totalElements = products.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);
        
        List<Product> pagedProducts = fromIndex < totalElements 
            ? products.subList(fromIndex, toIndex) 
            : List.of();
        
        List<ProductResponse> content = pagedProducts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return new PageResponse<>(content, totalElements, totalPages, size, page);
    }
    
    public ProductResponse getProductById(String skuId, String warehouseId) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        return toResponse(product);
    }
    
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        // Validate warehouse exists
        warehouseRepository.findByWarehouseId(request.getWarehouseId())
            .orElseThrow(() -> new NotFoundException("Warehouse not found: " + request.getWarehouseId()));
        
        // Check if product already exists
        if (productRepository.findBySkuIdAndWarehouseId(request.getSkuId(), request.getWarehouseId()).isPresent()) {
            throw new IllegalArgumentException("Product with SKU " + request.getSkuId() + 
                " already exists in warehouse " + request.getWarehouseId());
        }
        
        Product product = new Product();
        product.setSkuId(request.getSkuId());
        product.setWarehouseId(request.getWarehouseId());
        product.setProductName(request.getProductName());
        product.setManufactureName(request.getManufactureName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setStorageType(request.getStorageType());
        product.setQuantity(0L); // Initial quantity is 0, will be updated when batches are added
        product.setPrice(request.getPrice());
        product.setProfitMargin(request.getProfitMargin() != null ? request.getProfitMargin() : new java.math.BigDecimal("5.00"));
        product.setRequiredPrescription(request.getRequiredPrescription() != null ? request.getRequiredPrescription() : false);
        product.setUrl(request.getUrl());
        product.setDosageForm(request.getDosageForm());
        product.setThresholdQuantity(request.getThresholdQuantity());
        product.setStrength(request.getStrength());
        product.setConcern(request.getConcern());
        product.setPersonaType(request.getPersonaType() != null ? request.getPersonaType() : PersonaType.BOTH);
        
        productRepository.persist(product);
        return toResponse(product);
    }
    
    @Transactional
    public ProductResponse updateProduct(String skuId, String warehouseId, ProductRequest request) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        // Update fields
        product.setProductName(request.getProductName());
        product.setManufactureName(request.getManufactureName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setStorageType(request.getStorageType());
        product.setPrice(request.getPrice());
        product.setProfitMargin(request.getProfitMargin() != null ? request.getProfitMargin() : product.getProfitMargin());
        product.setRequiredPrescription(request.getRequiredPrescription() != null ? request.getRequiredPrescription() : product.getRequiredPrescription());
        product.setUrl(request.getUrl());
        product.setDosageForm(request.getDosageForm());
        product.setThresholdQuantity(request.getThresholdQuantity());
        product.setStrength(request.getStrength());
        product.setConcern(request.getConcern());
        if (request.getPersonaType() != null) {
            product.setPersonaType(request.getPersonaType());
        }
        
        productRepository.persist(product);
        return toResponse(product);
    }
    
    @Transactional
    public ProductResponse updatePersonaType(String skuId, String warehouseId, PersonaType personaType) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        // Validate persona type is not null
        if (personaType == null) {
            throw new IllegalArgumentException("Persona type cannot be null");
        }
        
        // Update persona type
        product.setPersonaType(personaType);
        productRepository.persist(product);
        
        return toResponse(product);
    }
    
    @Transactional
    public void deleteProduct(String skuId, String warehouseId) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        // Delete all batches associated with this product (cascade delete)
        List<ProductBatch> batches = productBatchRepository.findBySkuIdAndWarehouseId(skuId, warehouseId);
        for (ProductBatch batch : batches) {
            productBatchRepository.delete(batch);
        }
        
        // Remove product from all zones in the warehouse
        List<Zone> zones = zoneRepository.findByWarehouseId(warehouseId);
        for (Zone zone : zones) {
            if (zone.getProductList().containsKey(skuId)) {
                zone.getProductList().remove(skuId);
                zoneRepository.persist(zone);
            }
        }
        
        // Delete the product
        productRepository.delete(product);
    }
    
    @Transactional
    public void updateProductQuantity(String skuId, String warehouseId) {
        Product product = productRepository.findBySkuIdAndWarehouseId(skuId, warehouseId)
            .orElseThrow(() -> new NotFoundException("Product not found with SKU: " + skuId + " in warehouse: " + warehouseId));
        
        // Calculate total quantity from all batches
        List<ProductBatch> batches = productBatchRepository.findBySkuIdAndWarehouseId(skuId, warehouseId);
        long totalQuantity = batches.stream()
            .mapToLong(ProductBatch::getQuantity)
            .sum();
        
        product.setQuantity(totalQuantity);
        productRepository.persist(product);
    }
    
    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setSkuId(product.getSkuId());
        response.setWarehouseId(product.getWarehouseId());
        response.setProductName(product.getProductName());
        response.setManufactureName(product.getManufactureName());
        response.setCategory(product.getCategory());
        response.setDescription(product.getDescription());
        response.setStorageType(product.getStorageType());
        response.setQuantity(product.getQuantity());
        response.setPrice(product.getPrice());
        response.setProfitMargin(product.getProfitMargin());
        response.setRequiredPrescription(product.getRequiredPrescription());
        response.setUrl(product.getUrl());
        response.setDosageForm(product.getDosageForm());
        response.setThresholdQuantity(product.getThresholdQuantity());
        response.setStrength(product.getStrength());
        response.setConcern(product.getConcern());
        response.setPersonaType(product.getPersonaType());
        return response;
    }
    
    private List<Product> sortProducts(List<Product> products, String sortBy, String direction) {
        boolean ascending = direction == null || direction.equalsIgnoreCase("ASC");
        
        return products.stream()
            .sorted((p1, p2) -> {
                int comparison = 0;
                switch (sortBy.toLowerCase()) {
                    case "name":
                    case "productname":
                        comparison = p1.getProductName().compareToIgnoreCase(p2.getProductName());
                        break;
                    case "sku":
                    case "skuid":
                        comparison = p1.getSkuId().compareToIgnoreCase(p2.getSkuId());
                        break;
                    case "quantity":
                        comparison = Long.compare(p1.getQuantity(), p2.getQuantity());
                        break;
                    case "price":
                        comparison = p1.getPrice().compareTo(p2.getPrice());
                        break;
                    default:
                        comparison = p1.getSkuId().compareToIgnoreCase(p2.getSkuId());
                }
                return ascending ? comparison : -comparison;
            })
            .collect(Collectors.toList());
    }
}
