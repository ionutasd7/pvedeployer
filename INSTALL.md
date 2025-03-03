# Installation Guide

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/proxmox-deployment-interface.git
cd proxmox-deployment-interface
```

2. Run the deployment script in development mode:
```bash
python deploy.py --database-url postgresql://user:pass@localhost/proxmox_deployer --dev
```

3. Start the development server:
```bash
python main.py
```

The interface will be available at http://localhost:5000

## Production Setup

1. Create a system user:
```bash
sudo useradd -r -s /bin/false proxmox-deployer
```

2. Create installation directory:
```bash
sudo mkdir /opt/proxmox-deployer
sudo chown proxmox-deployer:proxmox-deployer /opt/proxmox-deployer
```

3. Install the application:
```bash
sudo -u proxmox-deployer git clone https://github.com/yourusername/proxmox-deployment-interface.git /opt/proxmox-deployer
cd /opt/proxmox-deployer
```

4. Run the deployment script:
```bash
python deploy.py \
  --database-url postgresql://user:pass@localhost/proxmox_deployer \
  --proxmox-host your-proxmox-ip \
  --proxmox-user root@pam \
  --proxmox-password your-password
```

5. Install the systemd service:
```bash
sudo cp proxmox-deployer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable proxmox-deployer
sudo systemctl start proxmox-deployer
```

6. Set up Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

7. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

## Security Recommendations

1. Use strong passwords for:
   - Database access
   - Admin account
   - Proxmox API credentials

2. Configure firewall rules:
   - Allow only necessary ports (80/443 for web access)
   - Restrict access to Proxmox API port (8006)

3. Regular maintenance:
   - Keep the system updated
   - Monitor logs for suspicious activity
   - Backup the database regularly

## Updating

1. Stop the service:
```bash
sudo systemctl stop proxmox-deployer
```

2. Update the code:
```bash
cd /opt/proxmox-deployer
sudo -u proxmox-deployer git pull
```

3. Restart the service:
```bash
sudo systemctl start proxmox-deployer
```

## Troubleshooting

### Common Issues

1. Database Connection Errors:
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

2. Proxmox API Connection:
   - Verify Proxmox host is accessible
   - Check API credentials
   - Ensure proper network access

3. Permission Issues:
   - Check file ownership
   - Verify service user permissions
   - Check log file permissions

### Logs

- Application logs: `journalctl -u proxmox-deployer`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`

For more detailed logs, enable debug mode in the .env file:
```
DEBUG=True
```
