import urllib.request
import json
import urllib.error
import urllib.parse

BASE_URL = "http://localhost:8000/api/v1"

def make_request(endpoint, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
            
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = json_data

    try:
        with urllib.request.urlopen(req) as response:
            if response.status >= 200 and response.status < 300:
                return json.loads(response.read().decode('utf-8'))
            else:
                print(f"Error: {response.status} {response.reason}")
                return None
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} {e.reason}")
        print(e.read().decode('utf-8'))
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def verify():
    print("Starting Auth Verification...")
    
    # 1. Register Parent
    print("\n1. Registering Parent...")
    parent_data = {
        "email": "parent@example.com",
        "password": "password123",
        "display_name": "Parent User",
        "role": "parent_guardian"
    }
    parent = make_request("/auth/signup", method="POST", data=parent_data)
    if parent:
        print("Parent registered successfully.")
    else:
        print("Parent registration failed (maybe already exists, continuing...).")

    # 2. Register Kid
    print("\n2. Registering Kid...")
    kid_data = {
        "email": "kid@example.com",
        "password": "kidpassword123",
        "display_name": "Kid User",
        "role": "kid_seller",
        "parent_email": "parent@example.com"
    }
    kid = make_request("/auth/signup", method="POST", data=kid_data)
    if kid:
        print("Kid registered successfully.")
    else:
        print("Kid registration failed.")

    # 3. Login Parent
    print("\n3. Logging in Parent...")
    # OAuth2 form data is sent as x-www-form-urlencoded
    login_data = urllib.parse.urlencode({
        "username": "parent@example.com",
        "password": "password123"
    }).encode('utf-8')
    
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, method="POST")
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    token = None
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            token = result.get("access_token")
            print("Login successful. Token received.")
    except urllib.error.HTTPError as e:
        print(f"Login failed: {e.code} {e.read().decode('utf-8')}")

    # 4. Access /auth/me
    if token:
        print("\n4. Accessing /auth/me...")
        headers = {"Authorization": f"Bearer {token}"}
        me = make_request("/auth/me", headers=headers)
        if me:
            print("Successfully retrieved user details:")
            print(json.dumps(me, indent=2))
        else:
            print("Failed to retrieve user details.")

if __name__ == "__main__":
    try:
        verify()
    except Exception as e:
        print(f"An error occurred: {e}")