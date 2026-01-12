-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    doctor_name VARCHAR(255),
    prescription_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    review_notes TEXT,
    reviewed_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_reviewed_by (reviewed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_type VARCHAR(50) NOT NULL,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    subtotal_amt DECIMAL(19,2) NOT NULL,
    total_amt DECIMAL(19,2) NOT NULL,
    status VARCHAR(100) NOT NULL,
    prescription_required BOOLEAN NOT NULL,
    prescription_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_order_type (order_type),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_prescription_id (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(19,2) NOT NULL,
    prescription_required BOOLEAN NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
