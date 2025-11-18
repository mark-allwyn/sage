# Docker + AWS Deployment Plan for SAGE

**Timeline**: 10-14 days (Fast deployment)
**Compute**: AWS ECS Fargate (Serverless)
**Security**: Basic API key authentication + rate limiting
**Environment**: Production only
**Estimated Cost**: ~$66-86/month infrastructure + LLM API usage

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Docker Containerization (Days 1-3)](#phase-1-docker-containerization-days-1-3)
3. [Phase 2: AWS Infrastructure Setup (Days 4-7)](#phase-2-aws-infrastructure-setup-days-4-7)
4. [Phase 3: Deployment Configuration (Days 8-10)](#phase-3-deployment-configuration-days-8-10)
5. [Phase 4: Testing & Launch (Days 11-14)](#phase-4-testing--launch-days-11-14)
6. [API Keys & Secrets Management](#api-keys--secrets-management)
7. [Security Measures](#security-measures)
8. [Cost Breakdown](#cost-breakdown)
9. [Architecture Diagram](#architecture-diagram)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This plan will containerize the SAGE (Synthetic Audience Generation Engine) application and deploy it to AWS ECS Fargate with a public HTTPS URL. The deployment includes:

- **Backend**: FastAPI (Python) running on ECS Fargate
- **Frontend**: React SPA served by Nginx on ECS Fargate
- **Storage**: EFS for persistent data (surveys, results, ground truths)
- **Load Balancer**: Application Load Balancer with HTTPS
- **Secrets**: AWS Secrets Manager for API keys
- **Security**: API key authentication, rate limiting, HTTPS only

---

## Phase 1: Docker Containerization (Days 1-3)

### Files to Create

#### 1. `Dockerfile.backend`

Multi-stage Docker build for the FastAPI backend.

```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./backend/
COPY config/ ./config/
COPY results/ ./results/
COPY ground_truths/ ./ground_truths/
COPY experiments/ ./experiments/

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    mkdir -p /app/backend/uploads/images /app/backend/uploads/cache && \
    chown -R appuser:appuser /app/backend/uploads

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"

# Run application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. `Dockerfile.frontend`

Multi-stage build: compile React app, then serve with Nginx.

```dockerfile
# Stage 1: Build React application
FROM node:16-alpine as build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY frontend/ ./

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. `nginx.conf`

Nginx configuration for serving the React SPA.

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

#### 4. `.dockerignore` (root directory)

```
# Git
.git
.gitignore

# Documentation
*.md
docs/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
backend/venv/
backend/.venv/
*.egg-info/
.pytest_cache/

# Node
frontend/node_modules/
frontend/build/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.*
backend/.env
frontend/.env

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Large data files (will use volumes)
results/*
experiments/*
backend/uploads/*

# Logs
*.log
```

#### 5. `docker-compose.yml`

For local testing before AWS deployment.

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - APP_API_KEY=${APP_API_KEY:-your-secret-api-key}
      - ENVIRONMENT=development
      - CORS_ORIGINS=http://localhost:3000,http://localhost
    volumes:
      - ./config:/app/config
      - ./results:/app/results
      - ./ground_truths:/app/ground_truths
      - ./experiments:/app/experiments
      - ./backend/uploads:/app/backend/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/')"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        - REACT_APP_API_URL=http://localhost:8000
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

volumes:
  config-data:
  results-data:
  ground-truths-data:
  experiments-data:
  uploads-data:
```

#### 6. `.env.production.example`

Template for production environment variables.

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-production-key-here
ANTHROPIC_API_KEY=sk-ant-your-production-key-here

# Application API Key (for client authentication)
APP_API_KEY=your-secure-random-api-key-here

# Environment
ENVIRONMENT=production

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com

# Optional: Custom API bases
# OPENAI_API_BASE=https://api.openai.com/v1
# ANTHROPIC_API_BASE=https://api.anthropic.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Logging
LOG_LEVEL=info
```

#### 7. `backend/middleware/api_key_auth.py` (NEW FILE)

Simple API key authentication middleware.

```python
"""
API Key Authentication Middleware
Simple bearer token authentication for production deployment
"""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()

def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Verify API key from Authorization header
    Expected format: Authorization: Bearer YOUR_API_KEY
    """
    expected_key = os.getenv("APP_API_KEY")

    if not expected_key:
        # If no API key configured, allow access (development mode)
        return "dev-mode"

    if credentials.credentials != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return credentials.credentials
```

#### 8. `backend/middleware/rate_limit.py` (NEW FILE)

Basic rate limiting middleware.

```python
"""
Rate Limiting Middleware
Simple IP-based rate limiting to prevent abuse
"""
from fastapi import Request, HTTPException, status
from collections import defaultdict
from datetime import datetime, timedelta
import os

# In-memory rate limit tracking (consider Redis for production scaling)
rate_limit_store = defaultdict(list)

def rate_limit_middleware(request: Request):
    """
    Rate limit: 10 requests per minute per IP address
    """
    rate_limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))
    client_ip = request.client.host
    current_time = datetime.now()

    # Clean up old requests (older than 1 minute)
    rate_limit_store[client_ip] = [
        req_time for req_time in rate_limit_store[client_ip]
        if current_time - req_time < timedelta(minutes=1)
    ]

    # Check rate limit
    if len(rate_limit_store[client_ip]) >= rate_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {rate_limit} requests per minute.",
        )

    # Record this request
    rate_limit_store[client_ip].append(current_time)
```

#### 9. Update `backend/main.py`

Add security middleware (this will be an edit to the existing file).

```python
# Add these imports at the top
from middleware.api_key_auth import verify_api_key
from middleware.rate_limit import rate_limit_middleware
from fastapi import Depends

# Update CORS configuration to use environment variable
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
@app.middleware("http")
async def rate_limit(request: Request, call_next):
    rate_limit_middleware(request)
    response = await call_next(request)
    return response

# Add API key authentication to protected endpoints
# Example: Add api_key: str = Depends(verify_api_key) to endpoint signatures
@app.post("/api/run-survey", dependencies=[Depends(verify_api_key)])
async def run_survey(request: RunSurveyRequest):
    # ... existing code
```

---

## Phase 2: AWS Infrastructure Setup (Days 4-7)

### Step-by-Step AWS Console Setup

#### 1. Create VPC (Virtual Private Cloud)

1. Go to **VPC Dashboard** → **Create VPC**
2. Select **VPC and more** (creates subnets, route tables, etc.)
3. Configuration:
   - **Name**: `sage-vpc`
   - **IPv4 CIDR**: `10.0.0.0/16`
   - **Availability Zones**: 2
   - **Public subnets**: 2 (10.0.1.0/24, 10.0.2.0/24)
   - **Private subnets**: 2 (10.0.3.0/24, 10.0.4.0/24)
   - **NAT gateways**: 1 (for backend to call external APIs)
   - **VPC endpoints**: None (optional: add S3 endpoint to save costs)
4. Click **Create VPC**

#### 2. Set up AWS Secrets Manager

1. Go to **Secrets Manager** → **Store a new secret**
2. Create secret for **OpenAI API Key**:
   - Secret type: **Other type of secret**
   - Key/value pairs:
     - Key: `OPENAI_API_KEY`
     - Value: `sk-proj-your-new-production-key`
   - Secret name: `sage/prod/openai-api-key`
   - Click **Store**
3. Repeat for **Anthropic API Key**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-your-new-production-key`
   - Secret name: `sage/prod/anthropic-api-key`
4. Create **App API Key** (for client authentication):
   - Generate random key: `openssl rand -hex 32`
   - Key: `APP_API_KEY`
   - Value: (generated random key)
   - Secret name: `sage/prod/app-api-key`

**Important**: Copy the ARNs of these secrets (you'll need them for ECS task definitions).

#### 3. Create ECR Repositories (Docker Image Registry)

1. Go to **ECR** → **Create repository**
2. Create **Backend Repository**:
   - Repository name: `sage-backend`
   - Tag immutability: Disabled
   - Scan on push: Enabled
   - Click **Create repository**
3. Create **Frontend Repository**:
   - Repository name: `sage-frontend`
   - Settings same as above
4. Note the repository URIs (e.g., `123456789.dkr.ecr.us-east-1.amazonaws.com/sage-backend`)

#### 4. Create EFS File System (Persistent Storage)

1. Go to **EFS** → **Create file system**
2. Configuration:
   - **Name**: `sage-efs`
   - **VPC**: Select `sage-vpc`
   - **Availability and Durability**: Regional
   - **Performance mode**: General Purpose
   - **Throughput mode**: Bursting
3. Click **Create**
4. Configure **Mount Targets**:
   - Add mount targets in both private subnets
   - Security group: Create new or use default (allow NFS port 2049 from ECS tasks)
5. Create **Access Point** for each directory:
   - `/config` → Access point: `sage-config`
   - `/results` → Access point: `sage-results`
   - `/ground_truths` → Access point: `sage-ground-truths`
   - `/experiments` → Access point: `sage-experiments`
   - `/uploads` → Access point: `sage-uploads`

#### 5. Create Application Load Balancer

1. Go to **EC2** → **Load Balancers** → **Create Load Balancer**
2. Select **Application Load Balancer**
3. Configuration:
   - **Name**: `sage-alb`
   - **Scheme**: Internet-facing
   - **IP address type**: IPv4
   - **VPC**: `sage-vpc`
   - **Subnets**: Select both public subnets
   - **Security groups**: Create new security group
     - Allow **HTTP (80)** from anywhere (0.0.0.0/0)
     - Allow **HTTPS (443)** from anywhere (0.0.0.0/0)
4. Create **Target Groups**:
   - **Backend Target Group**:
     - Name: `sage-backend-tg`
     - Target type: IP
     - Protocol: HTTP
     - Port: 8000
     - VPC: `sage-vpc`
     - Health check path: `/`
     - Health check interval: 30s
   - **Frontend Target Group**:
     - Name: `sage-frontend-tg`
     - Target type: IP
     - Protocol: HTTP
     - Port: 80
     - Health check path: `/`
5. Configure **Listeners**:
   - **HTTP (80)**: Forward to `sage-frontend-tg`
   - Add rule: `/api/*` → Forward to `sage-backend-tg`
6. Click **Create**

#### 6. Request SSL Certificate (AWS Certificate Manager)

1. Go to **Certificate Manager** → **Request certificate**
2. Select **Request a public certificate**
3. Configuration:
   - **Domain name**: `yourdomain.com`
   - **Add another name**: `*.yourdomain.com` (wildcard for subdomains)
   - **Validation method**: DNS validation (recommended)
4. Click **Request**
5. Complete DNS validation:
   - Add CNAME records to your domain's DNS (Route 53 or external provider)
   - Wait for validation (usually 5-30 minutes)
6. Once validated, note the certificate ARN
7. Go back to **ALB** → **Listeners** → Add HTTPS listener:
   - Protocol: HTTPS
   - Port: 443
   - Default SSL certificate: Select your certificate
   - Default action: Forward to `sage-frontend-tg`
   - Add rule for `/api/*` → Forward to `sage-backend-tg`

#### 7. Create ECS Fargate Cluster

1. Go to **ECS** → **Clusters** → **Create cluster**
2. Configuration:
   - **Cluster name**: `sage-cluster`
   - **Infrastructure**: AWS Fargate (serverless)
   - **Monitoring**: Enable Container Insights (optional, adds cost)
3. Click **Create**

#### 8. Configure Route 53 DNS (if using custom domain)

1. Go to **Route 53** → **Hosted zones** → Select your domain
2. Create **A Record**:
   - Record name: `sage` (or blank for root domain)
   - Record type: A
   - Alias: Yes
   - Route traffic to: Alias to Application Load Balancer
   - Select your region and `sage-alb`
3. Click **Create records**

---

## Phase 3: Deployment Configuration (Days 8-10)

### Files to Create

#### 1. `task-definition-backend.json`

ECS task definition for backend service.

```json
{
  "family": "sage-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "sage-backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/sage-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "production"
        },
        {
          "name": "CORS_ORIGINS",
          "value": "https://yourdomain.com"
        },
        {
          "name": "RATE_LIMIT_PER_MINUTE",
          "value": "10"
        },
        {
          "name": "LOG_LEVEL",
          "value": "info"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:sage/prod/openai-api-key"
        },
        {
          "name": "ANTHROPIC_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:sage/prod/anthropic-api-key"
        },
        {
          "name": "APP_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:sage/prod/app-api-key"
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "config",
          "containerPath": "/app/config",
          "readOnly": false
        },
        {
          "sourceVolume": "results",
          "containerPath": "/app/results",
          "readOnly": false
        },
        {
          "sourceVolume": "ground-truths",
          "containerPath": "/app/ground_truths",
          "readOnly": false
        },
        {
          "sourceVolume": "experiments",
          "containerPath": "/app/experiments",
          "readOnly": false
        },
        {
          "sourceVolume": "uploads",
          "containerPath": "/app/backend/uploads",
          "readOnly": false
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sage-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "python -c 'import urllib.request; urllib.request.urlopen(\"http://localhost:8000/\")' || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "volumes": [
    {
      "name": "config",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-YOUR_EFS_ID",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "fsap-YOUR_CONFIG_ACCESS_POINT_ID"
        }
      }
    },
    {
      "name": "results",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-YOUR_EFS_ID",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "fsap-YOUR_RESULTS_ACCESS_POINT_ID"
        }
      }
    },
    {
      "name": "ground-truths",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-YOUR_EFS_ID",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "fsap-YOUR_GROUND_TRUTHS_ACCESS_POINT_ID"
        }
      }
    },
    {
      "name": "experiments",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-YOUR_EFS_ID",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "fsap-YOUR_EXPERIMENTS_ACCESS_POINT_ID"
        }
      }
    },
    {
      "name": "uploads",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-YOUR_EFS_ID",
        "transitEncryption": "ENABLED",
        "authorizationConfig": {
          "accessPointId": "fsap-YOUR_UPLOADS_ACCESS_POINT_ID"
        }
      }
    }
  ]
}
```

#### 2. `task-definition-frontend.json`

ECS task definition for frontend service.

```json
{
  "family": "sage-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "sage-frontend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/sage-frontend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sage-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 30
      }
    }
  ]
}
```

#### 3. `deploy.sh`

Automated deployment script.

```bash
#!/bin/bash
set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_BACKEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/sage-backend"
ECR_FRONTEND="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/sage-frontend"
CLUSTER_NAME="sage-cluster"
BACKEND_SERVICE="sage-backend-service"
FRONTEND_SERVICE="sage-frontend-service"

echo "🚀 SAGE Deployment Script"
echo "========================="

# Step 1: Login to ECR
echo "📦 Logging in to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 2: Build and push backend
echo "🔨 Building backend Docker image..."
docker build -f Dockerfile.backend -t sage-backend:latest .
docker tag sage-backend:latest $ECR_BACKEND:latest
docker tag sage-backend:latest $ECR_BACKEND:$(date +%Y%m%d-%H%M%S)

echo "⬆️  Pushing backend image to ECR..."
docker push $ECR_BACKEND:latest
docker push $ECR_BACKEND:$(date +%Y%m%d-%H%M%S)

# Step 3: Build frontend with production API URL
echo "🔨 Building frontend Docker image..."
docker build -f Dockerfile.frontend \
  --build-arg REACT_APP_API_URL=https://yourdomain.com/api \
  -t sage-frontend:latest .
docker tag sage-frontend:latest $ECR_FRONTEND:latest
docker tag sage-frontend:latest $ECR_FRONTEND:$(date +%Y%m%d-%H%M%S)

echo "⬆️  Pushing frontend image to ECR..."
docker push $ECR_FRONTEND:latest
docker push $ECR_FRONTEND:$(date +%Y%m%d-%H%M%S)

# Step 4: Update ECS services
echo "🔄 Updating ECS services..."
aws ecs update-service --cluster $CLUSTER_NAME --service $BACKEND_SERVICE --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster $CLUSTER_NAME --service $FRONTEND_SERVICE --force-new-deployment --region $AWS_REGION

echo "✅ Deployment complete!"
echo "🌐 Your application will be available at: https://yourdomain.com"
echo "⏳ Wait 2-3 minutes for new tasks to become healthy"
```

#### 4. `.github/workflows/deploy.yml` (Optional CI/CD)

GitHub Actions workflow for automated deployments.

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_BACKEND: sage-backend
  ECR_FRONTEND: sage-frontend
  ECS_CLUSTER: sage-cluster
  BACKEND_SERVICE: sage-backend-service
  FRONTEND_SERVICE: sage-frontend-service

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build and push backend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f Dockerfile.backend -t $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_BACKEND:latest
        docker push $ECR_REGISTRY/$ECR_BACKEND:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_BACKEND:latest

    - name: Build and push frontend image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -f Dockerfile.frontend \
          --build-arg REACT_APP_API_URL=https://yourdomain.com/api \
          -t $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG .
        docker tag $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_FRONTEND:latest
        docker push $ECR_REGISTRY/$ECR_FRONTEND:$IMAGE_TAG
        docker push $ECR_REGISTRY/$ECR_FRONTEND:latest

    - name: Update backend service
      run: |
        aws ecs update-service --cluster $ECS_CLUSTER \
          --service $BACKEND_SERVICE \
          --force-new-deployment

    - name: Update frontend service
      run: |
        aws ecs update-service --cluster $ECS_CLUSTER \
          --service $FRONTEND_SERVICE \
          --force-new-deployment

    - name: Wait for deployment
      run: |
        aws ecs wait services-stable --cluster $ECS_CLUSTER --services $BACKEND_SERVICE
        aws ecs wait services-stable --cluster $ECS_CLUSTER --services $FRONTEND_SERVICE

    - name: Deployment complete
      run: echo "✅ Deployment successful!"
```

#### 5. `DEPLOYMENT.md`

Documentation for deployment process.

```markdown
# SAGE Deployment Guide

## Prerequisites

1. AWS Account with admin access
2. AWS CLI installed and configured
3. Docker installed locally
4. Domain name (optional, can use ALB DNS)

## Initial Setup

### 1. Rotate API Keys
- Create new OpenAI API key at https://platform.openai.com/api-keys
- Create new Anthropic API key at https://console.anthropic.com/settings/keys
- Store in AWS Secrets Manager (see Phase 2)

### 2. Build Docker Images Locally
```bash
# Test backend build
docker build -f Dockerfile.backend -t sage-backend:test .

# Test frontend build
docker build -f Dockerfile.frontend -t sage-frontend:test .

# Test with docker-compose
docker-compose up
```

### 3. Create IAM Roles

**ecsTaskExecutionRole** (required for Fargate):
- Policy: `AmazonECSTaskExecutionRolePolicy`
- Additional permissions: Secrets Manager read access

**ecsTaskRole** (for backend to access AWS services):
- Policy: EFS access, S3 access (if needed)

### 4. Create CloudWatch Log Groups
```bash
aws logs create-log-group --log-group-name /ecs/sage-backend
aws logs create-log-group --log-group-name /ecs/sage-frontend
```

## Deployment Steps

### Option 1: Manual Deployment (First Time)

1. **Push images to ECR**:
```bash
./deploy.sh
```

2. **Register task definitions**:
```bash
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-frontend.json
```

3. **Create ECS services**:
```bash
# Backend service
aws ecs create-service \
  --cluster sage-cluster \
  --service-name sage-backend-service \
  --task-definition sage-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...:targetgroup/sage-backend-tg,containerName=sage-backend,containerPort=8000"

# Frontend service
aws ecs create-service \
  --cluster sage-cluster \
  --service-name sage-frontend-service \
  --task-definition sage-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...:targetgroup/sage-frontend-tg,containerName=sage-frontend,containerPort=80"
```

### Option 2: GitHub Actions (Automated)

1. Add secrets to GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Push to main branch:
```bash
git push origin main
```

3. Monitor deployment in GitHub Actions tab

## Post-Deployment

### Verify Deployment
```bash
# Check service status
aws ecs describe-services --cluster sage-cluster --services sage-backend-service sage-frontend-service

# Check task health
aws ecs list-tasks --cluster sage-cluster --service-name sage-backend-service

# View logs
aws logs tail /ecs/sage-backend --follow
```

### Test Application
```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers --names sage-alb --query 'LoadBalancers[0].DNSName'

# Test backend health
curl https://your-alb-dns/

# Test API with authentication
curl -H "Authorization: Bearer YOUR_API_KEY" https://your-alb-dns/api/surveys
```

## Monitoring

### CloudWatch Dashboards
- CPU/Memory utilization
- Request count and latency
- Error rates
- API call costs (custom metric)

### Set up Alarms
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name sage-backend-errors \
  --alarm-description "Alert when backend error rate is high" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# Cost alarm (requires custom metric)
# Track OpenAI/Anthropic API costs and alert when > $100/day
```

## Maintenance

### Update Application
```bash
# Make code changes
git commit -am "Update feature"
git push origin main

# Or manually:
./deploy.sh
```

### Scale Services
```bash
# Increase backend capacity
aws ecs update-service --cluster sage-cluster --service sage-backend-service --desired-count 2
```

### View Logs
```bash
# Real-time logs
aws logs tail /ecs/sage-backend --follow

# Search logs
aws logs filter-log-events --log-group-name /ecs/sage-backend --filter-pattern "ERROR"
```

### Rotate Secrets
```bash
# Update secret in Secrets Manager
aws secretsmanager update-secret --secret-id sage/prod/openai-api-key --secret-string "new-key"

# Force redeployment to pick up new secret
aws ecs update-service --cluster sage-cluster --service sage-backend-service --force-new-deployment
```

## Troubleshooting

### Tasks keep restarting
- Check CloudWatch logs for errors
- Verify secrets are accessible
- Check EFS mount points are configured correctly
- Verify security groups allow NFS traffic (port 2049)

### 502/504 Gateway Errors
- Check backend health checks are passing
- Verify CORS configuration matches frontend domain
- Check backend logs for application errors

### High costs
- Monitor OpenAI/Anthropic API usage in their dashboards
- Implement stricter rate limiting
- Review CloudWatch logs for unexpected API calls
- Consider caching responses

## Rollback

```bash
# List task definition revisions
aws ecs list-task-definitions --family-prefix sage-backend

# Update service to previous revision
aws ecs update-service --cluster sage-cluster \
  --service sage-backend-service \
  --task-definition sage-backend:PREVIOUS_REVISION
```
```

---

## Phase 4: Testing & Launch (Days 11-14)

### Day 11: Local Docker Testing

```bash
# 1. Create .env file from template
cp .env.production.example .env
# Edit .env with your actual keys

# 2. Build and test locally
docker-compose build
docker-compose up

# 3. Test endpoints
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs

# 4. Test API authentication
curl -H "Authorization: Bearer your-api-key" http://localhost:8000/api/surveys
```

### Day 12: AWS Deployment

```bash
# 1. Make deploy script executable
chmod +x deploy.sh

# 2. Update deploy.sh with your AWS account ID and region
# Edit: AWS_ACCOUNT_ID, AWS_REGION, domain name

# 3. Create CloudWatch log groups
aws logs create-log-group --log-group-name /ecs/sage-backend
aws logs create-log-group --log-group-name /ecs/sage-frontend

# 4. Run deployment
./deploy.sh

# 5. Register task definitions
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-frontend.json

# 6. Create ECS services (use AWS Console or CLI)
# See DEPLOYMENT.md for detailed commands
```

### Day 13: Smoke Testing

```bash
# 1. Get ALB DNS name
aws elbv2 describe-load-balancers --names sage-alb --query 'LoadBalancers[0].DNSName' --output text

# 2. Test frontend
curl https://your-alb-dns.us-east-1.elb.amazonaws.com

# 3. Test backend health
curl https://your-alb-dns.us-east-1.elb.amazonaws.com/api/

# 4. Test API with authentication
export API_KEY="your-api-key-from-secrets-manager"
curl -H "Authorization: Bearer $API_KEY" https://your-domain.com/api/surveys

# 5. Test full survey workflow
# - Create a survey via UI
# - Run survey
# - View results
# - Monitor CloudWatch logs for errors

# 6. Load testing (optional)
ab -n 100 -c 10 -H "Authorization: Bearer $API_KEY" https://your-domain.com/api/surveys
```

### Day 14: Monitoring Setup

```bash
# 1. Create CloudWatch dashboard
# Go to CloudWatch → Dashboards → Create dashboard
# Add widgets for:
# - ECS CPU/Memory utilization
# - ALB request count
# - ALB target response time
# - ALB 4XX/5XX errors
# - ECS task count

# 2. Set up cost alarm
aws cloudwatch put-metric-alarm \
  --alarm-name sage-high-costs \
  --alarm-description "Alert when estimated costs exceed $50/day" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:billing-alerts

# 3. Set up error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name sage-backend-errors \
  --alarm-description "Alert when backend error rate is high" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=app/sage-alb/... Name=TargetGroup,Value=targetgroup/sage-backend-tg/...

# 4. Monitor logs
aws logs tail /ecs/sage-backend --follow --filter-pattern "ERROR"

# 5. Test alerting
# Trigger intentional error and verify alarm fires
```

---

## API Keys & Secrets Management

### Current Status (CRITICAL)
- Current API keys are in `.env` files
- Keys are NOT in git repository (properly excluded)
- **MUST rotate keys before deployment**

### Production Setup

#### Step 1: Create New API Keys

**OpenAI**:
1. Go to https://platform.openai.com/api-keys
2. Create new key: `SAGE Production - [Date]`
3. Set usage limits: $100/month (adjust as needed)
4. Copy key (starts with `sk-proj-`)

**Anthropic**:
1. Go to https://console.anthropic.com/settings/keys
2. Create new key: `SAGE Production - [Date]`
3. Copy key (starts with `sk-ant-`)

**Application API Key**:
```bash
# Generate secure random key
openssl rand -hex 32
```

#### Step 2: Store in AWS Secrets Manager

```bash
# OpenAI key
aws secretsmanager create-secret \
  --name sage/prod/openai-api-key \
  --secret-string '{"OPENAI_API_KEY":"sk-proj-YOUR_KEY_HERE"}'

# Anthropic key
aws secretsmanager create-secret \
  --name sage/prod/anthropic-api-key \
  --secret-string '{"ANTHROPIC_API_KEY":"sk-ant-YOUR_KEY_HERE"}'

# App API key
aws secretsmanager create-secret \
  --name sage/prod/app-api-key \
  --secret-string '{"APP_API_KEY":"your-random-hex-key"}'
```

#### Step 3: Grant ECS Access

Add this policy to your `ecsTaskExecutionRole`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:sage/prod/*"
      ]
    }
  ]
}
```

#### Step 4: Client Authentication

Users accessing the API need to include the API key:

```bash
# JavaScript (React frontend)
axios.get('https://yourdomain.com/api/surveys', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});

# cURL
curl -H "Authorization: Bearer YOUR_API_KEY" https://yourdomain.com/api/surveys
```

### Key Rotation Schedule

- **Development keys**: Rotate every 90 days
- **Production keys**: Rotate every 30 days
- **After security incident**: Rotate immediately
- **When employee leaves**: Rotate immediately

---

## Security Measures

### Implemented in This Plan

1. **API Key Authentication**
   - Bearer token required for all API endpoints
   - Keys stored in AWS Secrets Manager
   - No keys in code or environment variables

2. **Rate Limiting**
   - 10 requests per minute per IP address
   - Prevents abuse and cost overruns
   - Returns 429 status when exceeded

3. **HTTPS Only**
   - TLS termination at Application Load Balancer
   - Certificates from AWS Certificate Manager
   - Automatic renewal

4. **CORS Restrictions**
   - Only allows requests from production domain
   - Prevents unauthorized cross-origin requests

5. **Network Security**
   - Backend in private subnets (no direct internet access)
   - Security groups restrict traffic between services
   - NAT gateway for outbound API calls only

6. **Container Security**
   - Non-root user in containers
   - Minimal base images (alpine, slim)
   - No secrets in container images
   - Automated security scanning in ECR

7. **Input Validation**
   - FastAPI Pydantic models validate all inputs
   - File upload restrictions (size, type)
   - Path traversal protection

8. **Logging & Monitoring**
   - All requests logged to CloudWatch
   - Error tracking and alerting
   - Cost monitoring alarms

### Additional Recommendations (Phase 2)

1. **Web Application Firewall (WAF)**
   - SQL injection protection
   - XSS protection
   - Rate limiting at edge
   - Cost: ~$10/month

2. **User Authentication**
   - OAuth2/JWT for user accounts
   - Per-user quotas and billing
   - Audit logs per user

3. **Database Encryption**
   - EFS encryption at rest (enable when creating)
   - Encryption in transit (enabled via TLS)

4. **Penetration Testing**
   - Hire security firm or use AWS Security Hub
   - Regular vulnerability scans

---

## Cost Breakdown

### Infrastructure Costs (Monthly)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **ECS Fargate** | Backend: 1 task, 0.5 vCPU, 1GB RAM | ~$15 |
| **ECS Fargate** | Frontend: 1 task, 0.25 vCPU, 0.5GB RAM | ~$8 |
| **Application Load Balancer** | 1 ALB + 2 target groups | ~$20 |
| **EFS** | 50GB storage + throughput | ~$15 |
| **NAT Gateway** | 1 NAT gateway + data transfer | ~$35 |
| **Route 53** | Hosted zone + queries | ~$1 |
| **CloudWatch** | Logs + metrics | ~$10 |
| **Secrets Manager** | 3 secrets | ~$1.50 |
| **Data Transfer** | Outbound data | ~$5 |
| **TOTAL INFRASTRUCTURE** | | **~$110/month** |

### Variable Costs

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **OpenAI API** | Depends on model and usage | $50-500+/month |
| **Anthropic API** | Depends on model and usage | $50-500+/month |
| **ECS (additional scaling)** | If auto-scaling triggers | $10-50/month |

### Cost Optimization Tips

1. **Use Fargate Spot** (70% discount):
   - Good for non-critical workloads
   - May be interrupted

2. **Schedule tasks**:
   - Scale down to 0 tasks during off-hours
   - Use CloudWatch Events to schedule

3. **Cache responses**:
   - Reduce duplicate LLM API calls
   - Implement Redis for caching (adds cost but saves on API)

4. **Monitor API usage**:
   - Set up OpenAI/Anthropic usage alerts
   - Implement per-survey cost tracking

5. **Reserved capacity**:
   - If usage is predictable, use Compute Savings Plans (up to 50% off)

### Cost Monitoring

```bash
# Set up billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name sage-monthly-budget \
  --alarm-description "Alert when monthly costs exceed $200" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 200 \
  --comparison-operator GreaterThanThreshold
```

---

## Architecture Diagram

```
                                    INTERNET
                                       │
                                       │ HTTPS (443)
                                       ▼
                            ┌──────────────────────┐
                            │   Route 53 (DNS)     │
                            │  sage.yourdomain.com │
                            └──────────┬───────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │ Application Load     │
                            │ Balancer (ALB)       │
                            │ - TLS Termination    │
                            │ - Path-based routing │
                            └──────────┬───────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │                                   │
                     │ /                                 │ /api/*
                     ▼                                   ▼
         ┌───────────────────────┐          ┌───────────────────────┐
         │  Frontend Target Grp  │          │  Backend Target Grp   │
         │    (Port 80)          │          │    (Port 8000)        │
         └───────────┬───────────┘          └───────────┬───────────┘
                     │                                   │
                     ▼                                   ▼
    ┌────────────────────────────┐      ┌────────────────────────────┐
    │  ECS Fargate Task          │      │  ECS Fargate Task          │
    │  ┌──────────────────────┐  │      │  ┌──────────────────────┐  │
    │  │ sage-frontend        │  │      │  │ sage-backend         │  │
    │  │ (Nginx + React SPA)  │  │      │  │ (FastAPI + Uvicorn) │  │
    │  │ Port: 80             │  │      │  │ Port: 8000           │  │
    │  └──────────────────────┘  │      │  └──────────┬───────────┘  │
    │                            │      │             │               │
    │  Private Subnet            │      │  Private Subnet            │
    └────────────────────────────┘      └─────────────┬──────────────┘
                                                      │
                                                      │ Mounts
                                                      ▼
                                        ┌──────────────────────────┐
                                        │  Amazon EFS              │
                                        │  - /config               │
                                        │  - /results              │
                                        │  - /ground_truths        │
                                        │  - /experiments          │
                                        │  - /uploads              │
                                        └──────────────────────────┘

                                        ┌──────────────────────────┐
                                        │  AWS Secrets Manager     │
                                        │  - OPENAI_API_KEY        │
                                        │  - ANTHROPIC_API_KEY     │
                                        │  - APP_API_KEY           │
                                        └──────────────────────────┘

                                        ┌──────────────────────────┐
                                        │  CloudWatch Logs         │
                                        │  - /ecs/sage-backend     │
                                        │  - /ecs/sage-frontend    │
                                        └──────────────────────────┘

                                        ┌──────────────────────────┐
                                        │  NAT Gateway             │
                                        │  (Outbound to OpenAI/    │
                                        │   Anthropic APIs)        │
                                        └──────────────────────────┘
```

### Request Flow

1. **User** → accesses `https://sage.yourdomain.com`
2. **Route 53** → resolves to ALB IP
3. **ALB** → terminates HTTPS, forwards to frontend target group
4. **Frontend Task** → serves React SPA (index.html)
5. **User** → clicks "Run Survey"
6. **React App** → sends `POST /api/run-survey` with `Authorization: Bearer API_KEY`
7. **ALB** → routes `/api/*` to backend target group
8. **Backend Task** → validates API key, checks rate limit
9. **Backend** → retrieves secrets from Secrets Manager
10. **Backend** → makes calls to OpenAI/Anthropic APIs via NAT Gateway
11. **Backend** → saves results to EFS (`/results`)
12. **Backend** → returns response to React App
13. **React App** → displays results to user

---

## Troubleshooting

### Problem: Docker build fails locally

**Symptoms**:
```
ERROR: failed to solve: failed to compute cache key
```

**Solutions**:
- Ensure you're running from project root directory
- Check `.dockerignore` isn't excluding required files
- Try building without cache: `docker build --no-cache`
- Verify all COPY paths exist

### Problem: Container starts but immediately exits

**Symptoms**:
- ECS tasks show "STOPPED" status
- CloudWatch logs show startup errors

**Solutions**:
```bash
# Check CloudWatch logs
aws logs tail /ecs/sage-backend --follow

# Common issues:
# 1. Missing secrets → verify Secrets Manager ARNs
# 2. EFS mount fails → check security groups allow NFS (2049)
# 3. Port already in use → ensure EXPOSE matches containerPort
# 4. Python module errors → rebuild with updated requirements.txt
```

### Problem: 502 Bad Gateway from ALB

**Symptoms**:
- Frontend loads but API calls fail with 502

**Solutions**:
```bash
# 1. Check backend health
aws ecs describe-services --cluster sage-cluster --service sage-backend-service

# 2. Verify target group health checks
aws elbv2 describe-target-health --target-group-arn YOUR_BACKEND_TG_ARN

# 3. Common issues:
# - Backend health check path wrong (should be `/`)
# - Backend not listening on 0.0.0.0:8000
# - Security group blocking ALB → backend communication
# - CORS configuration rejecting requests
```

### Problem: CORS errors in browser console

**Symptoms**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions**:
1. Verify `CORS_ORIGINS` environment variable in backend task definition
2. Should be: `https://yourdomain.com` (no trailing slash)
3. Redeploy backend after changing environment variables
4. Check browser DevTools Network tab for preflight OPTIONS requests

### Problem: "Invalid API key" error

**Symptoms**:
- API returns 401 Unauthorized

**Solutions**:
```bash
# 1. Verify APP_API_KEY in Secrets Manager
aws secretsmanager get-secret-value --secret-id sage/prod/app-api-key

# 2. Ensure frontend is sending correct header
# Check browser DevTools → Network → Headers:
# Authorization: Bearer YOUR_KEY_HERE

# 3. Update frontend .env:
REACT_APP_API_KEY=your-key-here

# 4. Rebuild and redeploy frontend
```

### Problem: High costs / unexpected API usage

**Symptoms**:
- AWS billing alert
- OpenAI/Anthropic usage spike

**Solutions**:
```bash
# 1. Check CloudWatch Logs for API call patterns
aws logs filter-log-events --log-group-name /ecs/sage-backend \
  --filter-pattern "openai" --start-time $(date -d '1 hour ago' +%s)000

# 2. Verify rate limiting is working
# Should see 429 responses in logs

# 3. Check for retry loops or infinite calls

# 4. Temporarily scale down or stop service
aws ecs update-service --cluster sage-cluster --service sage-backend-service --desired-count 0

# 5. Implement additional protections:
# - Per-user quotas
# - Cost tracking per survey
# - Max survey size limits
```

### Problem: EFS mount timeout

**Symptoms**:
```
Failed to mount EFS: Connection timeout
```

**Solutions**:
1. **Check Security Groups**:
   - ECS task security group must allow outbound NFS (port 2049)
   - EFS mount target security group must allow inbound NFS from ECS tasks

2. **Verify Subnets**:
   - ECS tasks and EFS mount targets must be in same VPC
   - EFS mount targets must exist in same subnets as ECS tasks

3. **Check Access Points**:
```bash
aws efs describe-access-points --file-system-id fs-YOUR_EFS_ID
```

### Problem: Cannot access application via domain

**Symptoms**:
- `curl: (6) Could not resolve host: sage.yourdomain.com`

**Solutions**:
1. **Verify DNS**:
```bash
dig sage.yourdomain.com
nslookup sage.yourdomain.com
```

2. **Check Route 53 record**:
   - Ensure A record points to ALB
   - Verify alias target is correct
   - Wait 5-10 minutes for DNS propagation

3. **Test with ALB DNS directly**:
```bash
# Get ALB DNS
aws elbv2 describe-load-balancers --names sage-alb

# Test directly
curl http://YOUR-ALB-DNS.us-east-1.elb.amazonaws.com
```

---

## Summary Checklist

### Pre-Deployment
- [ ] Rotate OpenAI and Anthropic API keys
- [ ] Generate secure APP_API_KEY
- [ ] Set up AWS account and configure CLI
- [ ] Verify Docker installed locally
- [ ] Test local Docker builds

### Phase 1: Containerization (Days 1-3)
- [ ] Create `Dockerfile.backend`
- [ ] Create `Dockerfile.frontend`
- [ ] Create `nginx.conf`
- [ ] Create `.dockerignore`
- [ ] Create `docker-compose.yml`
- [ ] Create `.env.production.example`
- [ ] Create `backend/middleware/api_key_auth.py`
- [ ] Create `backend/middleware/rate_limit.py`
- [ ] Update `backend/main.py` with security middleware
- [ ] Test locally with `docker-compose up`

### Phase 2: AWS Infrastructure (Days 4-7)
- [ ] Create VPC with public/private subnets
- [ ] Store secrets in AWS Secrets Manager
- [ ] Create ECR repositories (backend, frontend)
- [ ] Create EFS file system with access points
- [ ] Create Application Load Balancer
- [ ] Create target groups (backend, frontend)
- [ ] Request and validate ACM SSL certificate
- [ ] Set up Route 53 DNS (optional)
- [ ] Create ECS Fargate cluster
- [ ] Create IAM roles (ecsTaskExecutionRole, ecsTaskRole)
- [ ] Create CloudWatch log groups

### Phase 3: Deployment Config (Days 8-10)
- [ ] Create `task-definition-backend.json`
- [ ] Create `task-definition-frontend.json`
- [ ] Create `deploy.sh` script
- [ ] Create `.github/workflows/deploy.yml` (optional)
- [ ] Create `DEPLOYMENT.md` documentation
- [ ] Update all placeholder values (account ID, region, domain)
- [ ] Make scripts executable (`chmod +x deploy.sh`)

### Phase 4: Launch (Days 11-14)
- [ ] Build and push Docker images to ECR
- [ ] Register ECS task definitions
- [ ] Create ECS services
- [ ] Verify tasks are running and healthy
- [ ] Test frontend at `https://yourdomain.com`
- [ ] Test API with authentication
- [ ] Run full survey workflow test
- [ ] Set up CloudWatch dashboards
- [ ] Configure cost and error alarms
- [ ] Load test (optional)
- [ ] Document any issues in runbook

### Post-Launch
- [ ] Monitor CloudWatch logs for 24 hours
- [ ] Set up key rotation schedule (30 days)
- [ ] Create backup strategy for EFS
- [ ] Plan security hardening phase 2
- [ ] Schedule monthly cost reviews

---

## Next Steps After Deployment

### Immediate (Week 1-2)
1. **Monitor closely**: Watch logs, metrics, and costs daily
2. **User testing**: Get feedback from real users
3. **Performance tuning**: Adjust task CPU/memory based on actual usage
4. **Security audit**: Review logs for suspicious activity

### Short-term (Month 1-2)
1. **Auto-scaling**: Implement ECS auto-scaling based on CPU/requests
2. **Caching**: Add Redis for response caching to reduce API costs
3. **Backups**: Automated EFS snapshots to S3
4. **Monitoring**: Enhanced dashboards and alerting

### Medium-term (Month 3-6)
1. **User authentication**: Implement OAuth2/JWT for user accounts
2. **Multi-region**: Deploy to second region for redundancy
3. **CDN**: Add CloudFront in front of ALB for global performance
4. **Database**: Consider migrating to RDS if file-based storage becomes limiting

### Long-term (6+ months)
1. **Kubernetes**: Migrate to EKS if advanced orchestration needed
2. **Microservices**: Split backend into multiple services
3. **Real-time features**: Implement WebSocket support for live updates
4. **Advanced analytics**: Track survey performance metrics

---

## Support & Resources

### AWS Documentation
- [ECS Fargate Guide](https://docs.aws.amazon.com/AmazonECS/latest/userguide/what-is-fargate.html)
- [ALB Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
- [EFS Guide](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
- [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

### Docker Resources
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

### Cost Optimization
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/aws-cost-optimization/)
- [Fargate Spot](https://aws.amazon.com/fargate/pricing/)

---

## Conclusion

This plan provides a complete path from local development to production AWS deployment in 10-14 days. The architecture is designed for:

- **Fast deployment**: Minimal complexity, serverless compute
- **Cost-effective**: ~$110/month infrastructure + API costs
- **Secure**: API key authentication, HTTPS, secrets management
- **Scalable**: Can easily scale to handle more traffic
- **Maintainable**: Automated deployment, comprehensive monitoring

After completing this plan, you'll have:
- ✅ Containerized application
- ✅ Production-ready AWS infrastructure
- ✅ Public HTTPS URL
- ✅ Secure API key management
- ✅ Monitoring and alerting
- ✅ Automated deployment pipeline (optional)

**Estimated Timeline**: 10-14 days
**Estimated Cost**: $110/month + API usage
**Files to Create**: 12 new files
**AWS Resources**: 10+ services configured

Ready to get started? Begin with Phase 1: Docker Containerization!
