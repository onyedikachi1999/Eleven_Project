import requests
import json

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}

# List all testimonies (including pending and approved)
res = requests.get(f"{BASE_URL}/testimonies/", headers=headers)
testimonies = res.json()
if isinstance(testimonies, dict):
    testimonies = testimonies.get('results', [])

print("=== LATEST TESTIMONIES ===")
for t in testimonies[:10]:
    print(f"ID: {t.get('id')}")
    print(f"  Title: {t.get('title')}")
    print(f"  Type: {t.get('type')}")
    print(f"  Media URL: {t.get('media_url')}")
    print(f"  Thumbnail URL: {t.get('thumbnail_url')}")
    print(f"  Status: {t.get('status')}")
    
    # Try to fetch media_url if exists
    if t.get('media_url'):
        try:
            m_res = requests.get(t.get('media_url'), timeout=5)
            print(f"  -> Fetching Media URL status: {m_res.status_code}, Content-Type: {m_res.headers.get('Content-Type')}, Size: {len(m_res.content)}")
        except Exception as e:
            print(f"  -> Error fetching Media URL: {e}")
            
    if t.get('thumbnail_url'):
        try:
            th_res = requests.get(t.get('thumbnail_url'), timeout=5)
            print(f"  -> Fetching Thumbnail URL status: {th_res.status_code}, Size: {len(th_res.content)}")
        except Exception as e:
            print(f"  -> Error fetching Thumbnail URL: {e}")
    print()

# Pending testimonies
pending_res = requests.get(f"{BASE_URL}/testimonies/pending/", headers=headers)
print("=== PENDING TESTIMONIES ===")
for t in pending_res.json():
    print(f"ID: {t.get('id')}")
    print(f"  Title: {t.get('title')}")
    print(f"  Type: {t.get('type')}")
    print(f"  Media URL: {t.get('media_url')}")
    print(f"  Thumbnail URL: {t.get('thumbnail_url')}")
    print(f"  Status: {t.get('status')}")
    if t.get('media_url'):
        try:
            m_res = requests.get(t.get('media_url'), timeout=5)
            print(f"  -> Fetching Media URL status: {m_res.status_code}, Content-Type: {m_res.headers.get('Content-Type')}, Size: {len(m_res.content)}")
        except Exception as e:
            print(f"  -> Error fetching Media URL: {e}")
    print()
