import requests

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login as eleven_admin
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
print("Login status:", login_res.status_code)
user_data = login_res.json()
token = user_data.get('token')
print("User info:", user_data.get('user', {}))

headers = {"Authorization": f"Token {token}"}

# Check pending testimonies
pending_res = requests.get(f"{BASE_URL}/testimonies/pending/", headers=headers)
print("Pending status:", pending_res.status_code)
pending = pending_res.json()
print("Pending count:", len(pending))
for p in pending:
    print(f"ID: {p.get('id')}, Title: {p.get('title')}, Type: {p.get('type')}, Media: {p.get('media_url')}, Status: {p.get('status')}")

# If there's a pending testimony, test approve
if pending:
    first_id = pending[0]['id']
    print(f"\nTesting approve on ID {first_id}...")
    approve_res = requests.post(f"{BASE_URL}/testimonies/{first_id}/approve/", headers=headers)
    print("Approve status:", approve_res.status_code, approve_res.text)
else:
    # Create a test pending testimony to test approve
    print("\nCreating a test pending testimony...")
    create_res = requests.post(f"{BASE_URL}/testimonies/", headers=headers, json={
        "title": "Test Miracle",
        "content": "God is good! Testing approval pipeline.",
        "category": "general",
        "type": "text",
        "is_anonymous": False
    })
    print("Create status:", create_res.status_code)
    test_id = create_res.json().get('id')
    if test_id:
        print(f"Created ID {test_id}, now approving...")
        approve_res = requests.post(f"{BASE_URL}/testimonies/{test_id}/approve/", headers=headers)
        print("Approve status:", approve_res.status_code, approve_res.text)
