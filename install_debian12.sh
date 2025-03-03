#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Proxmox Deployment Interface - Debian 12 Installer${NC}"
echo -e "${GREEN}================================================${NC}"

# Check if running as root
if [ "$(id -u)" -eq 0 ]; then
    echo -e "${RED}This script should not be run as root.${NC}"
    echo -e "Please run it as a regular user with sudo privileges."
    exit 1
fi

# Function to prompt for environment variables
setup_environment() {
    echo -e "\n${GREEN}Setting up environment variables...${NC}"

    # Create .env file
    ENV_FILE="/opt/proxmox-deployer/.env"

    # Database URL
    read -p "Enter PostgreSQL database URL (e.g., postgresql://user:password@localhost/proxmox_db): " DB_URL

    # Proxmox connection details
    echo -e "\n${YELLOW}Proxmox connection details (leave empty for development mode):${NC}"
    read -p "Proxmox host IP: " PROXMOX_HOST
    read -p "Proxmox user (e.g., root@pam): " PROXMOX_USER
    read -p "Proxmox password: " -s PROXMOX_PASSWORD
    echo

    # Generate a random secret key
    SESSION_SECRET=$(openssl rand -hex 32)

    # Create .env file
    sudo bash -c "cat > $ENV_FILE << EOL
DATABASE_URL=$DB_URL
SESSION_SECRET=$SESSION_SECRET
PROXMOX_HOST=$PROXMOX_HOST
PROXMOX_USER=$PROXMOX_USER
PROXMOX_PASSWORD=$PROXMOX_PASSWORD
DEBUG=False
TESTING=False
EOL"

    # Set proper permissions
    sudo chown proxmox-deployer:proxmox-deployer $ENV_FILE
    sudo chmod 600 $ENV_FILE

    echo -e "${GREEN}Environment variables configured!${NC}"
}

echo -e "\n${GREEN}Installing dependencies...${NC}"
sudo apt update
sudo apt install -y python3 python3-pip python3-venv postgresql nginx certbot python3-certbot-nginx git

echo -e "\n${GREEN}Creating system user...${NC}"
sudo useradd -r -s /bin/bash -m proxmox-deployer || echo "User already exists"

echo -e "\n${GREEN}Creating installation directory...${NC}"
sudo mkdir -p /opt/proxmox-deployer
sudo chown proxmox-deployer:proxmox-deployer /opt/proxmox-deployer

echo -e "\n${GREEN}Cloning repository...${NC}"
if [ -d "/opt/proxmox-deployer/.git" ]; then
    echo "Repository already exists, updating..."
    cd /opt/proxmox-deployer
    sudo -u proxmox-deployer git pull
else
    sudo -u proxmox-deployer git clone https://github.com/ionutasd7/pvedeployer.git /opt/proxmox-deployer
fi

echo -e "\n${GREEN}Installing Python dependencies...${NC}"
cd /opt/proxmox-deployer

# Install production dependencies
sudo -u proxmox-deployer pip3 install -r requirements.txt

# Install development dependencies if in development mode
if [ -z "$PROXMOX_HOST" ]; then
    echo -e "\n${YELLOW}Installing development dependencies...${NC}"
    sudo -u proxmox-deployer pip3 install pytest pytest-cov flake8
fi

# Setup environment variables
setup_environment

echo -e "\n${GREEN}Setting up the systemd service...${NC}"
sudo cp /opt/proxmox-deployer/proxmox-deployer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable proxmox-deployer
sudo systemctl start proxmox-deployer

echo -e "\n${GREEN}Setting up Nginx...${NC}"
read -p "Enter domain name (leave empty for IP-only access): " DOMAIN_NAME

# Create Nginx config file
if [ -z "$DOMAIN_NAME" ]; then
    # IP-only config
    sudo bash -c "cat > /etc/nginx/sites-available/proxmox-deployer << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL"
else
    # Domain config
    sudo bash -c "cat > /etc/nginx/sites-available/proxmox-deployer << EOL
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
EOL"
fi

sudo ln -sf /etc/nginx/sites-available/proxmox-deployer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL if domain is provided
if [ ! -z "$DOMAIN_NAME" ]; then
    echo -e "\n${GREEN}Setting up SSL with Let's Encrypt...${NC}"
    read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " SETUP_SSL
    if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN_NAME
    fi
fi

# Run tests in development mode
if [ -z "$PROXMOX_HOST" ]; then
    echo -e "\n${GREEN}Running tests...${NC}"
    cd /opt/proxmox-deployer
    sudo -u proxmox-deployer python3 -m pytest tests/
fi

# Initialize the database
echo -e "\n${GREEN}Initializing database...${NC}"
cd /opt/proxmox-deployer
sudo -u proxmox-deployer python3 -c "from app import db; db.create_all()"

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}==================================${NC}"
echo
echo -e "The application should now be running at:"
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${YELLOW}http://your-server-ip${NC}"
else
    if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}https://$DOMAIN_NAME${NC}"
    else
        echo -e "${YELLOW}http://$DOMAIN_NAME${NC}"
    fi
fi
echo
echo -e "To check the service status: ${YELLOW}sudo systemctl status proxmox-deployer${NC}"
echo -e "View logs with: ${YELLOW}sudo journalctl -u proxmox-deployer${NC}"
echo -e "Run tests with: ${YELLOW}cd /opt/proxmox-deployer && python3 -m pytest tests/${NC}"
echo
echo -e "${GREEN}Thank you for installing Proxmox Deployment Interface!${NC}"