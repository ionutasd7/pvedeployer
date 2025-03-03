
#!/bin/bash

# Proxmox Deployment Interface Installation Script for Debian 12
# This script installs and configures the Proxmox Deployment Interface

set -e

echo "====================================================================="
echo "Proxmox Deployment Interface - Debian 12 Installation Script"
echo "====================================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root"
  exit 1
fi

# Configuration variables - you can adjust these
APP_USER="proxmox-deployer"
APP_DIR="/opt/proxmox-deployer"
DB_USER="proxmox_deployer"
DB_NAME="proxmox_deployer"
DB_PASSWORD=$(openssl rand -hex 16)
SESSION_SECRET=$(openssl rand -hex 32)

echo "Step 1: Updating system packages..."
apt update && apt upgrade -y

echo "Step 2: Installing required dependencies..."
apt install -y python3 python3-pip python3-venv postgresql nginx certbot python3-certbot-nginx sudo git

echo "Step 3: Creating application user..."
useradd -m -s /bin/bash $APP_USER 2>/dev/null || echo "User $APP_USER already exists"

echo "Step 4: Setting up PostgreSQL database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database $DB_NAME already exists"
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo "Database created successfully"
fi

echo "Step 5: Creating application directory..."
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

echo "Step 6: Cloning the repository..."
cd /tmp
if [ -d "proxmox-deployment-interface" ]; then
    rm -rf proxmox-deployment-interface
fi

git clone https://github.com/$(pwd | xargs basename)/proxmox-deployment-interface.git
cp -R proxmox-deployment-interface/* $APP_DIR/
chown -R $APP_USER:$APP_USER $APP_DIR

echo "Step 7: Installing Python dependencies..."
cd $APP_DIR
pip3 install -r <(grep -v "^#" pyproject.toml | grep -o '".*"' | tr -d '"' | tr '\n' ' ')
pip3 install gunicorn psycopg2-binary python-dotenv

echo "Step 8: Creating environment file..."
cat > $APP_DIR/.env << EOF
# Database connection
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME

# Application security
SESSION_SECRET=$SESSION_SECRET
DEBUG=False

# Proxmox connection (update with your actual values)
PROXMOX_HOST=your_proxmox_ip_or_hostname
PROXMOX_USER=root@pam
PROXMOX_PASSWORD=your_proxmox_password
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

echo "Step 9: Initializing the database..."
cd $APP_DIR
sudo -u $APP_USER PYTHONPATH=$APP_DIR python3 -c "from app import db; db.create_all()"

echo "Step 10: Setting up systemd service..."
cat > /etc/systemd/system/proxmox-deployer.service << EOF
[Unit]
Description=Proxmox Deployment Interface
After=network.target postgresql.service

[Service]
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
Environment=PYTHONUNBUFFERED=1
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/local/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 --access-logfile - main:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "Step 11: Setting up Nginx..."
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME

cat > /etc/nginx/sites-available/proxmox-deployer << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/proxmox-deployer /etc/nginx/sites-enabled/

echo "Step 12: Enabling and starting services..."
systemctl daemon-reload
systemctl enable proxmox-deployer
systemctl start proxmox-deployer
systemctl enable nginx
systemctl restart nginx

echo "Step 13: Setting up SSL with Let's Encrypt..."
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
    certbot --nginx -d $DOMAIN_NAME
fi

echo "====================================================================="
echo "Installation complete!"
echo "====================================================================="
echo ""
echo "Default admin credentials:"
echo "- Email: admin@example.com"
echo "- Password: admin"
echo ""
echo "Please update the .env file with your Proxmox credentials:"
echo "nano $APP_DIR/.env"
echo ""
echo "Then restart the service:"
echo "systemctl restart proxmox-deployer"
echo ""
echo "Your application should be available at: http://$DOMAIN_NAME"
if [ "$SETUP_SSL" = "y" ]; then
    echo "or https://$DOMAIN_NAME"
fi
echo ""
echo "IMPORTANT: Change the default admin password after first login!"
echo "====================================================================="
