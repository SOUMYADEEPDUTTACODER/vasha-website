# Vercel Frontend Configuration for AWS Backend

This guide explains how to configure your Vercel-deployed frontend to connect to your AWS EC2 backend.

## 🔧 Step 1: Add Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Click on your project

2. **Go to Settings → Environment Variables**

3. **Add New Environment Variable**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `http://YOUR_EC2_PUBLIC_IP:8000`
     - Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 instance public IP
     - Example: `http://54.123.45.67:8000`
   - **Environment**: Select all (Production, Preview, Development)
   - Click "Save"

4. **Redeploy Your Application**
   - Go to "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"
   - Or push a new commit to trigger a new deployment

## 🌐 Step 2: Using a Domain Name (Optional but Recommended)

If you set up a domain name for your backend:

1. **Update Environment Variable**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://api.yourdomain.com` (or your backend domain)
   - Make sure to use `https` if you've set up SSL

2. **Update Backend CORS**:
   - In your AWS EC2 instance, edit `.env` file:
     ```env
     FRONTEND_URL=https://your-vercel-app.vercel.app
     ```
   - Restart the backend service:
     ```bash
     sudo systemctl restart vashafront-backend
     ```

## 🔒 Step 3: HTTPS Configuration (Recommended)

For production, you should use HTTPS:

### Option A: Use Application Load Balancer (Recommended)
1. Set up AWS Application Load Balancer
2. Configure SSL certificate via AWS Certificate Manager
3. Update `VITE_API_BASE_URL` to use the load balancer URL with `https://`

### Option B: Use Nginx Reverse Proxy
1. Set up Nginx on your EC2 instance
2. Configure Let's Encrypt SSL certificate
3. Update `VITE_API_BASE_URL` to use your domain with `https://`

## 📝 Example Configuration

**Before (Local Development)**:
```env
VITE_API_BASE_URL=http://localhost:8000
```

**After (Production with AWS EC2)**:
```env
VITE_API_BASE_URL=http://54.123.45.67:8000
```

**After (Production with Domain)**:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## ✅ Verification

After deploying, verify the configuration:

1. **Open your Vercel app** in a browser
2. **Open Developer Tools** (F12) → Console tab
3. **Check for API calls** - they should go to your AWS backend URL
4. **Test ASR/TTS/MT features** to ensure they work

## 🐛 Troubleshooting

### API calls still going to localhost

- **Issue**: Frontend still using localhost
- **Solution**: 
  - Ensure environment variable is set correctly in Vercel
  - Redeploy the application
  - Check browser cache (hard refresh: Ctrl+Shift+R)

### CORS errors

- **Issue**: CORS policy blocking requests
- **Solution**:
  - Update `FRONTEND_URL` in backend `.env` file to include your Vercel URL
  - Restart backend service: `sudo systemctl restart vashafront-backend`
  - Check backend logs: `sudo journalctl -u vashafront-backend -f`

### Connection refused

- **Issue**: Cannot connect to backend
- **Solution**:
  - Check if backend is running: `sudo systemctl status vashafront-backend`
  - Check EC2 Security Group - ensure port 8000 is open
  - Check backend firewall: `sudo ufw status`
  - Verify backend is accessible: `curl http://YOUR_IP:8000/docs`

## 📚 Related Documentation

- [AWS Deployment Guide](./backend/AWS_DEPLOYMENT_GUIDE.md)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
