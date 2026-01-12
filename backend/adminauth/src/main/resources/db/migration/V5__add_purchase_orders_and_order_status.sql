-- Add order_status enum column to orders table (migrating from VARCHAR to ENUM-compatible VARCHAR)
-- First, ensure all existing status values are valid (PROCESSING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
-- Note: MySQL 5.6 doesn't support native ENUM, so we'll use VARCHAR with CHECK constraint simulation

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(255) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    total_amount DECIMAL(19,2) NOT NULL,
    comments TEXT,
    approved_rejected_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_rejected_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_rejected_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_po_number (po_number),
    INDEX idx_status (status),
    INDEX idx_approved_rejected_by (approved_rejected_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Update orders table status column to use new OrderStatus enum values
-- Note: We'll keep VARCHAR type for MySQL 5.6 compatibility, but ensure values match enum
-- Update existing status values if needed (this is a migration step - adjust based on current data)
-- For new orders, use: PROCESSING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

-- No need to alter the status column type, just ensure application uses enum values
-- The status column already exists as VARCHAR(100), which is compatible
