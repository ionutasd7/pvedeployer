from datetime import datetime
from typing import List
from app import db
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import JSONB

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    proxmox_nodes = db.relationship('ProxmoxNode', backref='owner', lazy=True)
    deployments = db.relationship('Deployment', backref='owner', lazy=True)

class ProxmoxNode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    host = db.Column(db.String(255), nullable=False)
    user = db.Column(db.String(64), nullable=False)
    password = db.Column(db.String(256), nullable=False)  # Encrypted
    verify_ssl = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_checked = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    resources = db.Column(JSONB)  # Stores current resource usage
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    storages = db.relationship('Storage', backref='node', lazy=True)
    deployments = db.relationship('Deployment', backref='node', lazy=True)

class Storage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    type = db.Column(db.String(32), nullable=False)  # e.g., 'local', 'nfs', 'ceph'
    total_space = db.Column(db.BigInteger)
    used_space = db.Column(db.BigInteger)
    node_id = db.Column(db.Integer, db.ForeignKey('proxmox_node.id'), nullable=False)

class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    volid = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(32), nullable=False)  # 'vm' or 'lxc'
    cpu = db.Column(db.Integer, nullable=False)
    memory = db.Column(db.Integer, nullable=False)  # in MB
    storage = db.Column(db.Integer, nullable=False)  # in GB
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    node_id = db.Column(db.Integer, db.ForeignKey('proxmox_node.id'), nullable=False)

class Deployment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    vmid = db.Column(db.Integer)
    type = db.Column(db.String(32), nullable=False)  # 'vm' or 'lxc'
    status = db.Column(db.String(32), nullable=False)
    ip_address = db.Column(db.String(39), nullable=False)  # IPv4/IPv6
    cpu = db.Column(db.Integer, nullable=False)
    memory = db.Column(db.Integer, nullable=False)  # in MB
    storage = db.Column(db.Integer, nullable=False)  # in GB
    tags = db.Column(JSONB)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Foreign Keys
    template_id = db.Column(db.Integer, db.ForeignKey('template.id'))
    storage_id = db.Column(db.Integer, db.ForeignKey('storage.id'), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey('proxmox_node.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
