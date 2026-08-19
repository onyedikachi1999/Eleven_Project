import requests

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

users_to_create = [
    {
        "username": "Mhuteeheart",
        "email": "mhuteeheart@elevenfaith.com",
        "password": "Teeheart@2026",
        "first_name": "Mhuteeheart",
    },
    {
        "username": "goldie26",
        "email": "goldie26@elevenfaith.com",
        "password": "Testgoldie2026",
        "first_name": "Goldie",
    },
    {
        "username": "Akin",
        "email": "akin@elevenfaith.com",
        "password": "akinlara@1",
        "first_name": "Akin",
    }
]

# 1. Login as admin
admin_login = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
print("Admin login status:", admin_login.status_code)
admin_token = admin_login.json().get('token')
admin_headers = {"Authorization": f"Token {admin_token}"}

for u in users_to_create:
    print(f"\n--- Processing {u['username']} ---")
    # Try registering
    reg_res = requests.post(f"{BASE_URL}/auth/register/", json=u)
    print("Register status:", reg_res.status_code, reg_res.text[:200])
    
    # Try logging in as the user to verify credentials
    log_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": u['username'], "password": u['password']})
    print("Login status:", log_res.status_code)
    user_data = log_res.json()
    user_info = user_data.get('user', {})
    print("User ID:", user_info.get('id'), "| Plan:", user_info.get('subscription_plan'))
