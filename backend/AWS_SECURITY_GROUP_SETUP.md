# AWS Security Group Setup - Adding Port 8000

After launching your EC2 instance, you need to add a rule to allow traffic on port 8000 (your API port).

## Quick Steps to Add Port 8000 Rule

### Method 1: From EC2 Instance Page (Easiest)

1. **Go to EC2 Dashboard**
   - In AWS Console, click on your running instance
   - Click on the instance ID to open instance details

2. **Open Security Tab**
   - Click on the **"Security"** tab
   - You'll see your security group (e.g., `launch-wizard-1` or `vashafront-backend-sg`)
   - Click on the security group name (it's a clickable link)

3. **Edit Inbound Rules**
   - In the security group page, click **"Edit inbound rules"** button
   - Click **"Add rule"** button
   - Configure the new rule:
     - **Type**: Custom TCP
     - **Port range**: `8000`
     - **Source**: `0.0.0.0/0` (or `::/0` for IPv6, or "Anywhere-IPv4" from dropdown)
     - **Description**: "Vashafront API"
   - Click **"Save rules"**

### Method 2: From Security Groups Page

1. **Navigate to Security Groups**
   - In AWS Console, go to **EC2** → **Security Groups** (left sidebar)
   - Find your security group (look for the one with your instance)

2. **Edit Inbound Rules**
   - Select the security group
   - Click **"Edit inbound rules"** tab
   - Click **"Add rule"**
   - Configure:
     - **Type**: Custom TCP
     - **Port range**: `8000`
     - **Source**: `0.0.0.0/0` or select "Anywhere-IPv4"
     - **Description**: "Vashafront API"
   - Click **"Save rules"**

## Complete Security Group Rules (After Setup)

Your security group should have these rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | 0.0.0.0/0 | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP (for future use) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS (for future use) |
| **Custom TCP** | **TCP** | **8000** | **0.0.0.0/0** | **Vashafront API** |

## Security Recommendations

### For Production:

1. **Restrict SSH Access**:
   - Change SSH (port 22) source from `0.0.0.0/0` to `My IP`
   - This prevents unauthorized SSH access attempts
   - AWS will automatically detect your IP when you select "My IP"

2. **Keep Port 8000 Open**:
   - Port 8000 needs to be accessible from the internet for your Vercel frontend
   - Keep it as `0.0.0.0/0` unless you want to restrict it to specific IPs

3. **Optional: Restrict to Vercel IPs** (Advanced):
   - Vercel uses dynamic IPs, so this is difficult
   - It's better to keep it open and rely on your backend authentication

## Troubleshooting

### Can't access port 8000?

1. **Check Security Group Rules**:
   - Verify port 8000 rule exists
   - Verify source is `0.0.0.0/0` or your IP

2. **Check Instance Firewall**:
   - SSH into your instance
   - Run: `sudo ufw status`
   - Ensure port 8000 is allowed: `sudo ufw allow 8000/tcp`

3. **Check if Service is Running**:
   - SSH into instance
   - Check service: `sudo systemctl status vashafront-backend`
   - Check if port is listening: `sudo netstat -tulpn | grep 8000`

## Visual Guide

1. **From Instance Page**:
   ```
   EC2 Dashboard → Click Instance → Security Tab → Click Security Group → Edit Inbound Rules → Add Rule
   ```

2. **From Security Groups**:
   ```
   EC2 Dashboard → Security Groups (Left Sidebar) → Select Your Security Group → Edit Inbound Rules → Add Rule
   ```

---

**Note**: The initial launch wizard doesn't allow custom ports, so you must add port 8000 rule after instance creation.
