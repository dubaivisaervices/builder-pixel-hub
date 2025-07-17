# Neon Database Setup Guide

This guide walks you through setting up a Neon PostgreSQL database for the business directory.

## Step 1: Create Neon Account

1. Go to [Neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project called "business-directory"

## Step 2: Get Database URL

1. In your Neon dashboard, go to **Connection Details**
2. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-hostname.us-east-1.aws.neon.tech/database_name?sslmode=require
   ```

## Step 3: Set Environment Variables

### For Local Development:

1. Copy `.env.example` to `.env`
2. Add your Neon database URL:
   ```
   NEON_DATABASE_URL=postgresql://username:password@ep-hostname.us-east-1.aws.neon.tech/database_name?sslmode=require
   ```

### For Netlify Deployment:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the environment variable:
   - **Key**: `NEON_DATABASE_URL`
   - **Value**: Your Neon connection string

## Step 4: Install Dependencies

```bash
npm install pg
```

## Step 5: Set Up Database Schema

Run the schema creation script to set up tables:

```bash
# Option 1: Using psql (if installed)
npm run db:schema

# Option 2: Copy and paste schema.sql content into Neon SQL Editor
```

Alternatively:

1. Go to your Neon dashboard
2. Open the **SQL Editor**
3. Copy the contents of `database/schema.sql`
4. Paste and execute in the SQL Editor

## Step 6: Migrate Business Data

Run the migration script to import business data:

```bash
npm run db:setup
```

This will:

- ✅ Connect to your Neon database
- ✅ Import all 841 businesses from JSON
- ✅ Update statistics and categories
- ✅ Verify the migration

## Step 7: Test Database Connection

1. Build and deploy your application
2. Check the health endpoint: `https://your-site.netlify.app/.netlify/functions/database-health`
3. Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "businessCount": 841,
     "stats": {
       "totalBusinesses": 841,
       "totalReviews": 306627,
       "avgRating": 4.5
     }
   }
   ```

## Step 8: Verify Business Directory

1. Visit your business directory: `https://your-site.netlify.app/dubai-businesses`
2. Should show "841 Verified Businesses"
3. All businesses should load from the database
4. "Load More" should work without 403 errors

## Database Schema Overview

### Main Tables:

- **businesses**: Core business data (841 records)
- **business_stats**: Aggregated statistics
- **business_categories**: Category definitions

### Key Features:

- ✅ Full-text search on business names
- ✅ Geographic indexing for location queries
- ✅ Automatic statistics updates
- ✅ Category-based filtering
- ✅ Rating and review aggregation

## Troubleshooting

### Connection Issues:

- Verify the database URL is correct
- Check that environment variables are set in Netlify
- Ensure the database is not sleeping (Neon free tier)

### Migration Issues:

- Check that `complete-businesses.json` exists
- Verify JSON format is valid
- Run migration in smaller batches if needed

### Performance Issues:

- Neon free tier has some limitations
- Consider upgrading for production use
- Database includes optimized indexes

## Benefits Over JSON Files

✅ **No file size limits** - Handle 841+ businesses easily  
✅ **Real-time queries** - Filter, search, paginate efficiently  
✅ **Reliability** - No 403 errors from large files  
✅ **Scalability** - Add thousands more businesses  
✅ **Performance** - Indexed queries, optimized data  
✅ **Analytics** - Real-time stats and reporting

Your business directory is now powered by a professional database! 🚀
