# AWS S3 Setup Instructions for Dubai Business Directory

## Current Configuration

- **Bucket Name**: dubai-business-images
- **Username**: dubai-business-s3-user
- **Access Key**: AKIAZ6UGK7KXSLESVQFG
- **Secret Key**: ❌ NEEDED

## Steps to Get Secret Access Key

### Option 1: Find Existing Secret Key

1. Login to AWS Console
2. Go to IAM → Users → dubai-business-s3-user
3. Click "Security credentials" tab
4. Look for the access key ending in VQFG
5. If you can see the secret, copy it

### Option 2: Create New Access Key (Recommended)

1. Login to AWS Console
2. Go to IAM → Users → dubai-business-s3-user
3. Click "Security credentials" tab
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Copy both Access Key ID and Secret Access Key
7. Update the .env file with new credentials

### Option 3: Check Previous Documentation

- Look for saved credentials in password managers
- Check previous setup documentation
- Look in other configuration files

## Required Permissions for S3 User

The user should have these permissions for the bucket:

- s3:GetObject
- s3:PutObject
- s3:DeleteObject
- s3:ListBucket

## Test Configuration

Once you have the secret key, test it by:

1. Going to /admin
2. Clicking "S3 Storage" tab
3. Checking configuration status
4. Upload a test image
