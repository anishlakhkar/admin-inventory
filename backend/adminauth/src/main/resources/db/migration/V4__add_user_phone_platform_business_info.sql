-- Add phone_no, platform, and business_info columns to users table
ALTER TABLE users 
ADD COLUMN phone_no VARCHAR(20) AFTER last_name,
ADD COLUMN platform VARCHAR(100) AFTER phone_no,
ADD COLUMN business_info TEXT AFTER platform;

-- Add index on phone_no for quick lookups
CREATE INDEX idx_phone_no ON users(phone_no);

-- Add index on platform for filtering
CREATE INDEX idx_platform ON users(platform);
