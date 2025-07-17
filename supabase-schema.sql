-- Supabase Database Schema for Dubai Business Directory
-- Copy and paste this into your Supabase SQL editor

-- Enable RLS (Row Level Security)
-- For public access, we'll disable RLS for now but you can enable it later for security

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY, -- Google Place ID
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  lat REAL DEFAULT 0,
  lng REAL DEFAULT 0,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  category TEXT,
  business_status TEXT DEFAULT 'OPERATIONAL',
  photo_reference TEXT,
  photos TEXT, -- JSON array of photo URLs
  opening_hours TEXT, -- JSON object
  price_level INTEGER,
  logoUrl TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_url TEXT,
  profile_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  time BIGINT, -- Unix timestamp
  relative_time_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_address ON businesses(address);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_time ON reviews(time DESC);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('english', name || ' ' || COALESCE(address, '') || ' ' || COALESCE(category, '')));

-- Disable RLS for public access (enable this later for security)
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for businesses table
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for anonymous access (for public website)
GRANT SELECT ON businesses TO anon;
GRANT SELECT ON reviews TO anon;

-- Grant all permissions to authenticated users (for admin operations)
GRANT ALL ON businesses TO authenticated;
GRANT ALL ON reviews TO authenticated;

-- Create a view for business statistics
CREATE OR REPLACE VIEW business_stats AS
SELECT 
  COUNT(*) as total_businesses,
  AVG(rating) as average_rating,
  SUM(review_count) as total_reviews,
  COUNT(DISTINCT category) as total_categories
FROM businesses;

-- Grant access to the view
GRANT SELECT ON business_stats TO anon;
GRANT SELECT ON business_stats TO authenticated;

-- Create a function to search businesses
CREATE OR REPLACE FUNCTION search_businesses(
  search_query TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE(
  id TEXT,
  name TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  rating REAL,
  review_count INTEGER,
  category TEXT,
  lat REAL,
  lng REAL,
  logoUrl TEXT,
  photos TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.address,
    b.phone,
    b.website,
    b.rating,
    b.review_count,
    b.category,
    b.lat,
    b.lng,
    b.logoUrl,
    b.photos
  FROM businesses b
  WHERE 
    (search_query IS NULL OR 
     b.name ILIKE '%' || search_query || '%' OR 
     b.address ILIKE '%' || search_query || '%' OR 
     b.category ILIKE '%' || search_query || '%')
    AND (category_filter IS NULL OR b.category ILIKE '%' || category_filter || '%')
    AND (city_filter IS NULL OR b.address ILIKE '%' || city_filter || '%')
  ORDER BY b.rating DESC, b.review_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION search_businesses TO anon;
GRANT EXECUTE ON FUNCTION search_businesses TO authenticated;

-- Insert sample data to test the schema (optional)
INSERT INTO businesses (id, name, address, rating, review_count, category, lat, lng) VALUES
('sample-1', 'Test Business 1', 'Dubai, UAE', 4.5, 100, 'visa services', 25.2048, 55.2708),
('sample-2', 'Test Business 2', 'Abu Dhabi, UAE', 4.2, 85, 'immigration services', 24.4539, 54.3773)
ON CONFLICT (id) DO NOTHING;

-- Create a function to get business statistics
CREATE OR REPLACE FUNCTION get_business_statistics()
RETURNS TABLE(
  total_businesses BIGINT,
  average_rating NUMERIC,
  total_reviews BIGINT,
  total_categories BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_businesses,
    ROUND(AVG(rating), 2) as average_rating,
    SUM(review_count) as total_reviews,
    COUNT(DISTINCT category) as total_categories
  FROM businesses;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_business_statistics TO anon;
GRANT EXECUTE ON FUNCTION get_business_statistics TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Supabase schema created successfully! Ready for Dubai Business Directory.';
END $$;
