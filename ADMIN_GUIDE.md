# Admin & Company Management Guide

## Overview

This guide covers the complete company and user management capabilities for God/System Admin and Company Admin users.

## God User (System Admin) Capabilities

### Company Management

**Create a Company:**
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Waste Company Ltd",
    "type": "WASTE_MANAGEMENT_NZ",
    "contactEmail": "contact@newcompany.co.nz",
    "contactPhone": "+64 9 123 4567",
    "address": "123 Main St, Auckland",
    "logoUrl": "/uploads/company-logo.png"
  }'
```

**List All Companies:**
```bash
curl http://localhost:3000/api/companies
```

**Get Specific Company:**
```bash
curl http://localhost:3000/api/companies/{companyId}
```

**Update Company:**
```bash
curl -X PATCH http://localhost:3000/api/companies/{companyId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "logoUrl": "/uploads/new-logo.png",
    "contactEmail": "new-email@company.co.nz"
  }'
```

**Delete Company (Soft Delete):**
```bash
curl -X DELETE http://localhost:3000/api/companies/{companyId}
```

### User Management

**Create a User:**
```bash
# System Admin
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "email": "admin@company.co.nz",
    "password": "secure_password",
    "role": "SYSTEM_ADMIN",
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "/uploads/john-photo.jpg"
  }'

# Company Admin (must include companyId)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "company_admin",
    "email": "admin@company.co.nz",
    "password": "secure_password",
    "role": "COMPANY_ADMIN",
    "companyId": "uuid-of-company",
    "firstName": "Jane",
    "lastName": "Smith",
    "photoUrl": "/uploads/jane-photo.jpg",
    "createdBy": "uuid-of-creator"
  }'

# Operator (must include companyId)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator1",
    "email": "operator@company.co.nz",
    "password": "secure_password",
    "role": "OPERATOR",
    "companyId": "uuid-of-company",
    "firstName": "Bob",
    "lastName": "Wilson",
    "createdBy": "uuid-of-creator"
  }'
```

**List All Users:**
```bash
# All users
curl http://localhost:3000/api/users

# Users for specific company
curl http://localhost:3000/api/users?companyId={companyId}
```

**Get Specific User:**
```bash
curl http://localhost:3000/api/users/{userId}
```

**Update User:**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated First",
    "lastName": "Updated Last",
    "email": "new-email@company.co.nz",
    "photoUrl": "/uploads/new-photo.jpg",
    "role": "COMPANY_ADMIN",
    "companyId": "new-company-uuid"
  }'
```

**Assign User to Different Company:**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "new-company-uuid"
  }'
```

**Change User Role:**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "role": "COMPANY_ADMIN"
  }'
```

**Update User Password:**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "password": "new_secure_password"
  }'
```

**Delete User (Soft Delete):**
```bash
curl -X DELETE http://localhost:3000/api/users/{userId}
```

### File Uploads

**Upload Company Logo:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/logo.png"

# Response:
# { "url": "/uploads/1234567890-abc123.png", "filename": "1234567890-abc123.png" }

# Then update company:
curl -X PATCH http://localhost:3000/api/companies/{companyId} \
  -H "Content-Type: application/json" \
  -d '{
    "logoUrl": "/uploads/1234567890-abc123.png"
  }'
```

**Upload User Photo:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/photo.jpg"

# Response:
# { "url": "/uploads/1234567890-xyz789.jpg", "filename": "1234567890-xyz789.jpg" }

# Then update user:
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "/uploads/1234567890-xyz789.jpg"
  }'
```

### Create Waste Job Manually

**As God User:**
```bash
curl -X POST http://localhost:3000/api/waste-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "id": "cust-wmnz",
      "name": "Waste Management NZ",
      "type": "WASTE_MANAGEMENT_NZ"
    },
    "wasteStream": "FOOD_WASTE",
    "truckRegistration": "ABC123",
    "weighbridgeWeight": 10.5,
    "notes": "Manually created by admin",
    "companyId": "uuid-of-company",
    "companyName": "Company Name",
    "driverId": "uuid-of-driver",
    "validateLicensePlate": false
  }'
