# 🚀 Deployment Guide for reportvisascam.com

## Current Status

The website files are ready but not deployed to reportvisascam.com due to FTP connection timeouts.

## Files Ready for Upload

All files are prepared in `code/dist/spa/` directory:

### Core Files

- `index.html` - Main React application
- `index.php` - PHP hosting compatibility layer
- `composer.json` - PHP dependency file for Hostinger
- `.htaccess` - Apache routing configuration for React Router
- `favicon.ico` - Website icon
- `robots.txt` - SEO configuration

### Assets Directory

- `assets/` folder containing:
  - CSS files
  - JavaScript bundles
  - Images and other static files

## Manual Deployment Steps

Since automatic FTP deployment is failing, here's how to deploy manually:

### 1. Get Hostinger FTP Credentials

You'll need these from your Hostinger control panel:

- FTP Host: `reportvisascam.com` or `ftp.reportvisascam.com`
- FTP Username: (from Hostinger panel)
- FTP Password: (from Hostinger panel)
- Port: 21

### 2. Upload Files via FTP Client

1. Use an FTP client like FileZilla, WinSCP, or Hostinger's File Manager
2. Connect to your hosting account
3. Navigate to the `public_html` directory (web root)
4. Upload ALL files from `code/dist/spa/` to `public_html/`

### 3. File Upload Checklist

Ensure these files are uploaded to your web root:

- ✅ `index.html`
- ✅ `index.php`
- ✅ `composer.json`
- ✅ `.htaccess`
- ✅ `favicon.ico`
- ✅ `robots.txt`
- ✅ `assets/` directory (with all files inside)

### 4. Verify Deployment

1. Visit https://reportvisascam.com
2. Check that the React app loads properly
3. Test navigation (should work with React Router)
4. Verify the scam reporting theme is active

## Automatic Deployment (if FTP works)

To try automatic deployment with correct credentials:

```bash
# Set your Hostinger FTP credentials
export HOSTINGER_FTP_HOST="reportvisascam.com"
export HOSTINGER_FTP_USER="your_ftp_username"
export HOSTINGER_FTP_PASSWORD="your_ftp_password"

# Run deployment
npm run deploy
```

## Troubleshooting

### If Website Shows Errors

1. Check that all files uploaded correctly
2. Verify `.htaccess` file is present for routing
3. Ensure `index.php` exists for PHP hosting compatibility

### If API Calls Fail

The website is configured for static hosting, so database API calls will show fallback data.

### If Routing Doesn't Work

Ensure `.htaccess` file is uploaded and Apache mod_rewrite is enabled on the hosting.

## Current Website Features

- ✅ Visa scam reporting theme active
- ✅ Shield logo with red/orange gradient
- ✅ "Stop Visa Fraudsters Before They Strike" messaging
- ✅ Search functionality with fallback data
- ✅ Mobile-responsive design
- ✅ React Router for navigation
- ✅ Error handling for API failures

The website is fully prepared and just needs to be uploaded to the hosting server!
