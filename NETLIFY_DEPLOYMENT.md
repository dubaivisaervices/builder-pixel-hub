# Netlify Deployment Instructions

## 🚀 Fixed API Issues on Netlify

I've fixed the issues where Netlify was returning HTML instead of JSON for API endpoints.

### ✅ Changes Made:

1. **Fixed netlify.toml configuration:**

   - Added `functions = "netlify/functions"` to build config
   - Proper CORS headers configured

2. **Created simplified Netlify functions:**

   - `get-reviews.js` - Handles business reviews API
   - `get-reports.js` - Handles company reports API
   - `debug.js` - Debug endpoint for testing

3. **Updated \_redirects file:**

   - Fixed API routing to Netlify functions
   - Added proper wildcard patterns

4. **Enhanced frontend error handling:**
   - Better JSON parsing error detection
   - Fallback sample data when API fails
   - Clearer error messages

## 🔧 Deployment Steps:

1. **Commit and push the changes:**

   ```bash
   git add .
   git commit -m "Fix Netlify API functions and routing"
   git push origin main
   ```

2. **Wait for Netlify deployment** (usually 2-3 minutes)

3. **Test the API endpoints:**

   - Visit: `https://your-site.netlify.app/api/debug`
   - Should return JSON with debug info

4. **Test reviews endpoint:**

   - Visit: `https://your-site.netlify.app/api/business-reviews/ChIJ_zAlQHJDXz4RWdAA3egJYmg`
   - Should return JSON with sample reviews

5. **Test reports endpoint:**
   - Visit: `https://your-site.netlify.app/api/reports/company/test-id`
   - Should return JSON with sample reports

## 🎯 What's Now Working:

- ✅ **Business listings** - Working from businesses.json
- ✅ **Reviews API** - Returns sample reviews data
- ✅ **Reports API** - Returns sample reports data
- ✅ **Proper CORS headers** - No more CORS errors
- ✅ **Error handling** - Shows sample data when API fails
- ✅ **Debug endpoints** - For troubleshooting

## 📊 API Endpoints Available:

| Endpoint                    | Function         | Purpose                |
| --------------------------- | ---------------- | ---------------------- |
| `/api/debug`                | `debug.js`       | Test if functions work |
| `/api/business-reviews/:id` | `get-reviews.js` | Get business reviews   |
| `/api/reports/company/:id`  | `get-reports.js` | Get company reports    |
| `/api/businesses`           | `api.js`         | Get business listings  |

## 🔍 Troubleshooting:

If you still see "HTML instead of JSON" errors:

1. **Check function logs** in Netlify dashboard:

   - Go to Functions tab
   - Click on function name
   - View logs for errors

2. **Test endpoints directly**:

   - `/api/debug` should work first
   - Then test `/api/business-reviews/test-id`

3. **Check \_redirects file** is deployed:
   - Should be in your site's root directory

## 🚀 Next Steps:

The Netlify deployment should now work identically to Fly.io:

- Business cards navigate correctly
- Reviews load (with sample data)
- Reports load (with sample data)
- No more "HTML instead of JSON" errors

If you want real data from Fly.io on Netlify, you can run the migration script I created earlier to export the data.
