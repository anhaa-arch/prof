# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js >= 18.0.0
- MySQL 8.0
- Redis 7+
- AWS S3 account (or MinIO for local)

## Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="mysql://username:password@host:3306/database_name"

# Redis
REDIS_URL="redis://host:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"

# Frontend
NEXT_PUBLIC_GRAPHQL_URL="https://your-api-domain.com/graphql"
```

## Local Development

### 1. Start services with Docker

```bash
# Start MySQL and Redis
docker-compose up -d mysql redis
```

### 2. Setup database

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 3. Start backend

```bash
cd backend
npm run start:dev
```

Backend will run on http://localhost:4000

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## Production Deployment

### Option 1: Docker Compose (Simple VPS)

1. **Build images:**

```bash
docker-compose build
```

2. **Run migrations:**

```bash
docker-compose run backend npx prisma migrate deploy
```

3. **Seed database:**

```bash
docker-compose run backend npx prisma db seed
```

4. **Start services:**

```bash
docker-compose up -d
```

5. **Check logs:**

```bash
docker-compose logs -f
```

### Option 2: AWS ECS/Fargate

1. **Push Docker images to ECR:**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI

# Tag and push backend
docker build -t urcs-backend ./backend
docker tag urcs-backend:latest YOUR_ECR_URI/urcs-backend:latest
docker push YOUR_ECR_URI/urcs-backend:latest

# Tag and push frontend
docker build -t urcs-frontend ./frontend
docker tag urcs-frontend:latest YOUR_ECR_URI/urcs-frontend:latest
docker push YOUR_ECR_URI/urcs-frontend:latest
```

2. **Create ECS Task Definitions** for backend and frontend

3. **Setup RDS MySQL** and **ElastiCache Redis**

4. **Configure Application Load Balancer**

5. **Deploy services** to ECS cluster

### Option 3: Kubernetes (EKS/GKE)

1. **Create Kubernetes manifests** (see `k8s/` directory)

2. **Apply configurations:**

```bash
kubectl apply -f k8s/
```

### Option 4: Vercel (Frontend) + Railway/Render (Backend)

**Frontend on Vercel:**

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

**Backend on Railway/Render:**

1. Connect GitHub repository
2. Set environment variables
3. Setup MySQL and Redis add-ons
4. Deploy

## Post-Deployment

### 1. Verify deployment

```bash
# Check backend health
curl https://your-api-domain.com/graphql

# Check frontend
curl https://your-frontend-domain.com
```

### 2. Create admin user (if not seeded)

```bash
docker-compose exec backend npm run seed
```

### 3. Setup monitoring

- **Sentry** for error tracking
- **Prometheus + Grafana** for metrics
- **ELK Stack** for logs

### 4. Setup backups

```bash
# MySQL backup
docker-compose exec mysql mysqldump -u root -p research_credit_db > backup.sql

# Or use automated backups in cloud (RDS, etc.)
```

### 5. Configure SSL/TLS

Use **Let's Encrypt** with nginx reverse proxy:

```bash
certbot --nginx -d your-domain.com
```

## Scaling

### Backend Scaling

- Use multiple backend instances behind load balancer
- Redis for session sharing
- BullMQ workers can be scaled separately

### Database Scaling

- Use MySQL read replicas
- Connection pooling with PgBouncer
- Consider Aurora Serverless for auto-scaling

### Frontend Scaling

- Vercel handles this automatically
- Or use CDN (CloudFront, Cloudflare) with static export

## Monitoring

### Health Checks

**Backend:**
```bash
GET /graphql
```

**Database:**
```bash
docker-compose exec mysql mysqladmin ping
```

**Redis:**
```bash
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

## Troubleshooting

### Database connection fails

1. Check `DATABASE_URL` in `.env`
2. Ensure MySQL is running
3. Check network connectivity
4. Verify credentials

### Redis connection fails

1. Check `REDIS_URL` in `.env`
2. Ensure Redis is running
3. Check firewall rules

### File upload fails

1. Verify AWS credentials
2. Check S3 bucket permissions
3. Ensure CORS is configured on S3

### Build fails

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Docker cache: `docker-compose build --no-cache`
3. Check Node.js version: `node --version` (should be >= 18)

## Maintenance

### Update dependencies

```bash
npm update
npx prisma migrate dev
```

### Database migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply in production
npx prisma migrate deploy
```

### Backup before updates

```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p research_credit_db > backup-$(date +%Y%m%d).sql

# Backup files (if using local storage)
tar -czf files-backup-$(date +%Y%m%d).tar.gz ./uploads
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Setup CORS properly
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Audit logs enabled

## Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review documentation
- Contact development team

