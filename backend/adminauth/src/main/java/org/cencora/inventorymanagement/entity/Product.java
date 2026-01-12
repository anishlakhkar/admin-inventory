package org.cencora.inventorymanagement.entity;

import org.cencora.inventorymanagement.enums.Category;
import org.cencora.inventorymanagement.enums.Concern;
import org.cencora.inventorymanagement.enums.DosageForm;
import org.cencora.inventorymanagement.enums.PersonaType;
import org.cencora.inventorymanagement.enums.StorageType;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"sku_id", "warehouse_id"}))
public class Product {
    
    @Id
    @Column(name = "sku_id", nullable = false, length = 50)
    private String skuId;
    
    @Column(name = "warehouse_id", nullable = false, length = 10)
    private String warehouseId;
    
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;
    
    @Column(name = "manufacture_name", nullable = false, length = 100)
    private String manufactureName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false, length = 20)
    private StorageType storageType;
    
    @Column(nullable = false)
    private Long quantity;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "profit_margin", precision = 5, scale = 2)
    private BigDecimal profitMargin = new BigDecimal("5.00");
    
    @Column(name = "required_prescription", nullable = false)
    private Boolean requiredPrescription = false;
    
    @Column(length = 500)
    private String url;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form", nullable = false, length = 20)
    private DosageForm dosageForm;
    
    @Column(name = "threshold_quantity", nullable = false)
    private Long thresholdQuantity;
    
    @Column(length = 50)
    private String strength;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Concern concern;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "persona_type", nullable = false, length = 10)
    private PersonaType personaType = PersonaType.BOTH;
    
    // Constructors
    // Empty constructor required by JPA/Hibernate
    public Product() {
    }
    
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
