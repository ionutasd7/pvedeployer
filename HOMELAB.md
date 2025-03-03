
# Homelab Deployment Guide

## Prerequisites

1. A Proxmox VE server (version 7.0 or higher)
2. Network access to the Proxmox API endpoint (usually on port 8006)
3. Linux or Unix-based system to host the application
4. PostgreSQL database
5. Python 3.11 or higher

## Deployment Steps

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y python3 python3-pip python3-venv postgresql nginx

# Create a dedicated user
sudo useradd -m -s /bin/bash proxmox-interface
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql -c "CREATE USER proxmox_deployer WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE DATABASE proxmox_deployer OWNER proxmox_deployer;"
```

### 3. Application Setup

```bash
# Switch to application user
sudo su - proxmox-interface

# Clone the repository
git clone https://github.com/yourusername/proxmox-deployment-interface.git
cd proxmox-deployment-interface

# Install dependencies
pip install -r requirements.txt

# Create the environment file
cat > .env << EOF
DATABASE_URL=postgresql://proxmox_deployer:secure_password@localhost/proxmox_deployer
SESSION_SECRET=your_random_secure_session_key
PROXMOX_HOST=your_proxmox_ip
PROXMOX_USER=root@pam
PROXMOX_PASSWORD=your_proxmox_password
EOF
```

### 4. Database Initialization

```bash
# Initialize the database
flask db upgrade
```

### 5. Systemd Service Configuration

Create a systemd service file:

```bash
# Exit to root user
exit

# Create service file
sudo nano /etc/systemd/system/proxmox-interface.service
```

Add the following content:

```ini
[Unit]
Description=Proxmox Deployment Interface
After=network.target postgresql.service

[Service]
User=proxmox-interface
WorkingDirectory=/home/proxmox-interface/proxmox-deployment-interface
ExecStart=/home/proxmox-interface/.local/bin/gunicorn --bind 127.0.0.1:5000 main:app
Restart=always
RestartSec=5
Environment=PATH=/home/proxmox-interface/.local/bin:/usr/bin:$PATH

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable proxmox-interface
sudo systemctl start proxmox-interface
```

### 6. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/proxmox-interface
```

Add the following content:

```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/proxmox-interface /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Configuration with Certbot (Optional but Recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 8. Firewall Configuration

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 9. First Login

1. Navigate to your server's domain name or IP address
2. Create an admin account on first login
3. Add your Proxmox nodes through the web interface

## Updating the Application

```bash
cd /home/proxmox-interface/proxmox-deployment-interface
git pull
pip install -r requirements.txt
sudo systemctl restart proxmox-interface
```

## Troubleshooting

### Application not starting
- Check logs: `sudo journalctl -u proxmox-interface`
- Verify database connection
- Ensure Proxmox API is accessible

### Connection issues with Proxmox
- Verify Proxmox credentials
- Check firewall rules allowing traffic to port 8006
- Verify network connectivity

### Database errors
- Check PostgreSQL logs: `sudo journalctl -u postgresql`
- Verify database user permissions

### Web Interface not accessible
- Check Nginx logs: `sudo cat /var/log/nginx/error.log`
- Verify Nginx configuration
- Check if application is running: `sudo systemctl status proxmox-interface`
