-- Add days_until_expiry column to regulatory_document table
ALTER TABLE regulatory_document 
ADD COLUMN days_until_expiry INTEGER AFTER expiry_status;
