# DigitalOcean App Platform Deployment Guide

## 🚀 Quick Deployment

### Prerequisites

- GitHub repository with your code
- DigitalOcean account
- `doctl` CLI installed (optional)

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Ready for DigitalOcean deployment"
git push origin main
```

### 2. Deploy via DigitalOcean Dashboard

1. **Login to DigitalOcean** → Go to Apps
2. **Create App** → Choose "GitHub" as source
3. **Select Repository** → Choose your repo and `main` branch
4. **Configure App** → Use provided `.do/app.yaml` configuration
5. **Add Environment Variables:**
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   NETLIFY_ACCESS_TOKEN=your_netlify_token
   NETLIFY_SITE_ID=your_site_id
   NODE_ENV=production
   PORT=8080
   ```
6. **Launch App** → Click "Create Resources"

### 3. Database Setup

After deployment, run the migration:

```bash
# Install doctl CLI
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Connect to your app
doctl apps list
doctl apps logs <APP_ID>

# Run database migration
node scripts/migrate-to-postgres.js
```

## 📁 File Structure

```
code/
├── .do/
│   └── app.yaml                 # DigitalOcean app configuration
├── scripts/
│   └── migrate-to-postgres.js   # Database migration script
├── Dockerfile                   # Container configuration
├── .dockerignore               # Docker ignore file
└── DEPLOYMENT.md               # This file
```

## 🔧 Environment Variables

Required environment variables for production:

| Variable                | Description                  | Required |
| ----------------------- | ---------------------------- | -------- |
| `DATABASE_URL`          | PostgreSQL connection string | ✅       |
| `GOOGLE_PLACES_API_KEY` | Google Places API key        | ✅       |
| `NETLIFY_ACCESS_TOKEN`  | Netlify API token            | ⚠️       |
| `NETLIFY_SITE_ID`       | Netlify site ID              | ⚠️       |
| `NODE_ENV`              | Environment (production)     | ✅       |
| `PORT`                  | Application port (8080)      | ✅       |

## 💾 Database Migration

### Current Status

- **SQLite Database:** 871 businesses, 3,851 reviews, 4,072 photos
- **Target:** PostgreSQL on DigitalOcean

### Migration Steps

1. **Create PostgreSQL database** (via DigitalOcean dashboard)
2. **Run migration script:**
   ```bash
   export DATABASE_URL="postgresql://user:pass@host:port/db"
   node scripts/migrate-to-postgres.js
   ```
3. **Verify migration:**
   ```bash
   # Check counts
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM businesses;"
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM reviews;"
   ```

## 🖼️ Photo Storage Options

### Option 1: DigitalOcean Spaces (Recommended)

```bash
# Configure Spaces
export SPACES_ACCESS_KEY=your_access_key
export SPACES_SECRET_KEY=your_secret_key
export SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
export SPACES_BUCKET=your-bucket-name
```

### Option 2: Keep Current Netlify CDN

- Photos will continue serving from Netlify
- No migration needed for existing 4,072 photos

## 🔄 Auto-Deployment Workflow

### GitHub Integration (Automatic)

```yaml
# .github/workflows/deploy.yml
name: DigitalOcean Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Deployment
        run: echo "DigitalOcean auto-deploys on push"
```

### Manual Deployment Control

```bash
# Disable auto-deploy in DO dashboard
# Use manual deploy button when ready
```

## 📊 Cost Breakdown

### DigitalOcean App Platform Pricing

- **Basic App:** $5/month
- **PostgreSQL Database:** $15/month (Basic)
- **Total:** ~$20/month

### Included Features

- ✅ SSL certificates
- ✅ Auto-scaling
- ✅ GitHub integration
- ✅ Monitoring & logs
- ✅ Custom domains

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**

```bash
# Check logs
doctl apps logs <APP_ID> --type build

# Common fixes
- Ensure package.json has correct build scripts
- Check Node.js version compatibility
- Verify all dependencies are listed
```

**Database Connection:**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
doctl apps list
doctl apps spec get <APP_ID>
```

**Photo Loading Issues:**

```bash
# Check photo URLs in database
psql $DATABASE_URL -c "SELECT logo_url FROM businesses LIMIT 5;"

# Update photo URLs if needed
UPDATE businesses SET logo_url = REPLACE(logo_url, 'old_domain', 'new_domain');
```

## 📞 Support Commands

```bash
# View app status
doctl apps list

# View logs
doctl apps logs <APP_ID>

# Update app configuration
doctl apps update <APP_ID> --spec .do/app.yaml

# Scale app
doctl apps update <APP_ID> --spec .do/app.yaml

# Database connection info
doctl databases connection <DB_ID>
```

## 🎯 Post-Deployment Checklist

- [ ] App builds successfully
- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] SSL certificate active
- [ ] Custom domain connected (optional)
- [ ] Photo URLs updated
- [ ] Reviews displaying correctly
- [ ] Search functionality working
- [ ] Admin dashboard accessible

## 📈 Performance Optimization

### Recommended Settings

```yaml
# In .do/app.yaml
instance_size_slug: basic-s # Upgrade for better performance
instance_count: 2 # For high availability
```

### Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY idx_businesses_name ON businesses(name);
CREATE INDEX CONCURRENTLY idx_businesses_location ON businesses(lat, lng);
```

## 🔐 Security Considerations

- All environment variables stored as secrets
- Database uses SSL connections
- Regular automated backups
- HTTPS enforced by default
- CORS configured for API endpoints

---

**Need Help?**

- DigitalOcean Documentation: https://docs.digitalocean.com/products/app-platform/
- Support: Create ticket in DigitalOcean dashboard
