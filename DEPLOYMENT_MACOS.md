# BRRP.IO Deployment Guide for macOS

This guide provides step-by-step instructions for deploying BRRP.IO on macOS systems.

## Prerequisites for macOS

### Required Software

1. **Homebrew** (macOS package manager)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Node.js and npm** (v18 or higher)
   ```bash
   # Install using Homebrew
   brew install node@18
   
   # Verify installation
   node --version  # Should be v18.x.x or higher
   npm --version   # Should be 9.x.x or higher
   ```

3. **Git** (usually pre-installed on macOS)
   ```bash
   # Verify installation
   git --version
   
   # If not installed
   brew install git
   ```

## Local Development on macOS

### 1. Clone the Repository

```bash
# Navigate to your preferred directory
cd ~/Projects

# Clone the repository
git clone https://github.com/mattnzl/brrp.io.git

# Navigate to project directory
cd brrp.io
```

### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- All development dependencies

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment file with your preferred editor
nano .env.local
# or
code .env.local  # If you have VS Code
# or
open -a TextEdit .env.local
```

**Required Environment Variables:**
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Add your API keys and configuration
OPEN_EARTH_API_KEY=your_key_here
MFE_API_KEY=your_key_here
# ... etc
```

### 4. Run Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

**Development Features:**
- Hot Module Replacement (HMR)
- Fast Refresh for React components
- TypeScript type checking
- ESLint code quality checks

### 5. Build for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

## Production Deployment Options for macOS

### Option 1: Vercel (Recommended for macOS)

Vercel provides the easiest deployment experience and is optimized for Next.js.

#### Using Vercel CLI on macOS:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy to production
vercel --prod
```

#### Using Vercel Dashboard:
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your `brrp.io` repository
4. Configure environment variables in dashboard
5. Click "Deploy"

**Advantages:**
- Automatic HTTPS/SSL
- Global CDN
- Automatic deployments on git push
- Preview deployments for PRs
- Built-in analytics

### Option 2: Local Production Server on macOS

Run the application as a production server on your Mac.

#### Using npm directly:

```bash
# Build the application
npm run build

# Start production server
npm start
```

The server runs on http://localhost:3000

#### Using PM2 Process Manager:

PM2 keeps your application running and restarts it automatically if it crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "brrp-io" -- start

# View application status
pm2 status

# View logs
pm2 logs brrp-io

# Restart application
pm2 restart brrp-io

# Stop application
pm2 stop brrp-io

# Make PM2 start on system boot
pm2 startup
pm2 save
```

**PM2 Commands:**
```bash
pm2 list              # List all applications
pm2 monit             # Monitor CPU/Memory usage
pm2 logs --lines 100  # View last 100 log lines
pm2 reload brrp-io    # Zero-downtime reload
pm2 delete brrp-io    # Remove from PM2
```

### Option 3: Docker on macOS

#### Prerequisites:
```bash
# Install Docker Desktop for Mac
brew install --cask docker

# Start Docker Desktop application
open -a Docker
```

#### Create Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
```

#### Build and Run:

```bash
# Build Docker image
docker build -t brrp-io .

# Run container
docker run -d \
  --name brrp-io \
  -p 3000:3000 \
  --env-file .env.local \
  brrp-io

# View logs
docker logs -f brrp-io

# Stop container
docker stop brrp-io

# Remove container
docker rm brrp-io
```

#### Using Docker Compose:

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
```

Run with:
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 4: Nginx Reverse Proxy on macOS

Use Nginx as a reverse proxy for better performance and SSL termination.

```bash
# Install Nginx
brew install nginx

# Create Nginx configuration
sudo nano /usr/local/etc/nginx/servers/brrp-io.conf
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Start Nginx:**
```bash
# Test configuration
sudo nginx -t

# Start Nginx
sudo brew services start nginx

# Reload configuration
sudo nginx -s reload

