# 🚀 NetChi - Deployment Guide

Complete guide for deploying NetChi to production.

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Production Configuration](#production-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-deployment Checklist

### Security
- [ ] Change SQL Server SA password
- [ ] Generate new JWT secret key
- [ ] Update CORS allowed origins
- [ ] Enable HTTPS with real certificate
- [ ] Review security headers configuration
- [ ] Set up API rate limits
- [ ] Enable logging

### Performance
- [ ] Run frontend build optimization
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database indexes
- [ ] Set up CDN (optional)

### Testing
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test real-time features
- [ ] Test offline mode
- [ ] Cross-browser testing
- [ ] Load testing

---

## Backend Deployment

### Option 1: Azure App Service

```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Create resource group
az group create --name netchi-rg --location eastus

# Create app service plan
az appservice plan create \
  --name netchi-plan \
  --resource-group netchi-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group netchi-rg \
  --plan netchi-plan \
  --name netchi-api \
  --runtime "DOTNETCORE|10.0"

# Deploy from GitHub
az webapp deployment source config-zip \
  --resource-group netchi-rg \
  --name netchi-api \
  --src ./deploy.zip
```

### Option 2: Docker on VPS/Server

```bash
# Build image
cd backend
docker build -t netchi-api:latest .

# Push to registry (Docker Hub, Azure ACR, etc.)
docker tag netchi-api:latest registry/netchi-api:latest
docker push registry/netchi-api:latest

# Pull and run on server
docker pull registry/netchi-api:latest
docker run -d \
  -p 5001:5001 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Jwt__Key="..." \
  --name netchi-api \
  registry/netchi-api:latest
```

### Option 3: Traditional IIS Hosting (Windows)

```bash
# Build for release
cd backend
dotnet publish -c Release -o ./publish

# Create IIS Application Pool
# Set .NET CLR version: No Managed Code (since .NET 5+)

# Create website pointing to publish folder
# Set Application Pool identity to custom account with DB access

# Configure HTTPS binding
# Set Hostname to yourdomain.com
```

### Option 4: Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: netchi-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: netchi-api
  template:
    metadata:
      labels:
        app: netchi-api
    spec:
      containers:
      - name: api
        image: registry/netchi-api:latest
        ports:
        - containerPort: 5001
        env:
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: connection-string
        - name: Jwt__Key
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: netchi-api-service
spec:
  type: LoadBalancer
  ports:
  - port: 5001
    targetPort: 5001
  selector:
    app: netchi-api
```

---

## Frontend Deployment

### Option 1: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub and auto-deploy
# In Netlify:
# - Connect GitHub repo
# - Build command: npm run build
# - Publish directory: dist
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 4: Static Hosting (GitHub Pages, GitLab Pages)

```bash
# Build
npm run build

# Deploy to GitHub Pages
npm install gh-pages
npx gh-pages -d dist

# Or use GitHub Actions (create .github/workflows/deploy.yml)
```

---

## Database Setup

### SQL Server (Production)

```bash
# Azure SQL Database
az sql server create \
  --resource-group netchi-rg \
  --name netchi-sql-server \
  --admin-user sqladmin \
  --admin-password 'SecurePassword123!'

# Create database
az sql db create \
  --resource-group netchi-rg \
  --server netchi-sql-server \
  --name NetChiDb \
  --service-objective Basic
```

### Create Database User (Security Best Practice)

```sql
-- Don't use SA account in production
CREATE LOGIN netchiadmin WITH PASSWORD = 'SecurePassword123!';
CREATE USER netchiadmin FOR LOGIN netchiadmin;

-- Grant necessary permissions
ALTER ROLE db_owner ADD MEMBER netchiadmin;
```

### Backup Strategy

```bash
# Automated daily backups (Azure)
az sql db backup create \
  --resource-group netchi-rg \
  --server netchi-sql-server \
  --name NetChiDb

# Or configure in Azure Portal:
# SQL Database > Backups > Configure long-term retention
```

---

## Production Configuration

### Backend appsettings.Production.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-sql-server.database.windows.net,1433;Database=NetChiDb;User Id=netchiadmin;Password=SecurePassword123!;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;"
  },
  "Jwt": {
    "Key": "GenerateNewSecureKeyMin32Characters",
    "Issuer": "https://netchidomain.com",
    "Audience": "netchiclient"
  },
  "AllowedOrigins": "https://netchidomain.com,https://www.netchidomain.com",
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error"
    }
  },
  "AllowedHosts": "netchidomain.com,www.netchidomain.com"
}
```

### Frontend Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.netchidomain.com/api/v1
VITE_SIGNALR_URL=https://api.netchidomain.com/hubs
```

### SSL/TLS Certificate

```bash
# Using Let's Encrypt (Free)
# Install Certbot: https://certbot.eff.org/

certbot certonly --standalone -d netchidomain.com -d www.netchidomain.com

# Renew automatically
certbot renew --auto
```

### API Rate Limiting Configuration

Update `Program.cs`:

```csharp
// Production rate limits (stricter)
options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
    httpContext => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: partition => new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = 50,              // Stricter limit
            QueueLimit = 0,
            Window = TimeSpan.FromMinutes(1)
        }));
