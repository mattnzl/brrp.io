# Waste Jobs Feature - Testing Guide

## Overview
This document provides instructions for testing the new Waste Jobs feature with PostgreSQL integration.

## Prerequisites

### 1. PostgreSQL Database Setup

Before testing, you need to set up a PostgreSQL database:

```bash
# Install PostgreSQL (if not already installed)
# On Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# On macOS:
brew install postgresql@15
brew services start postgresql@15

# On Windows: Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Run the following SQL commands:
CREATE DATABASE brrp_io;
CREATE USER brrp_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE brrp_io TO brrp_user;
\q
```

### 3. Run Schema Migration

```bash
# From the project root directory
psql postgresql://brrp_user:your_secure_password@localhost:5432/brrp_io -f schema.sql
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database connection
DATABASE_URL=postgresql://brrp_user:your_secure_password@localhost:5432/brrp_io

# Other required variables (optional for local testing)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Starting the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The application will start on http://localhost:3000 (or 3001 if 3000 is in use).

## Testing the Waste Jobs Feature

### 1. Login

Navigate to http://localhost:3000/login and login with one of the test users:

**System Admin**:
- Username: `admin`
- Password: `admin123`

**Company Admin (Aliminary - Waste Management NZ)**:
- Username: `companyadmin`
- Password: `admin123`

**Operator (Aliminary)**:
- Username: `operator`
- Password: `operator123`

### 2. Navigate to Waste Jobs

After logging in, you can access the Waste Jobs page in two ways:
- Click "Waste Jobs" in the navigation
- Navigate directly to http://localhost:3000/waste-jobs

### 3. Create a Waste Job

1. Click the "+ New Waste Job" button
2. Fill in the form:
   - **Customer**: Select "Waste Management NZ" or "enviroNZ"
   - **Waste Stream**: Select one (e.g., "Cow Shed Waste - $210/tonne")
   - **Truck Registration**: Enter a registration (e.g., "ABC123")
   - **Weighbridge Weight**: Enter weight in tonnes (e.g., "25.5")
   - **Notes**: Optional notes
3. Click "Create Waste Job"

The job will be created with status "Pending Approval".

### 4. View Jobs

After creating jobs, you can:
- **View all jobs** in the "All" tab
- **Filter by status** using the tabs: Pending Approval, Approved, Rejected
- **See summary statistics** in the cards at the top
- **Use pagination** at the bottom to navigate through multiple jobs

### 5. Update Job Status

1. Find a job in the table
2. Click the "Actions..." dropdown in the last column
3. Select a new status (e.g., "Approve" or "Reject")

The job status will update and the page will refresh.

### 6. Test Pagination

1. Create multiple jobs (at least 10)
2. Use the "Rows per page" selector to change the number of items displayed
3. Use the "Previous" and "Next" buttons to navigate between pages

## API Testing with cURL

You can also test the API directly using cURL or Postman:

### Create a Waste Job

```bash
curl -X POST http://localhost:3000/api/waste-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "id": "cust-wmnz",
      "name": "Waste Management NZ",
      "type": "WASTE_MANAGEMENT_NZ"
    },
    "wasteStream": "COW_SHED_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 25.5,
    "notes": "Test job",
    "companyId": "comp-001",
    "companyName": "Aliminary"
  }'
```

### List All Waste Jobs

```bash
curl http://localhost:3000/api/waste-jobs
```

### List Pending Jobs

```bash
curl "http://localhost:3000/api/waste-jobs?status=Pending%20Approval"
```

### Update Job Status

Replace `[JOB_ID]` with an actual job ID:

```bash
curl -X PATCH http://localhost:3000/api/waste-jobs/[JOB_ID] \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```

## Verification Checklist

- [ ] Database connection successful
- [ ] Schema created successfully with all indexes
- [ ] Application starts without errors
- [ ] Can login as different user roles
- [ ] Can navigate to Waste Jobs page
- [ ] Can create a new waste job
- [ ] Job appears in the table immediately after creation
- [ ] Job number is auto-generated correctly
- [ ] Total price is calculated correctly
- [ ] Summary cards show correct counts
- [ ] Can filter by status using tabs
- [ ] Can update job status via Actions dropdown
- [ ] Pagination works correctly
- [ ] Company scoping works for Company Admin/Operator
- [ ] Export Report button is visible (functionality to be implemented)
- [ ] Marketplace status shows as "Not Listed" (placeholder)
- [ ] Form validation works (required fields, weight > 0)
- [ ] Error messages display correctly
- [ ] Mobile responsive design works

## Known Limitations

1. **Export Report**: Button is present but functionality not yet implemented
2. **Marketplace Status**: Shows "Not Listed" placeholder - actual functionality to be added later
3. **Bulk Actions**: Checkboxes are present but bulk actions not yet implemented
4. **Real-time Updates**: Changes require manual refresh or re-fetching

## Troubleshooting

### Database Connection Errors

If you see "DATABASE_URL environment variable is not set":
- Ensure `.env.local` exists with the correct DATABASE_URL
- Restart the dev server after creating/modifying `.env.local`

### "relation waste_jobs does not exist"

- Make sure you ran the schema.sql file against your database
- Verify the database name in your DATABASE_URL matches the created database

### Port Already in Use

- The app will try port 3001 if 3000 is busy
- Or stop the process using port 3000: `lsof -ti:3000 | xargs kill`

## Performance Notes

- The API supports pagination with up to 100 items per page
- All queries use indexes on created_at, status, and company_id for efficient filtering
- Job numbers are unique and indexed for fast lookups

## Security Considerations

- All API requests should validate user authentication (to be implemented)
- Company-scoped queries prevent unauthorized access to other companies' data
- Input validation prevents SQL injection and invalid data

## Next Steps

After successful testing:
1. Implement authentication middleware for API routes
2. Add export functionality for waste job reports
3. Implement marketplace status tracking
4. Add bulk actions (approve/reject multiple jobs)
5. Add more detailed filtering options (date ranges, customer filters, etc.)
6. Implement real-time updates with WebSockets or polling
