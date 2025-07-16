# Deploy to Netlify - Complete Guide

This guide will help you deploy your Dubai Business Directory to Netlify.

## 🚀 Quick Deploy (Recommended)

### Option 1: Git-based Deployment (Best for ongoing development)

1. **Push to GitHub/GitLab**

   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**

   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab)
   - Select your repository

3. **Configure Build Settings**

   - **Build command**: `npm run build:client`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`

   These are already configured in `netlify.toml`, so Netlify will detect them automatically.

4. **Deploy**
   - Click "Deploy site"
   - Your site will be available at a random Netlify URL
   - Set up a custom domain in Site settings if desired

### Option 2: Manual Deployment

1. **Build the project locally**

   ```bash
   npm run build:client
   ```

2. **Deploy via Netlify CLI**

   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy from the dist/spa directory
   cd dist/spa
   netlify deploy --prod --dir .
   ```

## ⚙️ Environment Variables

If your app uses API keys or environment variables:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add any required environment variables from `.env.example`:
   ```
   GOOGLE_API_KEY=your_key_here
   GOOGLE_PLACES_API_KEY=your_key_here
   DATABASE_URL=your_database_url_here
   ```

## 🗄️ Database Considerations

Your app uses SQLite, which works locally but may need adjustments for production:

### Option A: Keep SQLite (Temporary Data)

- SQLite file will be recreated on each deployment
- Good for testing, not for persistent data

### Option B: External Database (Recommended for Production)

- Consider upgrading to PostgreSQL or MySQL
- Use services like:
  - **Neon** (Serverless Postgres) - Free tier available
  - **PlanetScale** (MySQL) - Free tier available
  - **Railway** (PostgreSQL/MySQL) - Free tier available

## 📁 File Uploads

Your app has file upload functionality. For production, consider:

1. **Netlify Forms** (for simple forms)
2. **Cloudinary** (for image uploads)
3. **AWS S3** (for general file storage)

## 🔧 Custom Domain Setup

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow DNS setup instructions
4. SSL certificate will be automatically provisioned

## 🏃‍♂️ CI/CD Pipeline

Once connected to Git, every push to your main branch will:

1. Automatically trigger a new build
2. Deploy the updated site
3. Run your build command (`npm run build:client`)
4. Deploy functions automatically

## 🐛 Troubleshooting

### Build Failures

- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- TypeScript errors won't prevent deployment but should be fixed

### Function Errors

- Check function logs in Netlify dashboard
- Ensure database connections work in serverless environment
- File uploads may need external storage service

### Performance

- Enable asset optimization in Netlify dashboard
- Use edge caching for static assets
- Consider implementing image optimization

## �� What's Configured

✅ **Build Process**: Optimized for Netlify  
✅ **SPA Routing**: All routes fallback to index.html  
✅ **API Functions**: Express server converted to serverless  
✅ **Security Headers**: Added for production  
✅ **Caching**: Long-term caching for static assets  
✅ **Redirects**: API calls properly routed to functions

## 📈 After Deployment

1. **Test all functionality**

   - Frontend pages load correctly
   - API endpoints work
   - Database operations function

2. **Monitor performance**

   - Check Netlify analytics
   - Monitor function execution times
   - Watch for any errors in logs

3. **Set up monitoring** (Optional)
   - Connect error tracking (Sentry)
   - Set up uptime monitoring
   - Configure alert notifications

## 💡 Pro Tips

- Use **branch deploys** for testing features
- Set up **deploy previews** for pull requests
- Enable **form handling** for contact forms
- Use **Netlify Analytics** for traffic insights
- Consider **Netlify Identity** for user authentication

## 🆘 Need Help?

- Check Netlify documentation: [docs.netlify.com](https://docs.netlify.com)
- Join Netlify community forums
- Review deployment logs for specific error messages

---

Your Dubai Business Directory is now ready for the world! 🌍
