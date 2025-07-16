# 🚫 Fix 403 Forbidden Error - Netlify Deployment

## 🔍 Common Causes & Solutions

### 1. SPA Routing Issues (Most Common)

**Problem:** React Router routes showing 403 instead of loading the app.

**Solution:** Ensure proper SPA redirects in `netlify.toml`:

```toml
# SPA fallback - catch all routes and serve index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Build Directory Issues

**Problem:** Netlify can't find the correct files to serve.

**Check:**

- Publish directory: `dist/spa`
- Build command: `npm run build:netlify`

### 3. Missing Index File

**Problem:** No `index.html` in the publish directory.

**Solution:** Verify build output:

```bash
# Build locally and check
npm run build:netlify
ls -la dist/spa/
# Should show index.html
```

### 4. Permissions in Build Process

**Problem:** File permissions set incorrectly during build.

**Solution:** Add to `netlify.toml`:

```toml
[build]
  command = "npm run build:netlify && chmod -R 755 dist/spa"
  publish = "dist/spa"
```

### 5. Conflicting .htaccess Files

**Problem:** Leftover Apache configuration files.

**Solution:** Remove any `.htaccess` files from your project.

## 🛠️ Immediate Fixes to Try

### Fix 1: Update Netlify Configuration

Update your `netlify.toml` with proper redirects:

```toml
[build]
  command = "npm run build:netlify"
  functions = "netlify/functions"
  publish = "dist/spa"

[build.environment]
  NODE_VERSION = "20"

[functions]
  external_node_modules = ["express", "sqlite3", "multer", "serverless-http"]
  node_bundler = "esbuild"

# API redirects - MUST come first
[[redirects]]
  force = true
  from = "/api/*"
  status = 200
  to = "/.netlify/functions/api/:splat"

# SPA fallback - MUST come last
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    cache-control = "public, max-age=31536000, immutable"
```

### Fix 2: Verify Build Output

Check that your build creates the right files:

```bash
# Build locally
npm run build:netlify

# Check output
ls -la dist/spa/
# Should show:
# index.html
# assets/
# favicon.ico
# robots.txt
```

### Fix 3: Clear and Redeploy

1. Go to Netlify dashboard
2. **Site settings** → **Build & deploy**
3. Click **"Clear cache and deploy site"**
4. Wait for fresh build

### Fix 4: Check Domain Configuration

If using custom domain:

1. **Site settings** → **Domain management**
2. Verify DNS configuration
3. Check if domain is properly pointed to Netlify

## 🔧 Advanced Troubleshooting

### Check Build Logs

1. Go to Netlify dashboard
2. Click on latest deploy
3. View **build logs** for errors:
   - Build command failed?
   - Files not copied correctly?
   - Permission errors?

### Check Function Logs

If API calls are failing:

1. **Functions** tab in Netlify dashboard
2. Check function execution logs
3. Look for serverless function errors

### Verify File Structure

Your `dist/spa/` should contain:

```
dist/spa/
├── index.html          # Main app entry
├── assets/
│   ├── index-[hash].js # Your React app
│   └── index-[hash].css # Styles
├── favicon.ico
└── robots.txt
```

## 🚀 Quick Emergency Fix

If you need immediate access, try this minimal `_redirects` file:

Create `code/public/_redirects`:

```
# API routes
/api/*  /.netlify/functions/api/:splat  200

# SPA fallback
/*  /index.html  200
```

Then redeploy.

## 🎯 Step-by-Step Fix Process

### Step 1: Check Current Deployment

1. Go to your Netlify site URL
2. Open browser developer tools (F12)
3. Check **Console** and **Network** tabs for errors

### Step 2: Verify Build Settings

In Netlify dashboard:

- **Build command:** `npm run build:netlify`
- **Publish directory:** `dist/spa`
- **Functions directory:** `netlify/functions`

### Step 3: Check redirects Order

Redirects are processed in order. API redirects MUST come before SPA fallback:

```toml
# ✅ Correct order
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Test Locally

```bash
# Build and serve locally
npm run build:netlify
cd dist/spa
python -m http.server 8000
# or
npx serve .
```

Visit `http://localhost:8000` - if it works locally, it's a Netlify config issue.

## 🆘 If Nothing Works

### Emergency Deployment Option

Create a simple `index.html` in your root directory:

```html
<!doctype html>
<html>
  <head>
    <title>Site Under Maintenance</title>
    <meta http-equiv="refresh" content="5;url=/dist/spa/index.html" />
  </head>
  <body>
    <h1>Loading...</h1>
    <p>
      If you're not redirected, <a href="/dist/spa/index.html">click here</a>
    </p>
  </body>
</html>
```

### Contact Support

If the 403 persists:

1. **Netlify Support:** [support.netlify.com](https://support.netlify.com)
2. **Community Forums:** [community.netlify.com](https://community.netlify.com)
3. **Share your site URL** and build logs

## ✅ Success Indicators

Your site is fixed when:

- ✅ Homepage loads without 403
- ✅ Navigation between pages works
- ✅ API calls respond (if using backend)
- ✅ Direct URL access works (e.g., `/business-directory`)

## 🔍 Debug Commands

Use these to diagnose:

```bash
# Check DNS
nslookup yourdomain.com

# Test specific routes
curl -I https://your-site.netlify.app
curl -I https://your-site.netlify.app/business-directory
curl -I https://your-site.netlify.app/api/demo
```

Most 403 errors are solved by fixing the SPA redirects in `netlify.toml`! 🎉
