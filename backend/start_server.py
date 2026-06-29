#!/usr/bin/env python3
"""
ELEVEN Django Backend Startup Script
Usage: python start_server.py
"""
import subprocess
import sys
import os

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eleven_project.settings')
    
    print("=" * 60)
    print("  ELEVEN - Testimony. Prayer. Community.")
    print("  Django Backend Server")
    print("=" * 60)
    print()
    
    # Check if database exists
    if not os.path.exists('db.sqlite3'):
        print("Setting up database...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("Seeding data...")
        subprocess.run([sys.executable, 'manage.py', 'seed'], check=True)
    
    print("Starting Django development server...")
    print("API available at: http://localhost:8000/api/")
    print("Admin panel at:  http://localhost:8000/admin/")
    print()
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'])
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == '__main__':
    main()
