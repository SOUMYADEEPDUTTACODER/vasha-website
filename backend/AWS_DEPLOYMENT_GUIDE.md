# AWS EC2 Deployment Guide for Vashafront Backend

This guide walks you through deploying your FastAPI backend with ML models (ASR, TTS, MT) to AWS EC2.

## 📋 Prerequisites

- AWS Account
- AWS CLI installed (optional, but recommended)
- SSH client (Windows: Git Bash, PuTTY, or WSL)
- Your Vercel frontend URL (for CORS configuration)

---

## 🎯 AWS EC2 Instance Recommendations

### Instance Type (for ML workloads)

**Recommended Options:**
- **t3.medium** (2 vCPU, 4 GB RAM) - ~$30/month - Good for testing/small scale
- **t3.large** (2 vCPU, 8 GB RAM) - ~$60/month - Recommended for production
- **t3.xlarge** (4 vCPU, 16 GB RAM) - ~$120/month - For higher load

**Why these?**
- Your ML models (PyTorch, Whisper, TTS) need 4-8 GB RAM minimum
- Burstable performance (t3) is cost-effective for variable workloads
- Consider GPU instances (g4dn) if you need faster inference (~$150+/month)

### Storage
- **Root Volume**: 30-50 GB (default 8 GB is too small for models)
- Models can be 5-15 GB total, so plan accordingly

### Network
- Allow HTTP (80), HTTPS (443), and your API port (8000)
- Or use Application Load Balancer (recommended for production)

---

## 🚀 Step-by-Step Deployment

### Step 1: Launch EC2 Instance

1. **Log into AWS Console**
   - Go to https://aws.amazon.com/console/
   - Navigate to **EC2** service

2. **Launch Instance**
   - Click "Launch Instance"
   - **Name**: `vashafront-backend`

3. **Choose AMI (Amazon Machine Image)**
   - **Ubuntu Server 22.04 LTS** (Free tier eligible, recommended)
   - Architecture: 64-bit (x86)

4. **Instance Type**
   - Select **t3.medium** (or t3.large for production)
   - Review pricing on the right panel

