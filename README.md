# Proxmox Deployment Interface

A modern web interface for deploying and managing VMs and LXC containers on Proxmox, offering intelligent resource allocation and streamlined infrastructure management.

## Features

### 1. Resource Management
- Total resource allocation tracking (vCPU, RAM, Storage)
- Intelligent node recommendation system
- Real-time resource usage monitoring
- Multi-node support

### 2. Deployment Options
- Support for both VMs and LXC containers
- Template-based deployment
- Custom resource allocation
- Static IP assignment
- Node selection with automatic recommendations
- Storage location selection

### 3. Post-Deployment Automation
- SSH access configuration
- Monitoring agent installation (Zabbix, CheckMK, Prometheus)
- Custom script execution
- Package installation automation

### 4. User Management
- Role-based access control
- Password management
- User activity tracking
- Granular permissions

### 5. Configuration Management
- Web-based configuration
- Environment variable management
- Template management
- Storage configuration

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL database
- Proxmox VE server (optional for development mode)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/proxmox-deployment-interface.git
cd proxmox-deployment-interface
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Required for production
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export SESSION_SECRET="your-secret-key"

# Optional for Proxmox connection
export PROXMOX_HOST="your-proxmox-ip"
export PROXMOX_USER="root@pam"
export PROXMOX_PASSWORD="your-password"
```

4. Initialize the database:
```bash
flask db upgrade
```

5. Run the application:
```bash
python main.py
```

The app will be available at `http://localhost:5000`

### Development Mode
- No Proxmox server required
- Uses mock data for testing
- Great for UI development and testing
- Automatically active when `PROXMOX_HOST` environment variable is not set

### Production Mode
To connect to your Proxmox server, set these environment variables:
```bash
export PROXMOX_HOST="your-proxmox-ip"  # e.g., 192.168.1.100
export PROXMOX_USER="root@pam"         # or your Proxmox username
export PROXMOX_PASSWORD="your-password" # or API token
```

## Configuration

### Database Setup
1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run database migrations

### User Management
1. First user created is automatically an admin
2. Admin can create additional users and assign roles
3. Manage users through the web interface

### Post-Deployment Scripts
1. Located in `scripts/` directory
2. Can be managed through web interface
3. Supports custom script upload

### Templates
1. Automatically detected from Proxmox
2. Can be managed through web interface
3. Supports both VM and LXC templates

## Security Considerations

### Authentication
- Session-based authentication
- Password hashing using Werkzeug
- CSRF protection enabled

### API Security
- Token-based API authentication
- SSL verification options
- Rate limiting enabled

### Environment Variables
- Sensitive data stored in environment variables
- Support for `.env` file in development
- Secure secret management in production

## Deployment

### Local Network
1. Install on a machine with network access to Proxmox
2. Configure firewall rules
3. Use local IP addresses

### Production Environment
1. Set up reverse proxy (nginx recommended)
2. Enable SSL/TLS
3. Configure proper security measures

## API Documentation

### Authentication
```
POST /auth/login
POST /auth/logout
```

### Nodes
```
GET /nodes
POST /nodes/add
GET /nodes/<id>/resources
```

### Deployments
```
POST /api/deploy
GET /api/resources
```

## Troubleshooting

### Common Issues
1. Connection refused
   - Check Proxmox IP and credentials
   - Verify network connectivity

2. Database errors
   - Verify PostgreSQL is running
   - Check DATABASE_URL format

3. Template issues
   - Ensure templates exist on Proxmox
   - Check storage configuration

## Contributing
1. Fork the repository
2. Create feature branch
3. Submit pull request

## License
MIT License - See LICENSE file for details