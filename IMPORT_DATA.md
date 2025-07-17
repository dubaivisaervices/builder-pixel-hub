# 🚀 Import Business Data to Database

## Quick Commands:

### 1. Test Database Connection First:

```bash
# Set your database URL (replace with your actual URL)
export NEON_DATABASE_URL="postgresql://username:password@ep-xyz.neon.tech/database?sslmode=require"

# Test connection
node -e "
const {Pool} = require('pg');
new Pool({connectionString: process.env.NEON_DATABASE_URL, ssl: true})
  .query('SELECT NOW()')
  .then(r => console.log('✅ Database connected!', r.rows[0]))
  .catch(e => console.log('❌ Connection failed:', e.message))
"
```

### 2. Import All Business Data:

```bash
cd code
npm run import-now
```

This will import all 841 businesses automatically!

## What It Does:

- ✅ Connects to your database
- ✅ Clears old data
- ✅ Imports all 841 real businesses
- ✅ Creates indexes for performance
- ✅ Updates statistics
- ✅ Shows progress and results

## Test Results:

After importing, test your website:

1. **Database Test Page**: https://reportvisascam.com/database-test.html
2. **Business Directory**: https://reportvisascam.com/dubai-businesses

## Expected Results:

- ✅ Database shows 841 businesses
- ✅ No 403 errors
- ✅ Fast loading
- ✅ Real business data

## If Import Fails:

Check these:

1. **Database URL**: Make sure NEON_DATABASE_URL is set correctly
2. **Data File**: Ensure `public/api/complete-businesses.json` exists
3. **Network**: Check internet connection
4. **Permissions**: Database user has write permissions

## Alternative: Manual Import

If the script doesn't work, you can import manually:

1. Go to your Neon dashboard → SQL Editor
2. Copy business data from JSON
3. Use INSERT statements to add data

Let me know if you need help with any step! 🎯
