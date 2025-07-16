# 🗄️ Hostinger MySQL Database Setup

## Current Status

- ✅ Website is live with static JSON data
- ❌ No MySQL database (data is in JSON file)
- 🎯 Goal: Create MySQL database visible in Hostinger panel

## Step 1: Create Database in Hostinger cPanel

1. **Login to Hostinger cPanel**
2. **Go to:** "MySQL Databases" section
3. **Create new database:**
   - Database name: `reportvisascam_businesses`
4. **Create database user:**
   - Username: `reportvisascam_user`
   - Password: `[Strong Password]`
5. **Add user to database** with "All Privileges"

## Step 2: Get Database Connection Details

From Hostinger cPanel, note:

- **Host:** Usually `localhost` or specific hostname
- **Database:** `u611952859_reportvisascam_businesses`
- **Username:** `u611952859_reportvisascam_user`
- **Password:** [Your chosen password]

## Step 3: Update Configuration

Edit `code/.env`:

```env
# MySQL Database Configuration (Hostinger)
MYSQL_HOST=localhost
MYSQL_USER=u611952859_reportvisascam_user
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=u611952859_reportvisascam_businesses
MYSQL_PORT=3306
```

## Step 4: Run Database Setup

```bash
# Install MySQL dependency
npm install mysql2

# Update the MySQL config in setup-mysql.js
# Then run:
node setup-mysql.js
```

## Step 5: Update Website to Use MySQL

You'll need to:

1. Create API endpoints that connect to MySQL
2. Update frontend to use API instead of JSON file
3. Deploy the backend code to Hostinger

## Alternative: Keep Current Setup

**Pros of current JSON setup:**

- ✅ Faster loading (no database queries)
- ✅ Works perfectly for 841 businesses
- ✅ No server-side code needed
- ✅ Easier to maintain

**Pros of MySQL setup:**

- ✅ Shows in Hostinger database panel
- ✅ Can add admin features to modify data
- ✅ Better for dynamic content
- ✅ More traditional database approach

## Recommendation

For a reporting platform with 841 static businesses, the **current JSON setup is optimal**. Only switch to MySQL if you need:

- Dynamic data updates through admin panel
- User-generated content (reports, reviews)
- Complex queries and analytics

---

**Need help deciding?** The current setup works great and is live. MySQL is only needed if you want to see/manage data through Hostinger's database panel.
