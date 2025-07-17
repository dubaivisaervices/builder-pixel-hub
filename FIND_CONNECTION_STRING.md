# 🔍 How to Find Your Neon Connection String

## Visual Step-by-Step Guide

### Step 1: Go to Neon Dashboard

1. Open [console.neon.tech](https://console.neon.tech)
2. Sign in to your account
3. You should see your project dashboard

### Step 2: Find Connection Details

Look for one of these options in your dashboard:

#### Option A: "Connection Details" or "Connect" Button

- Look for a **"Connect"** button or **"Connection Details"** section
- It's usually prominently displayed on the main dashboard

#### Option B: Database Settings

- Click on your project name
- Look for **"Settings"** or **"Database"** tab
- Find **"Connection Details"** or **"Connection String"**

#### Option C: Quick Connect

- Look for a **"Quick Connect"** section
- Often shown as a code block or copyable text

### Step 3: Copy the Connection String

The connection string looks like this:

```
postgresql://username:password@ep-xyz123.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Important:**

- Make sure to copy the **FULL string** including `postgresql://`
- It should start with `postgresql://` and end with `?sslmode=require`
- The password is already included in the string

### Step 4: Alternative - Manual Connection Details

If you can't find the full string, look for these individual pieces:

- **Host**: `ep-xyz123.us-east-1.aws.neon.tech`
- **Database**: `neondb` (or your custom name)
- **Username**: Your username
- **Password**: Your password
- **Port**: `5432`

Then construct the string:

```
postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

## 🚨 Can't Find It? Try These Locations:

1. **Main Dashboard** - Usually prominently displayed
2. **Project Settings** - Click your project → Settings
3. **Database Tab** - Look for a "Database" or "Data" section
4. **Connect Tab** - Some projects have a dedicated "Connect" tab
5. **Overview Page** - Check the project overview/summary

## 📱 Screenshots Guide:

### What to Look For:

- Text starting with `postgresql://`
- A "Copy" button next to connection details
- Section labeled "Connection String" or "Database URL"
- Code block with connection information

### Common Locations:

```
Dashboard → [Your Project] → Connection Details
Dashboard → [Your Project] → Settings → Connection
Dashboard → [Your Project] → Connect → Connection String
```

## ✅ Test Your Connection String:

Once you find it, test if it's correct:

1. It should start with: `postgresql://`
2. It should contain your username and password
3. It should end with: `?sslmode=require`
4. It should be one long line (no line breaks)

Example format:

```
postgresql://user123:abc456@ep-example.us-east-1.aws.neon.tech/dbname?sslmode=require
```

## 🆘 Still Can't Find It?

If you still can't find the connection string:

1. **Create a New Database**: Try creating a fresh project
2. **Check Documentation**: Look for Neon's "Getting Started" guide
3. **Contact Support**: Neon has helpful support docs
4. **Alternative**: We can set up a simpler database solution

Let me know what you see on your screen and I'll help you find it! 🔍
