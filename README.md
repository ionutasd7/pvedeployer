# Proxmox Deployment Interface

A web interface for deploying VMs and LXC containers on Proxmox using Flask.

## Quick Start

1. Clone this repository to your local machine
2. Make sure Python 3.11+ is installed
3. Install the required packages:
   ```bash
   pip install flask requests urllib3 gunicorn
   ```

4. Run the application:
   ```bash
   python main.py
   ```

The app will be available at `http://localhost:5000`

## Running Modes

### Development Mode (Default)
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

## Features
- Deploy VMs and LXC containers
- Select from available templates
- Configure CPU, memory, and storage
- User-friendly interface with Bootstrap dark theme
- Real-time form validation and error handling
- Detailed error messages for connection issues
- Development mode for testing without Proxmox

## Notes
- When using on a LAN, make sure to use the correct local IP address for your Proxmox server
- SSL verification is disabled for LAN connections (but logged with a warning)
- The interface runs on port 5000 by default
