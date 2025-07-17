# 🔍 How to Find Netlify Environment Variables

## You're Currently On Your Website - Need to Go to Netlify Dashboard!

### Step 1: Go to Netlify Dashboard

**🚨 IMPORTANT**: You need to go to the **Netlify admin dashboard**, not your website!

1. Open a **NEW TAB** and go to: [app.netlify.com](https://app.netlify.com)
2. **Sign in** to your Netlify account
3. You should see a **list of your sites**

### Step 2: Find Your Site

Look for your site in the list. It might be named:

- `reportvisascam`
- `reportvisascam-com`
- `business-directory`
- Or something similar

**Click on your site name** (not "Visit site" - click the actual site name)

### Step 3: Navigate to Environment Variables

Once you click on your site name, you'll be in the **Site Dashboard**. Now look for:

#### Option 1: Site Settings Button

- Look for a **"Site settings"** button (usually at the top)
- Click **"Site settings"**

#### Option 2: Settings Tab

- Look for a **"Settings"** tab in the navigation
- Click **"Settings"**

### Step 4: Find Environment Variables

In the site settings, look in the **left sidebar** for:

- **"Environment variables"** (most common)
- Or **"Build & deploy"** → **"Environment"**
- Or **"General"** → **"Environment variables"**

### Step 5: Add Variable

Once you find "Environment variables":

1. Click **"Add variable"** or **"New variable"**
2. **Key**: `NEON_DATABASE_URL`
3. **Value**: Your database connection string
4. Click **"Save"** or **"Create"**

## 🎯 Quick URLs to Try:

If you know your site name, try these direct links:

- `https://app.netlify.com/sites/YOUR-SITE-NAME/settings/env`
- `https://app.netlify.com/sites/YOUR-SITE-NAME/settings/build-deploy#environment-variables`

Replace `YOUR-SITE-NAME` with your actual site name.

## 📱 Visual Clues to Look For:

### ✅ You're in the RIGHT place when you see:

- Netlify logo/branding
- Site dashboard with tabs like "Overview", "Deploys", "Settings"
- Your site name at the top
- Options like "Domain settings", "Build settings", etc.

### ❌ You're in the WRONG place if you see:

- Your actual website content
- "Report Visa Scam" navigation
- Business directory listings
- User-facing content

## 🆘 Still Can't Find It?

### Alternative Method - Netlify CLI:

If you can't find the dashboard, you can set environment variables via command line:

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Link your site: `netlify link`
4. Set variable: `netlify env:set NEON_DATABASE_URL "your-connection-string"`

### Or Use Netlify.toml File:

Add this to your `netlify.toml` file:

```toml
[build.environment]
  NEON_DATABASE_URL = "your-connection-string-here"
```

## 🔗 Direct Link:

The most direct way: Go to [app.netlify.com/sites](https://app.netlify.com/sites) and find your site!

Let me know what you see when you go to app.netlify.com! 🎯
