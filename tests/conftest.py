import os
import pytest
from app import app, db
from models import User, ProxmoxNode, Script
from werkzeug.security import generate_password_hash

@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    
    with app.test_client() as testing_client:
        with app.app_context():
            yield testing_client

@pytest.fixture
def init_database():
    # Create test admin user
    admin = User(
        username='test_admin',
        email='admin@test.com',
        password_hash=generate_password_hash('admin123'),
        is_admin=True
    )
    db.session.add(admin)
    
    # Create test node
    node = ProxmoxNode(
        name='Test Node',
        host='192.168.1.100',
        user='root@pam',
        password='test-password',
        user_id=1,
        is_active=True,
        resources={"nodes": [{
            "node": "test-1",
            "status": "online",
            "cpu": 0.15,
            "maxcpu": 8,
            "memory": {
                "total": 16384,
                "used": 4096,
                "free": 12288
            }
        }]}
    )
    db.session.add(node)
    
    # Create test script
    script = Script(
        name='Test Script',
        description='Test deployment script',
        content='#!/bin/bash\necho "Test script running"',
        category='system',
        user_id=1
    )
    db.session.add(script)
    
    db.session.commit()
    
    yield
    
    # Clean up
    db.session.query(Script).delete()
    db.session.query(ProxmoxNode).delete()
    db.session.query(User).delete()
    db.session.commit()
