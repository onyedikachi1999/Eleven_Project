import requests
import io

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}

# Create a small valid test JPEG in memory
from PIL import Image
img = Image.new('RGB', (100, 100), color='red')
buf = io.BytesIO()
img.save(buf, format='JPEG')
buf.seek(0)

# Upload media
files = {'file': ('test_upload.jpeg', buf, 'image/jpeg')}
upload_res = requests.post(f"{BASE_URL}/testimonies/upload/", headers=headers, files=files)
print("Upload status:", upload_res.status_code)
print("Upload response:", upload_res.json())

uploaded_url = upload_res.json().get('url')
if uploaded_url:
    print("\nFetching uploaded URL:", uploaded_url)
    get_res = requests.get(uploaded_url)
    print("Fetch status:", get_res.status_code)
    print("Fetch headers:", dict(get_res.headers))
    print("Content length:", len(get_res.content))
