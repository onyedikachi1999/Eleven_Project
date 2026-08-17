import requests
import json

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login as admin
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}

# Check upcoming & live sessions
upcoming = requests.get(f"{BASE_URL}/schedules/upcoming/", headers=headers).json()
print("Upcoming sessions:", len(upcoming))

for s in upcoming:
    sid = s['id']
    print(f"\n================ SESSION #{sid}: {s.get('title')} ================")
    print(f"Host: {s.get('host_name')} (ID: {s.get('host_id')}), Is Live: {s.get('is_live')}")
    sync = requests.get(f"{BASE_URL}/schedules/{sid}/sync/?last_sequence=-1", headers=headers).json()
    participants = sync.get('participants', [])
    print(f"Connected Participants ({len(participants)}):")
    for p in participants:
        print(f"  - {p.get('name')} (User ID: {p.get('user_id')}, Co-Mod: {p.get('is_co_moderator')})")
    
    chunks = sync.get('audio_chunks', [])
    print(f"Uploaded Audio Chunks ({len(chunks)}):")
    for c in chunks[-5:]:
        print(f"  - Seq #{c.get('sequence')}: {c.get('url')}")
        # Test downloading chunk to verify content
        try:
            audio_test = requests.get(c.get('url'), timeout=5)
            print(f"    -> HTTP {audio_test.status_code}, Length: {len(audio_test.content)} bytes, Content-Type: {audio_test.headers.get('Content-Type')}")
        except Exception as e:
            print(f"    -> Download error: {e}")
