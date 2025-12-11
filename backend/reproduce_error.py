import requests
import json
import sys

# Try to import requests, if not found, exit with instruction
try:
    import requests
except ImportError:
    print("Please run: pip install requests")
    sys.exit(1)

url = "http://localhost:8000/api/v1/auth/signup"
headers = {"Content-Type": "application/json"}
data = {
    "email": "debug_user_03@example.com",
    "display_name": "Debug User",
    "password": "securepass",
    "role": "parent_guardian",
    "birthday": "1990-01-01"
}

print(f"Sending POST request to {url}...")
try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")