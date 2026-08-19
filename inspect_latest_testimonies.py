import requests
import json

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Get public testimonies list
res = requests.get(f"{BASE_URL}/testimonies/")
print("Testimonies status:", res.status_code)
testimonies = res.json()
if isinstance(testimonies, dict):
    testimonies = testimonies.get('results', [])

print(f"Found {len(testimonies)} public testimonies:")
for t in testimonies[:10]:
    print(f"ID: {t.get('id')} | Title: {t.get('title')} | Type: {t.get('type')} | Media: {t.get('media_url')} | Thumb: {t.get('thumbnail_url')}")

# Also check pending
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}
pending_res = requests.get(f"{BASE_URL}/testimonies/pending/", headers=headers)
print(f"\nFound {len(pending_res.json())} pending testimonies:")
for t in pending_res.json():
    print(f"ID: {t.get('id')} | Title: {t.get('title')} | Type: {t.get('type')} | Media: {t.get('media_url')} | Thumb: {t.get('thumbnail_url')}")
