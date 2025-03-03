import os
import logging
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_login import LoginManager, login_required, current_user
from proxmox import ProxmoxAPI
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

# Development mode when PROXMOX_HOST is not set
DEV_MODE = not os.environ.get("PROXMOX_HOST")

# Mock data for development testing
MOCK_RESOURCES = {
    "nodes": [
        {
            "node": "pve-1",
            "status": "online",
            "cpu": 0.15,  # 15% CPU usage
            "maxcpu": 32,
            "memory": {
                "total": 128 * 1024,  # 128GB in MB
                "used": 32 * 1024,    # 32GB used
                "free": 96 * 1024     # 96GB free
            },
            "status": {
                "cpu": 0.15,
                "memory": {
                    "total": 128 * 1024,
                    "used": 32 * 1024
                }
            },
            "storage_info": [
                {
                    "storage": "local-lvm",
                    "type": "lvm",
                    "total": 2000,
                    "used": 800,
                    "avail": 1200
                },
                {
                    "storage": "ceph-pool",
                    "type": "rbd",
                    "total": 10000,
                    "used": 3000,
                    "avail": 7000
                }
            ],
            "metrics": {
                "cpu": {"usage": 0.15},
                "memory": {"usage": 0.25},
                "network": {"in": 100, "out": 50}
            }
        }
    ],
    "templates": [
        {
            "volid": "local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.gz",
            "type": "lxc",
            "size": 250 * 1024 * 1024,  # 250MB
            "format": "tar.gz"
        },
        {
            "volid": "local:vztmpl/debian-11-standard_11.0-1_amd64.tar.gz",
            "type": "lxc",
            "size": 200 * 1024 * 1024,  # 200MB
            "format": "tar.gz"
        },
        {
            "volid": "ceph-pool:vm/template/ubuntu-22.04-cloud",
            "type": "vm",
            "size": 2.5 * 1024 * 1024 * 1024,  # 2.5GB
            "format": "qcow2"
        }
    ],
    "storages": [
        {
            "storage": "local-lvm",
            "type": "lvm",
            "content": ["images", "rootdir"],
            "active": 1
        },
        {
            "storage": "ceph-pool",
            "type": "rbd",
            "content": ["images", "rootdir"],
            "active": 1
        }
    ],
    "networks": [
        {"iface": "eth0", "type": "bridge", "active": 1, "method": "static"},
        {"iface": "vmbr0", "type": "bridge", "active": 1, "method": "static"}
    ]
}

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

with app.app_context():
    # Make sure to import the models here or their tables won't be created
    import models  # noqa: F401

    db.create_all()

    # Create test data in development mode
    if DEV_MODE:
        from models import User, ProxmoxNode

        # Create test admin user if not exists
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            from werkzeug.security import generate_password_hash
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('admin'),
                is_admin=True
            )
            db.session.add(admin)

            # Create test nodes
            nodes = [
                ProxmoxNode(
                    name='Production Node 1',
                    host='192.168.1.100',
                    user='root@pam',
                    password='mock-password',
                    user_id=1,
                    is_active=True,
                    resources=MOCK_RESOURCES,
                    created_at=datetime.utcnow()
                ),
                ProxmoxNode(
                    name='Development Node',
                    host='192.168.1.101',
                    user='root@pam',
                    password='mock-password',
                    user_id=1,
                    is_active=True,
                    resources={
                        **MOCK_RESOURCES,
                        'nodes': [MOCK_RESOURCES['nodes'][0]]  # Use the less heavily loaded node
                    },
                    created_at=datetime.utcnow()
                )
            ]
            db.session.add_all(nodes)
            db.session.commit()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

if DEV_MODE:
    logger.info("Running in development mode with mock data")
    proxmox = None
else:
    # Initialize Proxmox API with better timeout and error handling
    proxmox = ProxmoxAPI(
        host=os.environ.get("PROXMOX_HOST", "localhost"),
        user=os.environ.get("PROXMOX_USER", "root@pam"),
        password=os.environ.get("PROXMOX_PASSWORD", ""),
        verify_ssl=False,
        timeout=15  # Increased timeout for LAN connections
    )

# Register blueprints
from routes.auth import auth as auth_blueprint
from routes.nodes import nodes as nodes_blueprint

app.register_blueprint(auth_blueprint)
app.register_blueprint(nodes_blueprint)

@app.route('/')
def index():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))
    return render_template('index.html')

@app.route('/api/resources', methods=['GET'])
@login_required
def get_resources():
    try:
        if DEV_MODE:
            logger.info("Returning mock resources in development mode")
            return jsonify(MOCK_RESOURCES)

        resources = proxmox.get_resources()
        return jsonify(resources)
    except Exception as e:
        error_msg = str(e)
        if "Could not connect" in error_msg:
            error_msg += " If using a LAN connection, make sure you're using the correct local IP address."
        logger.error(f"Error fetching resources: {error_msg}")
        return jsonify({
            "error": "Failed to fetch resources",
            "details": error_msg
        }), 500

@app.route('/api/deploy', methods=['POST'])
@login_required
def deploy_container():
    try:
        if DEV_MODE:
            logger.info("Simulating deployment in development mode")
            # Simulate a delay
            import time
            time.sleep(2)
            return jsonify({
                "success": True,
                "message": "Development mode: Deployment simulation successful",
                "vmid": 100,
                "node": "pve-1",
                "status": {
                    "name": request.json.get('name'),
                    "type": request.json.get('type'),
                    "cpu": request.json.get('cpu'),
                    "memory": request.json.get('memory'),
                    "storage": request.json.get('storage'),
                    "ip_address": request.json.get('ip_address'),
                    "tags": request.json.get('tags', []),
                    "created_at": datetime.utcnow().isoformat()
                }
            })

        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['type', 'template', 'name', 'cpu', 'memory', 'storage']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        result = proxmox.deploy_container(
            type=data.get('type'),
            template=data.get('template'),
            name=data.get('name'),
            cpu=data.get('cpu'),
            memory=data.get('memory'),
            storage=data.get('storage')
        )
        return jsonify(result)
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Deployment error: {error_msg}")
        return jsonify({
            "error": "Deployment failed",
            "details": error_msg
        }), 500