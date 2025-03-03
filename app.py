import os
import logging
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_login import LoginManager, login_required, current_user
from proxmox import ProxmoxAPI
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


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

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Development mode when PROXMOX_HOST is not set
DEV_MODE = not os.environ.get("PROXMOX_HOST")

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

# Mock data for development testing
MOCK_RESOURCES = {
    "nodes": [
        {"node": "local", "status": "online", "cpu": 4, "maxmem": 16384}
    ],
    "templates": [
        {"volid": "local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.gz"},
        {"volid": "local:vztmpl/debian-11-standard_11.0-1_amd64.tar.gz"},
        {"volid": "local:vztmpl/alpine-3.17-default_20221129_amd64.tar.xz"}
    ],
    "networks": [
        {"iface": "eth0", "type": "bridge", "active": 1},
        {"iface": "vmbr0", "type": "bridge", "active": 1}
    ]
}

# Register blueprints
from routes.auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint)

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
            return jsonify({
                "message": "Development mode: Deployment simulation successful",
                "vmid": 100
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