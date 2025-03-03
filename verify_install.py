#!/usr/bin/env python3
import os
import sys
import subprocess
import psycopg2
from urllib.parse import urlparse

def check_database():
    """Check database connection and schema"""
    try:
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            print("ERROR: DATABASE_URL not set")
            return False
        
        url = urlparse(db_url)
        conn = psycopg2.connect(
            dbname=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=url.port
        )
        conn.close()
        print("Database connection successful")
        return True
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        return False

def check_dependencies():
    """Check if all required Python packages are installed"""
    try:
        import flask
        import flask_login
        import flask_sqlalchemy
        import gunicorn
        print("All required packages are installed")
        return True
    except ImportError as e:
        print(f"Missing dependency: {str(e)}")
        return False

def run_tests():
    """Run the test suite"""
    try:
        result = subprocess.run(['python3', '-m', 'pytest', 'tests/', '-v'], 
                              capture_output=True, text=True)
        print(result.stdout)
        return result.returncode == 0
    except Exception as e:
        print(f"Failed to run tests: {str(e)}")
        return False

def main():
    print("Verifying Proxmox Deployment Interface installation...")
    
    # Check components
    db_ok = check_database()
    deps_ok = check_dependencies()
    tests_ok = run_tests()
    
    # Summary
    print("\nInstallation Verification Summary:")
    print(f"Database Connection: {'✓' if db_ok else '✗'}")
    print(f"Dependencies: {'✓' if deps_ok else '✗'}")
    print(f"Tests: {'✓' if tests_ok else '✗'}")
    
    if all([db_ok, deps_ok, tests_ok]):
        print("\nVerification PASSED - Installation is working correctly")
        return 0
    else:
        print("\nVerification FAILED - Please check the errors above")
        return 1

if __name__ == '__main__':
    sys.exit(main())
