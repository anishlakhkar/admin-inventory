package org.cencora.inventorymanagement.util;

import org.cencora.inventorymanagement.dto.ProductResponse;
import org.cencora.inventorymanagement.entity.Product;

public class ProductMapper {
    
    public static ProductResponse toResponse(Product product) {
        if (product == null) {
            return null;
        }
        
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
        
        return response;
    }
}
