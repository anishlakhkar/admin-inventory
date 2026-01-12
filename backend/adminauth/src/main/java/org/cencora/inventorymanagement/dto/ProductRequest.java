package org.cencora.inventorymanagement.dto;

import org.cencora.inventorymanagement.enums.Category;
import org.cencora.inventorymanagement.enums.Concern;
import org.cencora.inventorymanagement.enums.DosageForm;
import org.cencora.inventorymanagement.enums.PersonaType;
import org.cencora.inventorymanagement.enums.StorageType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {
    
    @NotBlank(message = "SKU ID is required")
    @Size(max = 50, message = "SKU ID must not exceed 50 characters")
    private String skuId;
    
    @NotBlank(message = "Warehouse ID is required")
    @Size(max = 10, message = "Warehouse ID must not exceed 10 characters")
    private String warehouseId;
    
    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String productName;
    
    @NotBlank(message = "Manufacture name is required")
    @Size(max = 100, message = "Manufacture name must not exceed 100 characters")
    private String manufactureName;
    
    @NotNull(message = "Category is required")
    private Category category;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Storage type is required")
    private StorageType storageType;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", message = "Profit margin must be 0 or greater")
    @DecimalMax(value = "100.0", message = "Profit margin must not exceed 100")
    private BigDecimal profitMargin = new BigDecimal("5.00");
    
    private Boolean requiredPrescription = false;
    
    @Size(max = 500, message = "URL must not exceed 500 characters")
    private String url;
    
    @NotNull(message = "Dosage form is required")
    private DosageForm dosageForm;
    
    @NotNull(message = "Threshold quantity is required")
    @Min(value = 0, message = "Threshold quantity must be 0 or greater")
    private Long thresholdQuantity;
    
    @Size(max = 50, message = "Strength must not exceed 50 characters")
    private String strength;
    
    private Concern concern;
    
    private PersonaType personaType = PersonaType.BOTH;
    
    // Getters and Setters
    public String getSkuId() {
        return skuId;
    }
    
    public void setSkuId(String skuId) {
        this.skuId = skuId;
    }
    
    public String getWarehouseId() {
        return warehouseId;
    }
    
    public void setWarehouseId(String warehouseId) {
        this.warehouseId = warehouseId;
    }
    
    public String getProductName() {
        return productName;
    }
    
    public void setProductName(String productName) {
        this.productName = productName;
    }
    
    public String getManufactureName() {
        return manufactureName;
    }
    
    public void setManufactureName(String manufactureName) {
        this.manufactureName = manufactureName;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public StorageType getStorageType() {
        return storageType;
    }
    
    public void setStorageType(StorageType storageType) {
        this.storageType = storageType;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getProfitMargin() {
        return profitMargin;
    }
    
    public void setProfitMargin(BigDecimal profitMargin) {
        this.profitMargin = profitMargin;
    }
    
    public Boolean getRequiredPrescription() {
        return requiredPrescription;
    }
    
    public void setRequiredPrescription(Boolean requiredPrescription) {
        this.requiredPrescription = requiredPrescription;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public DosageForm getDosageForm() {
        return dosageForm;
    }
    
    public void setDosageForm(DosageForm dosageForm) {
        this.dosageForm = dosageForm;
    }
    
    public Long getThresholdQuantity() {
        return thresholdQuantity;
    }
    
    public void setThresholdQuantity(Long thresholdQuantity) {
        this.thresholdQuantity = thresholdQuantity;
    }
    
    public String getStrength() {
        return strength;
    }
    
    public void setStrength(String strength) {
        this.strength = strength;
    }
    
    public Concern getConcern() {
        return concern;
    }
    
    public void setConcern(Concern concern) {
        this.concern = concern;
    }
    
    public PersonaType getPersonaType() {
        return personaType;
    }
    
    public void setPersonaType(PersonaType personaType) {
        this.personaType = personaType;
    }
}
