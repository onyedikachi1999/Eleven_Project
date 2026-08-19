import requests

url = "https://eleven-backend-r9y1.onrender.com/media/testimony_images/92e14914-d5ad-4715-aac6-b9633832af85.jpeg"
res = requests.get(url)
print("Status:", res.status_code)
print("Content-Type:", res.headers.get("Content-Type"))
print("Content-Length:", len(res.content))

# Also test pending endpoint
BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}
pending_res = requests.get(f"{BASE_URL}/testimonies/pending/", headers=headers)
print("\nPending items:")
import json
print(json.dumps(pending_res.json(), indent=2))
