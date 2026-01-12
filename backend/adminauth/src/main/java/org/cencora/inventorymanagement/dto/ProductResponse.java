package org.cencora.inventorymanagement.dto;

import org.cencora.inventorymanagement.enums.Category;
import org.cencora.inventorymanagement.enums.Concern;
import org.cencora.inventorymanagement.enums.DosageForm;
import org.cencora.inventorymanagement.enums.PersonaType;
import org.cencora.inventorymanagement.enums.StorageType;
import java.math.BigDecimal;

public class ProductResponse {
    private String skuId;
    private String warehouseId;
    private String productName;
    private String manufactureName;
    private Category category;
    private String description;
    private StorageType storageType;
    private Long quantity;
    private BigDecimal price;
    private BigDecimal profitMargin;
    private Boolean requiredPrescription;
    private String url;
    private DosageForm dosageForm;
    private Long thresholdQuantity;
    private String strength;
    private Concern concern;
    private PersonaType personaType;
    
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
    
    public Long getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Long quantity) {
        this.quantity = quantity;
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
