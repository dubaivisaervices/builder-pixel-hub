# 📊 Dubai Visa Services - Data Persistence & Backup System

Complete guide for saving all business listings, reviews, and images to database and GitHub.

## 🚀 Quick Start

1. **Setup GitHub Storage** (one-time setup):

   ```bash
   cd scripts
   npm install
   node setup-github-storage.js
   ```

2. **Access Data Persistence Dashboard**:
   - Go to: http://localhost:3000/data-persistence
   - Click "Save All Data" to backup everything
   - Use "Export Backup" for JSON file download

## 🏗️ System Architecture

### Database Layer (SQLite)

- **Location**: `server/database/dubai_businesses.db`
- **Tables**:
  - `businesses` - All business data with base64 images
  - `reviews` - All reviews and ratings
- **Features**: Indexes for fast search, foreign key constraints

### GitHub Storage Layer

- **Purpose**: Cloud backup for business images
- **Repository**: Automatically created if doesn't exist
- **Structure**: `/business-images/{businessId}/[logo.jpg, photo_1.jpg, ...]`
- **Access**: Public repository with direct image URLs

### API Endpoints

#### Data Persistence

- `POST /api/admin/save-all-data` - Save everything to database + GitHub
- `GET /api/admin/persistence-status` - Check system status
- `GET /api/admin/export-data` - Download complete backup
- `POST /api/admin/save-images/{businessId}` - Save specific business images

## 📋 Setup Instructions

### 1. GitHub Configuration

**Get Personal Access Token**:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Copy the token (keep it safe!)

**Environment Setup**:

```bash
# Copy example env file
cp .env.example .env

# Set your GitHub credentials in .env:
GITHUB_TOKEN=your_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=dubai-visa-services-images
```

### 2. Database Setup

Database is automatically initialized on first run with:

- Business table with all fields including image storage
- Reviews table with foreign key relations
- Proper indexes for performance
- Auto-timestamps for tracking

### 3. Run Setup Script

```bash
cd scripts
npm install
node setup-github-storage.js
```

Follow the interactive prompts to configure GitHub storage.

## 🎯 Features

### ✅ Complete Data Preservation

- **All 840+ business listings** saved to SQLite database
- **Complete reviews and ratings** with user data
- **Business images** saved as base64 AND uploaded to GitHub
- **Metadata preservation** (hours, contact info, categories)

### ✅ Redundant Storage

- **Local Database**: SQLite file with all data
- **GitHub Cloud**: Repository with all business images
- **JSON Export**: Complete backup file for migration

### ✅ Admin Interface

- **Status Dashboard**: Real-time system health
- **One-Click Backup**: Save all data instantly
- **Export Functionality**: Download complete backup
- **Error Reporting**: Detailed logs and error handling

## 🔧 API Usage Examples

### Save All Data

```javascript
const response = await fetch("/api/admin/save-all-data", {
  method: "POST",
});
const result = await response.json();

console.log(`Saved: ${result.savedBusinesses} businesses`);
console.log(`GitHub Images: ${result.githubImages}`);
```

### Export Backup

```javascript
const response = await fetch("/api/admin/export-data");
const blob = await response.blob();
// Creates downloadable JSON file
```

### Check Status

```javascript
const response = await fetch("/api/admin/persistence-status");
const status = await response.json();

console.log("Database:", status.database);
console.log("GitHub:", status.github);
```

## 📁 File Structure

```
project/
├── server/
│   ├── database/
│   │   ├── database.ts           # SQLite connection & tables
│   │   ├── businessService.ts    # Business data operations
│   │   └── dubai_businesses.db   # SQLite database file
│   └── routes/
│       └── data-persistence.ts   # API endpoints
├── client/
│   └── pages/
│       └── DataPersistence.tsx   # Admin interface
├── scripts/
│   ├── setup-github-storage.js  # Setup script
│   └── package.json
├── .env                          # Environment configuration
└── DATA_PERSISTENCE.md          # This documentation
```

## 🔍 Database Schema

### businesses Table

```sql
CREATE TABLE businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  lat REAL, lng REAL,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  category TEXT,
  business_status TEXT,
  photo_reference TEXT,
  logo_url TEXT,
  logo_base64 TEXT,              -- Base64 encoded logo
  is_open BOOLEAN,
  price_level INTEGER,
  has_target_keyword BOOLEAN DEFAULT FALSE,
  hours_json TEXT,               -- JSON string for hours
  photos_json TEXT,              -- JSON string for photo URLs
  photos_local_json TEXT,        -- JSON string for base64 photos
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### reviews Table

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  time_ago TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);
```

## 🛡️ Data Safety & Recovery

### Backup Strategy

1. **Real-time**: All data saved to local SQLite database
2. **Cloud Backup**: Images uploaded to GitHub repository
3. **Export Option**: Complete JSON backup for migration
4. **Version Control**: GitHub provides version history

### Recovery Process

1. **Database Loss**: Re-run sync to rebuild from API + JSON backup
2. **Image Loss**: GitHub repository serves as image backup
3. **Complete Migration**: Use JSON export to move to new system

## 🚨 Troubleshooting

### GitHub Token Issues

```bash
# Test your token manually:
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### Database Permissions

```bash
# Check database file permissions:
ls -la server/database/dubai_businesses.db
```

### API Connection

```bash
# Test local API:
curl http://localhost:3000/api/admin/persistence-status
```

## 📊 Performance Considerations

- **Database**: SQLite with indexes for fast queries
- **Images**: Base64 encoding for immediate access, GitHub for backup
- **API**: Batched operations to prevent timeouts
- **Memory**: Streaming for large data exports

## 🔮 Future Enhancements

- [ ] Automated daily backups
- [ ] Multiple GitHub repository support
- [ ] S3/AWS storage integration
- [ ] Real-time sync monitoring
- [ ] Backup scheduling
- [ ] Data validation checks

## 📞 Support

For issues or questions:

1. Check the Data Persistence dashboard at `/data-persistence`
2. Review API logs in browser developer tools
3. Verify .env configuration
4. Test GitHub token permissions

---

**✅ System Status**: Ready for production use with complete data persistence, backup, and recovery capabilities!