5. **Key Pair (Important!)**
   - **Create new key pair** (if you don't have one)
   - Name: `vashafront-backend-key`
   - Key pair type: **RSA**
   - Private key file format: **.pem** (for OpenSSH)
   - **Download and save** the `.pem` file securely
   - ⚠️ **You can only download this once!**

6. **Network Settings**
   - **Auto-assign Public IP**: Enable
   - **Security Group**: Create new security group
   - **Name**: `vashafront-backend-sg`
   - **Description**: Security group for Vashafront API
   - **Inbound Rules**: Add these rules:
     ```
     Type          Protocol    Port Range    Source
     SSH           TCP         22            My IP (or 0.0.0.0/0 for testing)
     HTTP          TCP         80            0.0.0.0/0
     HTTPS         TCP         443           0.0.0.0/0
     Custom TCP    TCP         8000          0.0.0.0/0  (for API)
     ```
   - ⚠️ For production, restrict SSH (port 22) to your IP only

7. **Configure Storage**
   - **Size**: 30 GB (minimum) - 50 GB recommended
   - **Volume Type**: gp3 (General Purpose SSD)
   - Keep encryption enabled

8. **Review and Launch**
   - Review all settings
   - Click "Launch Instance"
   - Wait for instance to be "Running" (green checkmark)

9. **Note Your Instance Details**
   - Click on the instance ID
   - Note the **Public IPv4 address** (e.g., `54.123.45.67`)
   - Note the **Public IPv4 DNS** (e.g., `ec2-54-123-45-67.compute-1.amazonaws.com`)

---

### Step 2: Connect to Your EC2 Instance

#### On Windows (Git Bash or WSL)

1. **Set proper permissions** (if using Git Bash/WSL):
   ```bash
   chmod 400 vashafront-backend-key.pem
   ```

2. **Connect via SSH**:
   ```bash
   ssh -i vashafront-backend-key.pem ubuntu@YOUR_PUBLIC_IP
   # Replace YOUR_PUBLIC_IP with your instance's public IP
   # Example: ssh -i vashafront-backend-key.pem ubuntu@54.123.45.67
   ```

3. **If you get "Permission denied"**:
   - On Windows: Use PowerShell or CMD with:
     ```powershell
     ssh -i "C:\path\to\vashafront-backend-key.pem" ubuntu@YOUR_PUBLIC_IP
     ```
   - Ensure the key file path is correct

#### On Mac/Linux

```bash
chmod 400 vashafront-backend-key.pem
ssh -i vashafront-backend-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

### Step 3: Initial Server Setup

Once connected, run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y python3 python3-pip python3-venv git curl wget

# Install FFmpeg (required for audio/video processing)
sudo apt install -y ffmpeg

# Install MongoDB (or use MongoDB Atlas - recommended)
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

---

### Step 4: Upload Your Backend Code

**Option A: Using Git (Recommended)**

If your code is in a Git repository:

```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/vashafront/backend

# Or if you have a private repo, set up SSH keys first
```

**Option B: Using SCP (Secure Copy)**

From your local machine (Windows PowerShell, Git Bash, or terminal):

```bash
# From your local machine, navigate to your project directory
cd "C:\Users\SOEE\Desktop\vahsa web - Copy - Copy (2)\vashafront\backend"

# Upload backend folder
scp -i vashafront-backend-key.pem -r . ubuntu@YOUR_PUBLIC_IP:~/vashafront-backend

# Then on the server:
ssh -i vashafront-backend-key.pem ubuntu@YOUR_PUBLIC_IP
cd ~/vashafront-backend
```

**Option C: Using AWS Systems Manager Session Manager** (if configured)

---

### Step 5: Setup Python Environment

On your EC2 instance:

```bash
# Navigate to backend directory
cd ~/vashafront-backend  # or wherever you uploaded the code

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install system dependencies for PyTorch (if needed)
sudo apt install -y build-essential

# Install Python dependencies
pip install -r requirements.txt

# Install spaCy language model
python -m spacy download en_core_web_lg
```

**Note**: Installation may take 10-20 minutes due to PyTorch and ML libraries.

---

### Step 6: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
# OR use MongoDB Atlas (recommended):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vasha?retryWrites=true&w=majority

# JWT Secret Key (generate a strong random key)
SECRET_KEY=your-super-secret-key-minimum-32-characters-long

# SMTP Configuration (for email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password

# Optional: Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Generate SECRET_KEY**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save and exit (Ctrl+X, then Y, then Enter).

---

### Step 7: Configure MongoDB

**Option A: Local MongoDB** (Simple, but uses instance resources)

```bash
# MongoDB should already be installed and running
# Verify it's running
sudo systemctl status mongodb

# Test MongoDB connection
mongosh
# Or if mongosh is not installed:
mongo
```

**Option B: MongoDB Atlas** (Recommended - Free tier available)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster (M0 - 512 MB free)
3. Create database user
4. Add your EC2 IP to IP whitelist (or use 0.0.0.0/0 for testing)
5. Get connection string
6. Update `MONGODB_URI` in `.env` file

---

### Step 8: Configure Firewall (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS (for future use with reverse proxy)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow your API port
sudo ufw allow 8000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Note**: EC2 Security Group also acts as a firewall. Make sure port 8000 is open in the Security Group (Step 1).

---

### Step 9: Update Backend CORS Settings

Edit `main.py` to allow your Vercel frontend:

```python
# In main.py, update CORS middleware:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",  # Your Vercel frontend URL
        "http://localhost:5173",  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Or use environment variable for flexibility (see Step 10).

---

### Step 10: Run the Server

#### For Testing (Temporary)

```bash
cd ~/vashafront-backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

Test from your browser:
```
http://YOUR_PUBLIC_IP:8000/docs
```

#### For Production (Using systemd - Recommended)

Create a systemd service:

```bash
sudo nano /etc/systemd/system/vashafront-backend.service
```

Add this content:

```ini
[Unit]
Description=Vashafront Backend API
After=network.target mongodb.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/vashafront-backend
Environment="PATH=/home/ubuntu/vashafront-backend/venv/bin"
ExecStart=/home/ubuntu/vashafront-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=vashafront-backend

[Install]
WantedBy=multi-user.target
```

**Important**: Update the paths (`/home/ubuntu/vashafront-backend`) to match your actual directory.

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable vashafront-backend

# Start service
sudo systemctl start vashafront-backend

# Check status
sudo systemctl status vashafront-backend

# View logs
sudo journalctl -u vashafront-backend -f
```

---

### Step 11: Update Frontend Configuration

Update your frontend to use the AWS backend URL.

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   VITE_API_BASE_URL=https://YOUR_PUBLIC_IP:8000
   # Or use your domain if you set one up
   ```
4. Redeploy your frontend

**Or update frontend code** (see frontend updates section below).

---

### Step 12: Test Your Deployment

1. **Test API directly**:
   ```bash
   curl http://YOUR_PUBLIC_IP:8000/docs
   ```

2. **Test from browser**:
   ```
   http://YOUR_PUBLIC_IP:8000/docs
   ```

3. **Test from your Vercel frontend**:
   - Open your Vercel app
   - Try using ASR/TTS/MT features
   - Check browser console for errors

---

## 🔒 Security Best Practices

### 1. Use HTTPS (SSL/TLS)

**Option A: Application Load Balancer + ACM (Recommended)**

1. Create Application Load Balancer
2. Request SSL certificate via AWS Certificate Manager (ACM)
3. Terminate SSL at the load balancer
4. Forward HTTP to EC2 instance (port 8000)

**Option B: Nginx Reverse Proxy + Let's Encrypt**

```bash
# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configure Nginx (see Nginx configuration section)
# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 2. Restrict SSH Access

In EC2 Security Group, change SSH (port 22) source to "My IP" instead of 0.0.0.0/0.

### 3. Use Strong Secrets

- Generate strong SECRET_KEY
- Use app-specific passwords for email
- Store secrets in AWS Systems Manager Parameter Store or Secrets Manager

### 4. Regular Updates

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y
```

---

## 🌐 Optional: Setup Domain Name

1. **Purchase domain** (Route 53, Namecheap, etc.)

2. **Create A Record**:
   ```
   Type: A
   Name: api (or @ for root domain)
   Value: YOUR_PUBLIC_IP
   TTL: 300
   ```

3. **Update CORS** in backend to include your domain

4. **Update frontend** to use domain instead of IP

---

## 📊 Monitoring & Logs

### View Application Logs

```bash
# View service logs
sudo journalctl -u vashafront-backend -f

# View last 100 lines
sudo journalctl -u vashafront-backend -n 100

# View logs since today
sudo journalctl -u vashafront-backend --since today
```

### Monitor Resources

```bash
# Check CPU and memory usage
htop
# or
top

# Check disk usage
df -h

# Check memory
free -h
```

### CloudWatch (Optional)

- Enable CloudWatch monitoring in EC2 instance settings
- Set up CloudWatch alarms for CPU, memory, disk usage

---

## 🐛 Troubleshooting

### Server not accessible

```bash
# Check if service is running
sudo systemctl status vashafront-backend

# Check if port is listening
sudo netstat -tulpn | grep 8000
# or
sudo ss -tulpn | grep 8000

# Check firewall
sudo ufw status

# Check security group in AWS Console
# Ensure port 8000 is open in inbound rules
```

### Service won't start

```bash
# Check service logs
sudo journalctl -u vashafront-backend -n 50

# Check if port is already in use
sudo lsof -i :8000

# Test manually
cd ~/vashafront-backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### MongoDB connection issues

```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check MongoDB logs
sudo journalctl -u mongodb -n 50

# Test MongoDB connection
mongosh
# or
mongo
```

### Out of memory

```bash
# Check memory usage
free -h

# If memory is low, consider:
# 1. Upgrade to larger instance (t3.large or t3.xlarge)
# 2. Use smaller Whisper models
# 3. Enable swap (not recommended for production)
```

### Module import errors

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path
which python
python --version
```

---

## 💰 Cost Optimization

1. **Use Reserved Instances** (1-3 year commitment for 30-60% savings)
2. **Stop instance when not in use** (for development/testing)
3. **Use Spot Instances** (for non-critical workloads, up to 90% savings)
4. **Monitor with Cost Explorer** in AWS Console
5. **Set up billing alerts** to avoid surprises

**Estimated Monthly Costs:**
- EC2 t3.medium: ~$30/month
- Data transfer: ~$0.09/GB (first 100 GB free)
- EBS storage (30 GB): ~$3/month
- **Total: ~$33-40/month** (excluding data transfer)

---

## 📝 Quick Reference

### Service Management

```bash
# Start service
sudo systemctl start vashafront-backend

# Stop service
sudo systemctl stop vashafront-backend

# Restart service
sudo systemctl restart vashafront-backend

# Check status
sudo systemctl status vashafront-backend

# View logs
sudo journalctl -u vashafront-backend -f
```

### Common Directories

```bash
# Backend code
cd ~/vashafront-backend

# Environment file
nano ~/vashafront-backend/.env

# Service file
sudo nano /etc/systemd/system/vashafront-backend.service

# Logs
sudo journalctl -u vashafront-backend
```

### Useful Commands

```bash
# SSH into instance
ssh -i key.pem ubuntu@YOUR_IP

# Check if service is running
sudo systemctl is-active vashafront-backend

# Check port
sudo netstat -tulpn | grep 8000

# View resource usage
htop
```

---

## 🎉 Next Steps

1. ✅ Test all API endpoints
2. ✅ Update frontend to use AWS backend URL
3. ✅ Set up domain name (optional)
4. ✅ Configure HTTPS/SSL (recommended)
5. ✅ Set up monitoring and alerts
6. ✅ Configure automated backups
7. ✅ Set up CI/CD pipeline (optional)

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Need Help?** Check the troubleshooting section or AWS support documentation.