```

## Company Admin Capabilities

### Manage Company Users

**List Users in Company:**
```bash
curl http://localhost:3000/api/users?companyId={myCompanyId}
```

**Create Operator for Company:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_operator",
    "email": "operator@mycompany.co.nz",
    "password": "secure_password",
    "role": "OPERATOR",
    "companyId": "{myCompanyId}",
    "firstName": "New",
    "lastName": "Operator",
    "createdBy": "{myUserId}"
  }'
```

**Update User in Company:**
```bash
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "photoUrl": "/uploads/new-photo.jpg"
  }'
```

**Deactivate User in Company:**
```bash
curl -X DELETE http://localhost:3000/api/users/{userId}
```

### Manage Company Logo

**Upload and Set Company Logo:**
```bash
# 1. Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@company-logo.png"

# 2. Update company with new logo
curl -X PATCH http://localhost:3000/api/companies/{myCompanyId} \
  -H "Content-Type: application/json" \
  -d '{
    "logoUrl": "/uploads/1234567890-abc123.png"
  }'
```

## User Roles & Permissions

### System Admin (God User)
**Can:**
- Create, edit, delete all companies
- Create, edit, delete all users
- Assign users to any company
- Change any user's role
- Upload any logo or photo
- Create waste jobs manually
- View all data including energy/emissions

**Cannot:**
- Nothing - full access

### Company Admin
**Can:**
- View their company details
- Update their company logo
- List users in their company
- Create operators for their company
- Update users in their company
- Deactivate users in their company
- Upload photos for users in their company
- View waste jobs for their company
- View fees and invoices for their company

**Cannot:**
- View energy/emissions data
- Create other company admins
- View or manage other companies
- View or manage users from other companies

### Operator
**Can:**
- View their company details
- View waste jobs for their company
- Create waste jobs for their company
- Update their own profile photo

**Cannot:**
- View energy/emissions data
- Manage users
- Manage companies
- Update waste jobs
- Manage license plates

## Database Schema

### Companies Table

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    logo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    company_id UUID REFERENCES companies(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

## Sample Workflows

### Onboard New Company

```bash
# 1. Create company
COMPANY_RESPONSE=$(curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Company Ltd",
    "type": "WASTE_MANAGEMENT_NZ",
    "contactEmail": "contact@newcompany.co.nz",
    "contactPhone": "+64 9 123 4567"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | jq -r '.id')

# 2. Create company admin
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_newcompany",
    "email": "admin@newcompany.co.nz",
    "password": "initial_password",
    "role": "COMPANY_ADMIN",
    "companyId": "'$COMPANY_ID'",
    "firstName": "Admin",
    "lastName": "User"
  }'

# 3. Create operators
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator1_newcompany",
    "email": "operator1@newcompany.co.nz",
    "password": "initial_password",
    "role": "OPERATOR",
    "companyId": "'$COMPANY_ID'",
    "firstName": "Operator",
    "lastName": "One"
  }'
```

### Update User Profile with Photo

```bash
# 1. Upload photo
UPLOAD_RESPONSE=$(curl -X POST http://localhost:3000/api/upload \
  -F "file=@user-photo.jpg")

PHOTO_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url')

# 2. Update user profile
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{
    "photoUrl": "'$PHOTO_URL'"
  }'
```

## Error Handling

### Common Errors

**400 Bad Request:**
- Missing required fields
- Invalid role
- Invalid customer type
- Missing companyId for non-admin roles

**404 Not Found:**
- Company or user doesn't exist

**409 Conflict:**
- Username already exists
- Email already exists

**500 Internal Server Error:**
- Database connection issues
- Unexpected errors

### Example Error Response

```json
{
  "error": "Missing required fields",
  "details": "username, email, password, role, firstName, and lastName are required"
}
```

## Security Notes

1. **Password Hashing:** Currently uses placeholder hash. Implement bcrypt in production.
2. **Authentication:** Add JWT or session-based auth before production deployment.
3. **Authorization:** Enforce permission checks in all API routes.
4. **File Upload:** Validate file types and sizes. Consider cloud storage for production.
5. **SQL Injection:** All queries use parameterized statements.

## Next Steps

1. Implement bcrypt password hashing
2. Add JWT authentication
3. Create admin UI for company/user management
4. Add email verification
5. Implement role-based middleware
6. Add audit logging
7. Implement cloud storage for uploads (AWS S3, Azure Blob, etc.)
