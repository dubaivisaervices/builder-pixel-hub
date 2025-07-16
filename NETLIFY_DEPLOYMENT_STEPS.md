# 🚀 Complete Netlify Deployment Guide

## Step 1: Prepare Your Project

### 1.1 Ensure Your Code is Ready

```bash
# Make sure you're in the project directory
cd code

# Test the build locally
npm run build:netlify

# Verify everything works
npm run dev
```

### 1.2 Push to GitHub/GitLab (If Not Already Done)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for Netlify deployment"

# Create repository on GitHub/GitLab, then:
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Step 2: Deploy to Netlify

### 2.1 Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign Up"**
3. Choose **"GitHub"**, **"GitLab"**, or **"Bitbucket"** to sign up
4. Authorize Netlify to access your repositories

### 2.2 Deploy Your Site

1. **Click "Add new site"** in your Netlify dashboard
2. **Select "Import an existing project"**
3. **Choose your Git provider** (GitHub/GitLab/Bitbucket)
4. **Select your repository** from the list
5. **Configure build settings:**

   - **Branch to deploy:** `main` (or your default branch)
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `dist/spa`
   - **Functions directory:** `netlify/functions`

   _(These are already configured in your `netlify.toml` file)_

6. **Click "Deploy site"**

### 2.3 Wait for Build to Complete

- Build typically takes 2-5 minutes
- You'll see a random URL like: `https://amazing-tesla-123456.netlify.app`
- Your site is now live!

## Step 3: Set Up Environment Variables (If Needed)

### 3.1 Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add any required variables:
   ```
   GOOGLE_API_KEY=your_actual_api_key
   GOOGLE_PLACES_API_KEY=your_actual_places_key
   DATABASE_URL=your_database_url
   ```
3. **Save** and **redeploy** if you added variables

## Step 4: Set Up Custom Domain

### 4.1 Buy a Domain (If You Don't Have One)

Popular domain registrars:

- **Namecheap** (recommended - affordable)
- **GoDaddy**
- **Google Domains**
- **Cloudflare Registrar**

### 4.2 Add Domain to Netlify

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **"Verify"**

### 4.3 Configure DNS

You have two options:

#### Option A: Use Netlify DNS (Recommended - Easiest)

1. Netlify will show you **4 nameservers** like:
   ```
   dns1.p03.nsone.net
   dns2.p03.nsone.net
   dns3.p03.nsone.net
   dns4.p03.nsone.net
   ```
2. **Go to your domain registrar** (where you bought the domain)
3. **Find DNS/Nameserver settings**
4. **Replace the nameservers** with Netlify's nameservers
5. **Save changes** (takes 24-48 hours to propagate)

#### Option B: Keep Your Current DNS

1. In your DNS provider, add these records:

   ```
   Type: A
   Name: @ (or yourdomain.com)
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   ```

### 4.4 Enable HTTPS

1. Once DNS propagates, go to **Site settings** → **Domain management**
2. Click **"Verify DNS configuration"**
3. Netlify will automatically provision an **SSL certificate**
4. Enable **"Force HTTPS"** to redirect all HTTP traffic to HTTPS

## Step 5: Configure Redirects and Subdomain (Optional)

### 5.1 Set Up www Redirect

1. Add both `yourdomain.com` and `www.yourdomain.com` in Netlify
2. Set one as primary (usually non-www)
3. Netlify will automatically redirect the other

### 5.2 Custom Redirects (If Needed)

Your `netlify.toml` already includes SPA redirects, but you can add more:

```toml
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

## Step 6: Test and Monitor

### 6.1 Test Your Live Site

1. **Visit your domain** and test all functionality:
   - ✅ Homepage loads correctly
   - ✅ Navigation works
   - ✅ API endpoints respond
   - ✅ Business directory functions
   - ✅ Search functionality
   - ✅ Mobile responsiveness

### 6.2 Set Up Monitoring

1. **Netlify Analytics** (in Site settings)
2. **Uptime monitoring** services like:
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

## Step 7: Ongoing Management

### 7.1 Automatic Deployments

- Every time you push to your main branch, Netlify automatically deploys
- Check deployment status in Netlify dashboard

### 7.2 Branch Previews (Optional)

- Enable deploy previews for pull requests
- Test changes before merging to main

### 7.3 Rollback if Needed

- Go to **Site settings** → **Deploys**
- Click **"Published deploy"** on any previous version
- Click **"Publish deploy"** to rollback

## 🎉 Congratulations!

Your Dubai Business Directory is now live on the internet!

## Quick Summary Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Netlify account created
- [ ] Site deployed to Netlify
- [ ] Environment variables added (if needed)
- [ ] Custom domain purchased
- [ ] DNS configured
- [ ] HTTPS enabled
- [ ] Site tested and working
- [ ] Monitoring set up

## 🆘 Troubleshooting

### Build Fails

- Check **Build logs** in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version is set to 20

### Domain Not Working

- Wait 24-48 hours for DNS propagation
- Use [DNS Checker](https://dnschecker.org) to verify propagation
- Double-check nameservers at your registrar

### Functions Not Working

- Check **Function logs** in Netlify dashboard
- Verify `serverless-http` dependency is installed
- Ensure API routes are properly configured

### Need Help?

- Netlify Documentation: [docs.netlify.com](https://docs.netlify.com)
- Netlify Community Forums
- Contact your domain registrar for DNS help

---

**Your website will be live at:** `https://yourdomain.com` 🌍
