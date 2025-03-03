#!/usr/bin/env python3
import os
import sys
import secrets
import argparse
import logging
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def generate_secret_key():
    """Generate a secure secret key"""
    return secrets.token_hex(32)

def setup_environment(args):
    """Set up environment variables"""
    env_vars = {
        'DATABASE_URL': args.database_url,
        'SESSION_SECRET': generate_secret_key(),
        'PROXMOX_HOST': args.proxmox_host if args.proxmox_host else '',
        'PROXMOX_USER': args.proxmox_user if args.proxmox_user else '',
        'PROXMOX_PASSWORD': args.proxmox_password if args.proxmox_password else ''
    }

    # Write environment variables to .env file
    with open('.env', 'w') as f:
        for key, value in env_vars.items():
            f.write(f'{key}={value}\n')
    
    logger.info('Environment variables configured')

def validate_database_url(url):
    """Validate database URL format"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def main():
    parser = argparse.ArgumentParser(description='Deploy Proxmox Deployment Interface')
    parser.add_argument('--database-url', required=True,
                      help='PostgreSQL database URL (postgresql://user:pass@host/db)')
    parser.add_argument('--proxmox-host',
                      help='Proxmox host IP or hostname (optional for development)')
    parser.add_argument('--proxmox-user',
                      help='Proxmox username (optional for development)')
    parser.add_argument('--proxmox-password',
                      help='Proxmox password (optional for development)')
    parser.add_argument('--dev', action='store_true',
                      help='Run in development mode with mock data')

    args = parser.parse_args()

    # Validate database URL
    if not validate_database_url(args.database_url):
        logger.error('Invalid database URL format')
        sys.exit(1)

    try:
        # Set up environment
        setup_environment(args)
        logger.info('Environment setup completed')

        # Print success message and next steps
        print("""
Proxmox Deployment Interface setup completed!

To start the application:
1. Run the Flask development server:
   python main.py

2. Access the interface at:
   http://localhost:5000

Default admin credentials:
- Email: admin@example.com
- Password: admin

Please change the admin password after first login.

For production deployment:
1. Set up a reverse proxy (nginx recommended)
2. Enable SSL/TLS
3. Configure proper security measures
""")

    except Exception as e:
        logger.error(f'Setup failed: {str(e)}')
        sys.exit(1)

if __name__ == '__main__':
    main()
