# AWS Deployment Quick Start Guide

## 🎯 Overview

This guide provides a quick reference for deploying your Vashafront backend to AWS EC2 and connecting it to your Vercel frontend.

## 📋 Prerequisites Checklist

- [ ] AWS Account created
- [ ] Frontend deployed on Vercel
- [ ] Backend code ready for deployment
- [ ] MongoDB Atlas account (recommended) or MongoDB installation plan

## 🚀 Deployment Steps Summary

### 1. Launch EC2 Instance (5 minutes)
- **Instance Type**: t3.medium (2 vCPU, 4 GB RAM) - ~$30/month
- **AMI**: Ubuntu 22.04 LTS
- **Storage**: 30-50 GB
- **Security Group**: Allow ports 22 (SSH), 80, 443, 8000
- **Key Pair**: Create and download `.pem` file

### 2. Connect to EC2 (2 minutes)
```bash
ssh -i vashafront-backend-key.pem ubuntu@YOUR_PUBLIC_IP
```

### 3. Install Dependencies (10-20 minutes)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git curl ffmpeg mongodb
sudo systemctl start mongodb
```

### 4. Upload Backend Code (5 minutes)
```bash
# Option A: Git clone
git clone YOUR_REPO_URL
cd YOUR_REPO/vashafront/backend

# Option B: SCP (from local machine)
scp -i key.pem -r . ubuntu@YOUR_IP:~/vashafront-backend
```

### 5. Setup Python Environment (15-30 minutes)
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

### 6. Configure Environment Variables
```bash
nano .env
```

Add:
```env
MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=<generate-strong-key>
FRONTEND_URL=https://your-vercel-app.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 7. Setup Systemd Service
```bash
sudo nano /etc/systemd/system/vashafront-backend.service
```

Add service configuration (see full guide for details), then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vashafront-backend
sudo systemctl start vashafront-backend
```

### 8. Configure Vercel Frontend
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_BASE_URL` = `http://YOUR_EC2_IP:8000`
3. Redeploy your frontend

### 9. Test Deployment
- Backend API: `http://YOUR_EC2_IP:8000/docs`
- Frontend: Test ASR/TTS/MT features

## 📝 Key Files Modified

### Frontend
- ✅ All services now use `API_BASE_URL` from `src/config/api.ts`
- ✅ Environment variable: `VITE_API_BASE_URL` (set in Vercel)

### Backend
- ✅ CORS configured via `FRONTEND_URL` environment variable
- ✅ Environment variables in `.env` file

## 🔧 Configuration Files

### Backend `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/
SECRET_KEY=your-secret-key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel Environment Variable:
```
VITE_API_BASE_URL=http://YOUR_EC2_IP:8000
```

## 📚 Full Documentation

- **AWS Deployment Guide**: [backend/AWS_DEPLOYMENT_GUIDE.md](./backend/AWS_DEPLOYMENT_GUIDE.md)
- **Vercel Frontend Setup**: [VERCEL_FRONTEND_SETUP.md](./VERCEL_FRONTEND_SETUP.md)

## 💰 Estimated Costs

- **EC2 t3.medium**: ~$30/month
- **EBS Storage (30 GB)**: ~$3/month
- **Data Transfer**: ~$0.09/GB (first 100 GB free)
- **Total**: ~$33-40/month

## ⚡ Quick Commands Reference

```bash
# Service management
sudo systemctl status vashafront-backend
sudo systemctl restart vashafront-backend
sudo journalctl -u vashafront-backend -f

# Check ports
sudo netstat -tulpn | grep 8000

# Check firewall
sudo ufw status

# Monitor resources
htop
free -h
df -h
```

## 🐛 Common Issues

1. **CORS errors**: Update `FRONTEND_URL` in backend `.env` and restart service
2. **Connection refused**: Check Security Group and firewall settings
3. **Out of memory**: Upgrade to t3.large (8 GB RAM) instance
4. **Service won't start**: Check logs with `journalctl -u vashafront-backend -n 50`

## ✅ Post-Deployment Checklist

- [ ] Backend accessible at `http://YOUR_IP:8000/docs`
- [ ] Vercel frontend environment variable set
- [ ] Frontend redeployed
- [ ] CORS configured correctly
- [ ] MongoDB connection working
- [ ] All API endpoints tested
- [ ] SSL/HTTPS configured (optional but recommended)

---

**Need Help?** Refer to the detailed guides or check the troubleshooting sections.
