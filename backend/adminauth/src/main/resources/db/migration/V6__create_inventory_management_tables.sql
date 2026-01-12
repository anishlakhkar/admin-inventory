-- Create warehouse table
CREATE TABLE IF NOT EXISTS warehouse (
    warehouse_id VARCHAR(10) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    location_pin_code VARCHAR(10) NOT NULL,
    total_zone INTEGER NOT NULL,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create product table
CREATE TABLE IF NOT EXISTS product (
    sku_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(10) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    manufacture_name VARCHAR(100) NOT NULL,
    category ENUM('EQUIPMENTS','MEDICATIONS','SUPPLEMENTS','SUPPLIES') NOT NULL,
    description VARCHAR(1000),
    storage_type ENUM('AMBIENT','FROZEN','REFRIGERATED') NOT NULL,
    quantity BIGINT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    profit_margin DECIMAL(5,2),
    required_prescription BIT NOT NULL,
    url VARCHAR(500),
    dosage_form ENUM('CAPSULE','OINTMENT','SYRUP','TABLET') NOT NULL,
    threshold_quantity BIGINT NOT NULL,
    strength VARCHAR(50),
    concern ENUM('FEVER','INFECTION','PAIN'),
    persona_type ENUM('B2B','B2C','BOTH') NOT NULL,
    PRIMARY KEY (sku_id),
    UNIQUE KEY UKfejvm5059mdx3htctr4g3m9u6 (sku_id, warehouse_id),
    INDEX idx_warehouse_id (warehouse_id),
    INDEX idx_product_name (product_name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create product_batch table
CREATE TABLE IF NOT EXISTS product_batch (
    batch_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(10) NOT NULL,
    sku_id VARCHAR(50) NOT NULL,
    expiry DATE NOT NULL,
    quantity BIGINT NOT NULL,
    persona_type ENUM('B2B','B2C','BOTH') NOT NULL,
    PRIMARY KEY (batch_id),
    UNIQUE KEY UKwi298jx3ytoa58ce2a7oyt5m (batch_id, warehouse_id, sku_id),
    INDEX idx_warehouse_id (warehouse_id),
    INDEX idx_sku_id (sku_id),
    INDEX idx_expiry (expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create regulatory_document table
CREATE TABLE IF NOT EXISTS regulatory_document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    document_type ENUM('BUSINESS_LICENSE','GMP_CERTIFICATE','INSURANCE_CERTIFICATE','PHARMACEUTICAL_LICENSE','QUALITY_CERTIFICATION','TAX_CERTIFICATE') NOT NULL,
    document_number VARCHAR(100),
    document_file_url VARCHAR(500),
    file_type VARCHAR(10),
    file_size BIGINT,
    upload_date DATE NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    validation_score INTEGER,
    validation_issues TEXT,
    extracted_text TEXT,
    keyword_matches INTEGER,
    expiry_status ENUM('EXPIRED','EXPIRING_SOON','NOT_FOUND','VALID'),
    status ENUM('AUTO_VERIFIED','EXPIRING_SOON','PENDING_REVIEW','REJECTED','VERIFIED') NOT NULL,
    rejection_reason TEXT,
    verified_by VARCHAR(100),
    verified_at DATETIME(6),
    issuing_authority VARCHAR(255),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_document_type (document_type),
    INDEX idx_status (status),
    INDEX idx_expiry_status (expiry_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create zone table
CREATE TABLE IF NOT EXISTS zone (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id VARCHAR(10) NOT NULL,
    storage_type ENUM('AMBIENT','FROZEN','REFRIGERATED') NOT NULL,
    total_capacity INTEGER NOT NULL,
    current_capacity INTEGER NOT NULL,
    INDEX idx_warehouse_id (warehouse_id),
    INDEX idx_storage_type (storage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create zone_product_list table (collection table for Zone.productList)
CREATE TABLE IF NOT EXISTS zone_product_list (
    zone_id BIGINT NOT NULL,
    sku_id VARCHAR(255) NOT NULL,
    quantity INTEGER,
    PRIMARY KEY (zone_id, sku_id),
    FOREIGN KEY (zone_id) REFERENCES zone(id) ON DELETE CASCADE,
    INDEX idx_zone_id (zone_id),
    INDEX idx_sku_id (sku_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
