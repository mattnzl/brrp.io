# BRRP.IO Deployment Guide

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest way to deploy a Next.js application.

#### Steps:
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Configure environment variables (see `.env.example`)
5. Deploy

#### CLI Deployment:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. Docker

#### Build Docker Image:
```bash
docker build -t brrp-io .
```

#### Run Container:
```bash
docker run -p 3000:3000 brrp-io
```

#### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Traditional Server

#### Build:
```bash
npm run build
```

#### Start:
```bash
npm start
```

#### With PM2:
```bash
npm install -g pm2
pm2 start npm --name "brrp-io" -- start
pm2 save
pm2 startup
```

### 4. Static Export (if not using SSR)

For static hosting (Netlify, GitHub Pages, etc.):

#### Update `next.config.js`:
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

#### Build:
```bash
npm run build
```

Static files will be in the `out/` directory.

---

## Environment Configuration

Copy `.env.example` to `.env.local` and configure:

### Required Variables:
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `BLOCKCHAIN_RPC_URL`: Blockchain RPC endpoint
- `OPEN_EARTH_API_KEY`: Open Earth registry API key

### Optional Variables:
- `MFE_API_KEY`: Ministry for the Environment API
- `WWTP_DB_API_KEY`: WWTP database access
- `VERRA_API_KEY`, `GOLD_STANDARD_API_KEY`, `TOITU_API_KEY`: Verification service APIs

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure all environment variables
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for data
- [ ] Test blockchain integration
- [ ] Verify external API connections
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Enable security headers
- [ ] Run security audit: `npm audit`
- [ ] Test in production-like environment

---

## Performance Optimization

### Next.js Optimization:
- Image optimization is enabled by default
- Automatic code splitting
- Static page generation where possible

### Additional Optimizations:
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config
});
```

Run analysis:
```bash
ANALYZE=true npm run build
```

---

## Monitoring

### Recommended Tools:
- **Vercel Analytics** (for Vercel deployments)
- **Google Analytics** or **Plausible**
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Uptime monitoring** (e.g., UptimeRobot, Pingdom)

---

## Security

### Best Practices:
1. Use HTTPS everywhere
2. Implement rate limiting
3. Validate all inputs
4. Secure API keys (never commit to repo)
5. Use CSP (Content Security Policy) headers
6. Enable CORS properly
7. Keep dependencies updated
8. Regular security audits

### Security Headers (in `next.config.js`):
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
};
```

---

## Database Setup (Required for Waste Jobs)

### PostgreSQL Setup:

The waste jobs feature requires a PostgreSQL database for persistent storage.

#### 1. Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**On macOS (see DEPLOYMENT_MACOS.md for more details):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Windows:**
Download and install from https://www.postgresql.org/download/windows/

#### 2. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE brrp_io;
CREATE USER brrp_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE brrp_io TO brrp_user;

# Exit psql
\q
```

#### 3. Run Schema Migration

Execute the SQL schema to create the waste_jobs table:

```bash
# Using psql
psql -U brrp_user -d brrp_io -f schema.sql

# Or using the connection string
psql postgresql://brrp_user:your_secure_password@localhost:5432/brrp_io -f schema.sql
```

The schema creates:
- `waste_jobs` table with all required fields
- Indexes on `created_at`, `status`, and `company_id` for efficient queries

#### 4. Configure Environment Variable

Add to your `.env.local` file:

```bash
DATABASE_URL=postgresql://brrp_user:your_secure_password@localhost:5432/brrp_io
```

For production deployments, use your production database credentials.

#### 5. Verify Connection

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM waste_jobs;"
```

### PostgreSQL Dependencies:

The `pg` package is already included in package.json:

```bash
npm install  # Will install pg and @types/pg
```

### MongoDB:
```bash
# Install mongoose
npm install mongoose

# Connection example
MONGODB_URI=mongodb://localhost:27017/brrp_io
```

---

## CI/CD Pipeline

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Backup Strategy

### Important Data to Backup:
- SCADA measurement records
- Emissions calculations
- Verification records
- Carbon credit transactions
- Blockchain transaction hashes

### Backup Frequency:
- **Real-time**: Critical transaction data
- **Hourly**: SCADA measurements
- **Daily**: All other data
- **Weekly**: Full system backup

---

## Scaling

### Horizontal Scaling:
- Deploy multiple instances behind load balancer
- Use CDN for static assets
- Implement caching layer (Redis)

### Database Scaling:
- Read replicas for queries
- Sharding for large datasets
- Connection pooling

---

## Support and Maintenance

### Regular Tasks:
- Monitor error logs
- Update dependencies monthly
- Review security advisories
- Backup verification
- Performance monitoring
- User feedback review

### Updates:
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Major version updates
npm install package@latest
```

---

For questions about deployment, contact the development team.
