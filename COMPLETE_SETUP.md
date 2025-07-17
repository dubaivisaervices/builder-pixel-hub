# 🚀 Complete Database Setup & 403 Error Fix

## Current Issues:

- ✅ Website loads (I can see the navigation)
- ❌ Getting 403 errors (database not connected)
- ❌ Large JSON files causing problems
- ❌ Need to import business data

## ONE-COMMAND SOLUTION:

### Step 1: Set Environment Variable (if not done)

In your terminal, run:

```bash
# Replace with your actual connection string
export NEON_DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/database?sslmode=require"
```

### Step 2: Import All Data (One Command)

```bash
cd code
npm run import-now
```

This will:

- ✅ Connect to your database
- ✅ Import all 841 businesses
- ✅ Set up all tables and indexes
- ✅ Show you exactly what happened

### Step 3: Test Database Connection

```bash
# Test if database is working
node -e "
const {Pool} = require('pg');
new Pool({connectionString: process.env.NEON_DATABASE_URL, ssl: true})
  .query('SELECT COUNT(*) FROM businesses')
  .then(r => console.log('✅ Database working! Businesses:', r.rows[0].count))
  .catch(e => console.log('❌ Database failed:', e.message))
"
```

## Fix 403 Errors Immediately:

I'll also update the code to remove the large JSON file dependency:
