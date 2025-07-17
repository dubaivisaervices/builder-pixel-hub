-- Neon PostgreSQL Database Schema for Business Directory
-- This schema handles 840+ business listings with all metadata

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id VARCHAR(255) PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    category VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    email VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    business_status VARCHAR(50) DEFAULT 'OPERATIONAL',
    logo_url TEXT,
    logo_s3_url TEXT,
    photos TEXT[], -- Array of photo URLs
    has_target_keyword BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(business_status);

-- Create stats table for dashboard
CREATE TABLE IF NOT EXISTS business_stats (
    id SERIAL PRIMARY KEY,
    total_businesses INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_locations INTEGER DEFAULT 0,
    scam_reports INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    business_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial categories
INSERT INTO business_categories (name, description) VALUES
('Visa Services', 'Visa processing and immigration services'),
('Document Clearing', 'Document attestation and clearing services'),
('PRO Services', 'Public Relations Officer services'),
('Education Visa', 'Student visa and education consultancy'),
('Immigration Services', 'General immigration and migration services'),
('Attestation Services', 'Certificate and document attestation'),
('Business Setup', 'Company formation and business setup'),
('Golden Visa', 'UAE Golden Visa services'),
('Work Visa', 'Employment visa services'),
('Family Visa', 'Family reunification visa services')
ON CONFLICT (name) DO NOTHING;

-- Function to update business stats
CREATE OR REPLACE FUNCTION update_business_stats()
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_stats (
        total_businesses,
        total_reviews,
        avg_rating,
        total_locations,
        scam_reports
    )
    SELECT 
        COUNT(*) as total_businesses,
        SUM(review_count) as total_reviews,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(DISTINCT CONCAT(latitude, ',', longitude)) as total_locations,
        0 as scam_reports -- We'll update this separately
    FROM businesses
    WHERE business_status = 'OPERATIONAL'
    ON CONFLICT (id) DO UPDATE SET
        total_businesses = EXCLUDED.total_businesses,
        total_reviews = EXCLUDED.total_reviews,
        avg_rating = EXCLUDED.avg_rating,
        total_locations = EXCLUDED.total_locations,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when businesses change
CREATE OR REPLACE FUNCTION trigger_update_stats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_business_stats();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS businesses_stats_trigger ON businesses;
CREATE TRIGGER businesses_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_stats();

-- Initial stats calculation
SELECT update_business_stats();
