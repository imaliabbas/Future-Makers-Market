import requests
import json

url = "http://localhost:8000/api/v1/auth/signup"

# Test data for a parent (needed first for kid linking)
parent_data = {
    "email": "testparent@example.com",
    "password": "password123",
    "display_name": "Test Parent",
    "birthday": "1980-01-01",
    "role": "parent_guardian"
}

# Test data for a kid
kid_data = {
    "email": "testkid@example.com",
    "password": "password123",
    "display_name": "Test Kid",
    "birthday": "2015-01-01",
    "role": "kid_seller",
    "parent_email": "testparent@example.com"
}

def test_signup(data, label):
    print(f"Testing signup for {label}...")
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # 1. Try to register parent
    test_signup(parent_data, "Parent")
    
    # 2. Try to register kid
    test_signup(kid_data, "Kid")