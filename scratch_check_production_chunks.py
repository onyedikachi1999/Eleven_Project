import requests

BASE_URL = "https://eleven-backend-r9y1.onrender.com/api"

# Login as admin
login_res = requests.post(f"{BASE_URL}/auth/login/", json={"username": "eleven_admin", "password": "eleven2025"})
token = login_res.json().get('token')
headers = {"Authorization": f"Token {token}"}

# Check all schedules
all_schedules = requests.get(f"{BASE_URL}/schedules/", headers=headers).json()
print("All schedules in DB:", len(all_schedules.get('results', all_schedules) if isinstance(all_schedules, dict) else all_schedules))

upcoming = requests.get(f"{BASE_URL}/schedules/upcoming/", headers=headers).json()
print("Upcoming:", upcoming)

live = requests.get(f"{BASE_URL}/schedules/live/", headers=headers).json()
print("Live:", live)

# For each active session, check participants, messages, and audio chunks
sessions_to_check = upcoming if isinstance(upcoming, list) else []
for s in sessions_to_check:
    sid = s['id']
    print(f"\n--- Checking Session #{sid} ({s.get('title')}) ---")
    sync = requests.get(f"{BASE_URL}/schedules/{sid}/sync/?last_sequence=-1", headers=headers).json()
    print("Participants:", len(sync.get('participants', [])))
    for p in sync.get('participants', []):
        print(f"  - Participant: {p.get('name')} (id: {p.get('user_id')}, is_co_mod: {p.get('is_co_moderator')})")
    print("Audio chunks in sync:", len(sync.get('audio_chunks', [])))
    for chunk in sync.get('audio_chunks', []):
        print(f"  - Chunk seq {chunk.get('sequence')}: {chunk.get('url')}")
