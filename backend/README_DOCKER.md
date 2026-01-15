# Docker Quick Start

## 🚀 Quick Commands

### Local Development (CPU)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### AWS EC2 Deployment (CPU)

```bash
# Build
docker build -t vashafront-backend:latest .

# Run
docker run -d \
  --name vashafront-backend \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/tts_output:/app/tts_output \
  -v $(pwd)/chunks:/app/chunks \
  --restart unless-stopped \
  vashafront-backend:latest
```

### AWS EC2 Deployment (GPU - g4dn.xlarge)

```bash
# Build
docker build -f Dockerfile.gpu -t vashafront-backend-gpu:latest .

# Run
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

## 📚 Full Documentation

See [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) for detailed instructions.
