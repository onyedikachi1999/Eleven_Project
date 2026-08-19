import requests

url = "https://eleven-backend-r9y1.onrender.com/media/testimony_images/fc0ef426-6294-45eb-b66e-f0f335ed3b21.jpeg"
res = requests.get(url)
print("Status:", res.status_code)
print("Headers:", dict(res.headers))
print("Content length:", len(res.content))
print("Content preview:", res.text[:200] if res.status_code != 200 else "Image bytes received")
