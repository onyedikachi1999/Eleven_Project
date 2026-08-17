import requests

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login as admin
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}

# Test uploading directly to session 14
sample_webm = b"\x1a\x45\xdf\xa3" + b"\x00" * 500
files = {'audio': ('audio.webm', sample_webm, 'audio/webm')}
upload_res = requests.post(f"{BASE_URL}/schedules/14/upload_audio/", data={'sequence': 999}, files=files, headers=headers)
print("Upload status:", upload_res.status_code)
print("Upload body:", upload_res.text)
