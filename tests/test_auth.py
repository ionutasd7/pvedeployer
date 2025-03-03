import pytest
from flask_login import current_user
from models import User

def test_login_page(test_client):
    """Test that the login page loads correctly"""
    response = test_client.get('/login')
    assert response.status_code == 200
    assert b'Login' in response.data

def test_successful_login(test_client, init_database):
    """Test successful login with correct credentials"""
    response = test_client.post('/login', 
        data=dict(email='admin@test.com', password='admin123'),
        follow_redirects=True)
    assert response.status_code == 200
    assert b'Dashboard' in response.data

def test_incorrect_login(test_client, init_database):
    """Test login with incorrect credentials"""
    response = test_client.post('/login',
        data=dict(email='admin@test.com', password='wrongpass'),
        follow_redirects=True)
    assert response.status_code == 200
    assert b'Invalid email or password' in response.data

def test_logout(test_client, init_database):
    """Test logout functionality"""
    # First login
    test_client.post('/login',
        data=dict(email='admin@test.com', password='admin123'),
        follow_redirects=True)
    
    # Then logout
    response = test_client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert b'Login' in response.data

def test_protected_routes(test_client):
    """Test that protected routes require authentication"""
    routes = ['/nodes', '/scripts', '/deployments']
    for route in routes:
        response = test_client.get(route, follow_redirects=True)
        assert response.status_code == 200
        assert b'Login' in response.data
