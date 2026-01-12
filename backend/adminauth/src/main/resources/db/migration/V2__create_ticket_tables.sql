-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raised_by BIGINT NOT NULL,
    assigned_to BIGINT,
    ticket_type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (raised_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_raised_by (raised_by),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_ticket_type (ticket_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create ticket_history table
CREATE TABLE IF NOT EXISTS ticket_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    action_by BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    old_assignee BIGINT,
    new_assignee BIGINT,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (old_assignee) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (new_assignee) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_action_by (action_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    commented_by BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (commented_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_commented_by (commented_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
    attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
