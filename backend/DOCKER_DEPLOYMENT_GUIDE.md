# Docker Deployment Guide for AWS EC2

This guide walks you through deploying your Vashafront backend using Docker on AWS EC2.

## 📋 Prerequisites

- AWS EC2 instance running (Ubuntu 22.04 recommended)
- Docker installed on EC2 instance
- Docker Compose installed (optional, for easier management)
- Access to your EC2 instance via SSH

## 🐳 Docker Files Overview

- **`Dockerfile`**: CPU-only version (for t3.medium, t3.large, etc.)
- **`Dockerfile.gpu`**: GPU-enabled version (for g4dn.xlarge, etc.)
- **`docker-compose.yml`**: Local development setup
- **`docker-compose.gpu.yml`**: GPU deployment setup

---

## 🚀 Step 1: Install Docker on EC2

SSH into your EC2 instance and run:

```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose (optional but recommended)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and log back in for group changes to take effect
exit
# SSH back in
```

---

## 📦 Step 2: Upload Your Backend Code

### Option A: Using Git (Recommended)

```bash
cd ~
git clone YOUR_REPO_URL
cd YOUR_REPO/vashafront/backend
```

### Option B: Using SCP (from your local machine)

```bash
# From your local machine
scp -i your-key.pem -r vashafront/backend ubuntu@YOUR_EC2_IP:~/vashafront-backend
```

---

## ⚙️ Step 3: Configure Environment Variables

Create a `.env` file:

```bash
cd ~/vashafront-backend  # or wherever you uploaded the code
nano .env
```

Add your configuration:

```env
# MongoDB Configuration
# For local MongoDB in Docker:
MONGODB_URI=mongodb://mongodb:27017/
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vasha?retryWrites=true&w=majority

# JWT Secret Key
SECRET_KEY=your-super-secret-key-minimum-32-characters-long

# Frontend URL (your Vercel app)
FRONTEND_URL=https://your-vercel-app.vercel.app

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Optional: Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🏗️ Step 4: Build and Run Docker Container

### For CPU Instance (t3.medium, t3.large, etc.)

```bash
# Build the Docker image
docker build -t vashafront-backend:latest .

# Run the container
docker run -d \
  --name vashafront-backend \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/tts_output:/app/tts_output \
  -v $(pwd)/chunks:/app/chunks \
  --restart unless-stopped \
  vashafront-backend:latest
```

### For GPU Instance (g4dn.xlarge, etc.)

First, install NVIDIA Container Toolkit:

```bash
# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

Then build and run:

```bash
# Build the GPU Docker image
docker build -f Dockerfile.gpu -t vashafront-backend-gpu:latest .

# Run the GPU container
docker run -d \
  --name vashafront-backend-gpu \
  --gpus all \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/tts_output:/app/tts_output \
  -v $(pwd)/chunks:/app/chunks \
  --restart unless-stopped \
  vashafront-backend-gpu:latest
```

---

## 🐳 Step 5: Using Docker Compose (Recommended)

### For CPU Instance

```bash
# Start services (backend + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### For GPU Instance

```bash
# Start services with GPU support
docker-compose -f docker-compose.gpu.yml up -d

# View logs
docker-compose -f docker-compose.gpu.yml logs -f

# Stop services
docker-compose -f docker-compose.gpu.yml down
```

---

## ✅ Step 6: Verify Deployment

```bash
# Check if container is running
docker ps

# Check logs
docker logs vashafront-backend

# Test API
curl http://localhost:8000/docs

# Or from your local machine
curl http://YOUR_EC2_IP:8000/docs
```

---

## 🔧 Common Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs vashafront-backend
docker logs -f vashafront-backend  # Follow logs

# Stop container
docker stop vashafront-backend

# Start container
docker start vashafront-backend

# Restart container
docker restart vashafront-backend

# Remove container
docker rm vashafront-backend

# Remove image
docker rmi vashafront-backend:latest

# Execute command inside container
docker exec -it vashafront-backend bash

# View container resource usage
docker stats vashafront-backend
```

---

## 🔄 Updating Your Application

### Method 1: Rebuild and Restart

```bash
# Stop and remove old container
docker stop vashafront-backend
docker rm vashafront-backend

# Pull latest code (if using Git)
git pull

# Rebuild image
docker build -t vashafront-backend:latest .

# Start new container
docker run -d \
  --name vashafront-backend \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/tts_output:/app/tts_output \
  -v $(pwd)/chunks:/app/chunks \
  --restart unless-stopped \
  vashafront-backend:latest
```

### Method 2: Using Docker Compose

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs vashafront-backend

# Check container status
docker ps -a

# Try running interactively to see errors
docker run -it --rm --env-file .env vashafront-backend:latest
```

### Port already in use

```bash
# Find what's using port 8000
sudo netstat -tulpn | grep 8000

# Stop the process or use different port
docker run -d -p 8001:8000 ...  # Use port 8001 instead
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

### GPU not detected

```bash
# Check if GPU is available
nvidia-smi

# Check if NVIDIA Docker runtime is installed
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

### MongoDB connection issues

```bash
# If using Docker Compose, check MongoDB container
docker-compose ps
docker-compose logs mongodb

# If using external MongoDB, verify connection string in .env
```

---

## 📊 Monitoring

### View Container Logs

```bash
# Real-time logs
docker logs -f vashafront-backend

# Last 100 lines
docker logs --tail 100 vashafront-backend

# Logs with timestamps
docker logs -t vashafront-backend
```

### Resource Usage

```bash
# Container stats
docker stats vashafront-backend

# System-wide Docker stats
docker stats
```

### Health Check

The Dockerfile includes a health check. View status:

```bash
docker inspect --format='{{.State.Health.Status}}' vashafront-backend
```

---

## 🔒 Security Best Practices

1. **Don't commit `.env` file** - It's in `.dockerignore`
2. **Use strong SECRET_KEY** - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. **Restrict MongoDB access** - Use MongoDB Atlas or firewall rules
4. **Keep Docker updated**: `sudo apt update && sudo apt upgrade docker.io`
5. **Use specific image tags** instead of `latest` in production

---

## 💡 Production Recommendations

1. **Use Docker Compose** for easier management
2. **Set up log rotation** to prevent disk space issues
3. **Monitor container health** with AWS CloudWatch
4. **Use ECR (Elastic Container Registry)** to store Docker images
5. **Consider ECS/Fargate** for container orchestration (if scaling)

---

## 📝 Quick Reference

### Build Commands

```bash
# CPU
docker build -t vashafront-backend:latest .

# GPU
docker build -f Dockerfile.gpu -t vashafront-backend-gpu:latest .
```

### Run Commands

```bash
# CPU
docker run -d --name vashafront-backend -p 8000:8000 --env-file .env vashafront-backend:latest

# GPU
docker run -d --name vashafront-backend --gpus all -p 8000:8000 --env-file .env vashafront-backend-gpu:latest
```

### Docker Compose

```bash
# CPU
docker-compose up -d

# GPU
docker-compose -f docker-compose.gpu.yml up -d
```

---

## 🎯 Next Steps

1. ✅ Container running successfully
2. ✅ Test API endpoints
3. ✅ Configure Vercel frontend to use your EC2 IP
4. ✅ Set up automatic restarts (using `--restart unless-stopped`)
5. ✅ Monitor logs and performance
6. ✅ Set up backups for volumes

---

**Need Help?** Check container logs: `docker logs vashafront-backend`