```

---

## Monitoring & Maintenance

### Application Insights (Azure)

```bash
# Create Application Insights resource
az monitor app-insights component create \
  --app netchi-insights \
  --location eastus \
  --kind web \
  --resource-group netchi-rg

# Add to .NET project
dotnet add package Microsoft.ApplicationInsights.AspNetCore

# Configure in Program.cs
builder.Services.AddApplicationInsightsTelemetry(
    builder.Configuration.GetConnectionString("APPINSIGHTS_CONNECTIONSTRING"));

app.UseApplicationInsightsRequestTelemetry();
```

### Docker Registry Cleanup

```bash
# Remove old images
docker image prune -a

# Keep only last 5 versions
docker images | tail -n +6 | awk '{print $3}' | xargs -r docker rmi
```

### Database Maintenance

```sql
-- Monthly maintenance job
DBCC DBREINDEX   -- Rebuild indexes
DBCC SHRINKDB    -- Shrink database
UPDATE STATISTICS -- Update statistics
BACKUP DATABASE NetChiDb TO DISK = '/backups/NetChiDb.bak'
```

### Logging & Monitoring

```bash
# View container logs
docker logs netchi-api -f

# Check disk space
df -h

# Monitor process
top
ps aux | grep dotnet

# Check network
netstat -an | grep LISTEN
```

### Security Patches

```bash
# Update .NET runtime
dotnet --list-runtimes
dotnet tool update -g dotnet-tools

# Update Docker base image
docker pull mcr.microsoft.com/dotnet/aspnet:10.0

# Rebuild images
docker build --no-cache -t netchi-api:latest .
```

---

## Rollback Procedure

If deployment fails:

```bash
# Docker rollback
docker stop netchi-api
docker run ... netchi-api:previous-version

# Azure App Service
az webapp deployment source config-zip \
  --src ./previous-version.zip

# Kubernetes rollback
kubectl rollout undo deployment/netchi-api
kubectl rollout history deployment/netchi-api
```

---

## Performance Optimization (Production)

### Frontend

```bash
# Analyze bundle
npm run build -- --report

# Enable compression
# In vite.config.ts:
import compression from 'vite-plugin-compression';
export default {
  plugins: [compression()]
}
```

### Backend

```csharp
// In Program.cs
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = new[] { "application/json", "text/javascript", "text/css", "text/plain" };
});

app.UseResponseCompression();
```

---

## Monitoring Checklist

- [ ] Application uptime
- [ ] API response times
- [ ] Database connections
- [ ] Error rates
- [ ] User sessions
- [ ] Disk usage
- [ ] Memory usage
- [ ] CPU usage
- [ ] Network bandwidth
- [ ] SSL certificate expiration

---

## Useful Links

- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [ASP.NET Core Deployment](https://docs.microsoft.com/aspnet/core/host-and-deploy/)
- [React Production Build](https://facebook.github.io/react/docs/multiple-entry-points.html)
- [Let's Encrypt](https://letsencrypt.org/)

---

## Support

For deployment issues, contact your DevOps team or refer to the platform-specific documentation.

**Happy deploying! 🚀**