# Stop Nginx
sudo brew services stop nginx
```

## macOS-Specific Considerations

### Port Availability

macOS may have port 3000 in use. Check with:
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000 (if needed)
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### File Watchers Limit

Increase file watcher limit if you encounter issues:
```bash
# Check current limit
sysctl -n kern.maxfiles

# Increase limit (temporary)
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536

# Make permanent (add to /etc/sysctl.conf)
echo "kern.maxfiles=65536" | sudo tee -a /etc/sysctl.conf
echo "kern.maxfilesperproc=65536" | sudo tee -a /etc/sysctl.conf
```

### Firewall Configuration

Allow Node.js through macOS Firewall:
1. Open **System Preferences** → **Security & Privacy** → **Firewall**
2. Click **Firewall Options**
3. Click **+** and add Node.js
4. Set to **Allow incoming connections**

### Performance Optimization

```bash
# Clear npm cache
npm cache clean --force

# Rebuild node modules
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

## SSL/HTTPS Setup on macOS (Development)

### Using mkcert for Local HTTPS:

```bash
# Install mkcert
brew install mkcert
brew install nss # for Firefox

# Create local CA
mkcert -install

# Generate certificate
mkcert localhost 127.0.0.1 ::1

# Update package.json scripts
# Add to scripts:
# "dev:https": "next dev --experimental-https --experimental-https-key ./localhost+2-key.pem --experimental-https-cert ./localhost+2.pem"
```

## Monitoring and Logs

### Application Logs

```bash
# Real-time logs with PM2
pm2 logs brrp-io --lines 100

# Export logs
pm2 logs brrp-io > logs.txt

# Clear logs
pm2 flush
```

### System Resources

```bash
# Monitor CPU/Memory with Activity Monitor
open -a "Activity Monitor"

# Or use top command
top -o cpu

# Check disk space
df -h

# Check memory usage
vm_stat
```

## Troubleshooting on macOS

### Common Issues

**1. Port Already in Use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**2. Permission Denied:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**3. Module Not Found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**4. Build Fails:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**5. TypeScript Errors:**
```bash
# Run type check
npm run type-check

# Clear TypeScript cache
rm -rf .next tsconfig.tsbuildinfo
```

## Backup and Updates

### Backup Strategy

```bash
# Backup entire project
tar -czf brrp-io-backup-$(date +%Y%m%d).tar.gz ~/Projects/brrp.io

# Backup only important files
tar -czf brrp-io-config-$(date +%Y%m%d).tar.gz \
  .env.local \
  package.json \
  next.config.js
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages (minor versions)
npm update

# Update to latest versions
npm install <package>@latest

# Update npm itself
npm install -g npm@latest
```

## Automated Deployment Script for macOS

Create `deploy.sh`:

```bash
#!/bin/bash

# BRRP.IO Deployment Script for macOS
set -e

echo "🚀 Starting BRRP.IO deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2 process
echo "♻️  Restarting application..."
pm2 restart brrp-io || pm2 start npm --name "brrp-io" -- start

# Show status
echo "✅ Deployment complete!"
pm2 status
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Security Best Practices for macOS

1. **Never commit `.env.local`** - Contains sensitive keys
2. **Keep macOS updated** - Install security updates
3. **Use strong API keys** - Generate secure credentials
4. **Enable FileVault** - Encrypt your hard drive
5. **Use firewall** - Enable macOS firewall
6. **Regular backups** - Use Time Machine or similar

## Next Steps

After deployment:
1. ✅ Test all functionality at http://localhost:3000
2. ✅ Verify environment variables are loaded
3. ✅ Check application logs for errors
4. ✅ Test all 6 sections of the UI
5. ✅ Monitor resource usage
6. ✅ Set up automated backups
7. ✅ Configure monitoring/alerting

## Support

For macOS-specific issues:
- Check Console.app for system logs
- Review Next.js documentation
- Check Node.js compatibility
- Verify npm/Node versions

---

**Platform**: BRRP.IO  
**OS**: macOS (Monterey, Ventura, Sonoma compatible)  
**Last Updated**: January 2024
