# Fraud Immigration Consultants Feature

## 🎯 Overview

New page that lists immigration and visa consultants that have been flagged by the community for suspicious or fraudulent activities.

## 📍 Page Location

- **URL:** `/fraud-immigration-consultants`
- **Component:** `FraudImmigrationConsultants.tsx`
- **Navigation:** Added to main navigation as "Fraud Consultants"

## 🔍 Target Categories

The page filters businesses with these categories/names:

- Visa agent
- Immigration consultants
- Visa consultants
- Immigration Services
- Visa Services
- Work Visa
- Visa consulting services
- Registered visa agent
- Migration services
- Overseas consultants
- Abroad consultants
- Student visa
- Business visa
- Tourist visa
- Family visa
- Residence visa

## 📋 Features

### Display Format (as requested):

- ✅ **Company name** (clickable - links to business profile)
- ✅ **Address** (with location icon)
- ✅ **Write a Report** button (links to complaint form)
- ✅ **Total number of community reports** (displayed prominently)

### Additional Features:

- **Search functionality** - Filter by name, location, or category
- **Category filtering** - Dropdown to filter by specific service types
- **Contact information** - Phone, website, email when available
- **Warning alerts** - Clear warnings about verifying credentials
- **Responsive design** - Works on all devices
- **Community statistics** - Total consultants and reports

## 🚀 Navigation Access Points

1. **Main Navigation:** "Fraud Consultants" tab
2. **Homepage:** Red warning section with call-to-action
3. **Footer:** Under Support section
4. **Direct URL:** `/fraud-immigration-consultants`

## 🔗 Integration

### API Endpoints Used:

- `GET /api/businesses` - Fetches all businesses
- `GET /api/reports/company/:id` - Gets report count for each business

### Connected Features:

- **Business profiles** - Clicking company name navigates to `/reviews/location/company-name`
- **Report system** - "Write a Report" button navigates to `/complaint?company=name&id=id`
- **Existing navigation** - Integrated with current menu system

## 🎨 Design

- **Color scheme:** Red/orange/yellow gradient (warning theme)
- **Icons:** Shield, Alert Triangle, Building, File Text
- **Layout:** Card-based listing with clear hierarchy
- **Responsive:** Mobile-friendly design

## 📊 Data Structure

Each business listing shows:

```typescript
{
  id: string,
  name: string,
  address: string,
  phone?: string,
  website?: string,
  email?: string,
  category: string,
  reportCount: number
}
```

## ⚠️ User Experience

- **Clear warnings** about verifying credentials
- **Community-driven** approach to identifying issues
- **Easy reporting** process for new issues
- **Informative display** of all relevant business information
- **Professional presentation** while maintaining warning tone

## 🔧 Technical Implementation

- **React component** with TypeScript
- **Real-time filtering** of businesses by categories
- **API integration** for dynamic report counts
- **Error handling** with fallback sample data
- **Performance optimized** with proper state management

## 🎯 Purpose

Helps protect the UAE community by:

1. **Identifying** problematic immigration consultants
2. **Warning** users about reported issues
3. **Encouraging** community reporting
4. **Providing** transparency about service providers
5. **Building** a safer immigration service ecosystem

The feature successfully implements the requested format while providing a comprehensive fraud prevention tool for the community.
