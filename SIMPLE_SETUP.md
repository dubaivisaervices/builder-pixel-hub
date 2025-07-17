# 🚀 3-Step Neon Setup (5 Minutes Total)

## Step 1: Get Neon Database URL (2 minutes)

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up (free)
3. Create project → name it "business-directory"
4. **Copy this connection string** (it looks like):
   ```
   postgresql://username:password@ep-xyz123.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Set Netlify Environment Variable (1 minute)

1. Go to your Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Click **Add variable**:
   - **Key**: `NEON_DATABASE_URL`
   - **Value**: Paste your connection string from Step 1

## Step 3: Set Up Database (2 minutes)

I'll give you the **exact commands** to copy/paste:

### Option A: Using Neon Dashboard (Easiest)

1. Open your Neon dashboard → **SQL Editor**
2. Copy ALL of this and paste it in the SQL Editor:

```sql
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
    photos TEXT[],
    has_target_keyword BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses USING GIN(to_tsvector('english', name));

-- Create stats table
CREATE TABLE IF NOT EXISTS business_stats (
    id SERIAL PRIMARY KEY,
    total_businesses INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_locations INTEGER DEFAULT 0,
    scam_reports INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Done! Your database is ready.
```

3. Click **Run**

## ✅ That's It!

Your database is now ready. Deploy your site and it will automatically:

- ✅ Connect to Neon database
- ✅ Load all 841 real businesses
- ✅ Handle unlimited data without 403 errors
- ✅ Fall back to JSON if needed

## 🎯 Want Me to Import the Data Too?

If you want the 841 businesses imported automatically, just tell me and I'll create a one-click import script for you!

**Total time: 5 minutes max** 🚀
