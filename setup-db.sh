#!/bin/bash

# BRRP.IO Database Setup Script
# This script sets up the PostgreSQL database and populates it with demo data

set -e

echo "================================================"
echo "BRRP.IO Database Setup"
echo "================================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable not set"
    echo "Using default: postgresql://postgres:password@localhost:5432/brrp_io"
    export DATABASE_URL="postgresql://postgres:password@localhost:5432/brrp_io"
fi

echo "📊 Database URL: $DATABASE_URL"
echo ""

# Extract database details from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Step 1: Creating database schema..."
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f schema.sql
    echo "✅ Schema created successfully"
else
    echo "⚠️  psql not found. Please install PostgreSQL client or run schema.sql manually"
    exit 1
fi

echo ""
echo "Step 2: Loading seed data..."
psql "$DATABASE_URL" -f seed-data.sql
echo "✅ Seed data loaded successfully"

echo ""
echo "================================================"
echo "✨ Database setup complete!"
echo "================================================"
echo ""
echo "Summary:"
psql "$DATABASE_URL" -c "
SELECT 
    'Companies' as entity, 
    COUNT(*)::text as count 
FROM companies
UNION ALL
SELECT 'Users', COUNT(*)::text FROM users
UNION ALL
SELECT 'Drivers', COUNT(*)::text FROM drivers
UNION ALL
SELECT 'Trucks', COUNT(*)::text FROM trucks
UNION ALL
SELECT 'Waste Stream Types', COUNT(*)::text FROM waste_stream_types
UNION ALL
SELECT 'Weighbridge Jobs', COUNT(*)::text FROM weighbridge_jobs
UNION ALL
SELECT 'Emissions Data', COUNT(*)::text FROM emissions_data
UNION ALL
SELECT 'Energy Production', COUNT(*)::text FROM energy_production;
"

echo ""
echo "🎉 Ready to go! Start the development server with: npm run dev"
