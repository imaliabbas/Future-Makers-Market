import requests
import json

base_url = "http://localhost:8000/api/v1"

# 1. Register Parent
parent_email = "parent_demo@example.com"
parent_password = "password123"

def register_parent():
    print("\n--- Registering Parent ---")
    data = {
        "email": parent_email,
        "password": parent_password,
        "display_name": "Demo Parent",
        "birthday": "1980-01-01",
        "role": "parent_guardian"
    }
    res = requests.post(f"{base_url}/auth/signup", json=data)
    print(f"Status: {res.status_code}")
    if res.status_code == 201:
        print("Parent registered successfully.")
    elif res.status_code == 400 and "Email already registered" in res.text:
        print("Parent already exists, proceeding...")
    else:
        print(f"Error: {res.text}")

def login(email, password):
    print(f"\n--- Logging in {email} ---")
    data = {"username": email, "password": password}
    res = requests.post(f"{base_url}/auth/login", data=data)
    if res.status_code == 200:
        token = res.json()["access_token"]
        print("Login successful.")
        return token
    else:
        print(f"Login failed: {res.text}")
        return None

# 2. Register Kid
kid_email = "kid_demo@example.com"
kid_password = "password123"

def register_kid():
    print("\n--- Registering Kid ---")
    data = {
        "email": kid_email,
        "password": kid_password,
        "display_name": "Demo Kid",
        "birthday": "2015-01-01",
        "role": "kid_seller",
        "parent_email": parent_email
    }
    res = requests.post(f"{base_url}/auth/signup", json=data)
    print(f"Status: {res.status_code}")
    if res.status_code == 201:
        print("Kid registered successfully.")
    elif res.status_code == 400 and "Email already registered" in res.text:
        print("Kid already exists, proceeding...")
    else:
        print(f"Error: {res.text}")

def create_storefront(token):
    print("\n--- Creating Storefront ---")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "display_name": "Demo Kid's Awesome Shop",
        "description": "Selling cool handmade bracelets",
        "status": "active"
    }
    # First check if exists
    res = requests.get(f"{base_url}/storefronts/mine", headers=headers)
    if res.status_code == 200:
        print("Storefront already exists.")
        return res.json()["_id"]
        
    res = requests.post(f"{base_url}/storefronts/", json=data, headers=headers)
    if res.status_code == 201:
        print("Storefront created.")
        return res.json()["_id"]
    else:
        print(f"Error creating storefront: {res.text}")
        return None

def create_product(token):
    print("\n--- Creating Product ---")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Rainbow Bracelet",
        "description": "Very colorful and handmade",
        "price": 5.00,
        "quantity": 10,
        "images": []
    }
    res = requests.post(f"{base_url}/products/", json=data, headers=headers)
    if res.status_code == 201:
        product = res.json()
        print(f"Product created with status: {product['status']}")
        return product["_id"]
    else:
        print(f"Error creating product: {res.text}")
        return None

def parent_approve_product(token, product_id):
    print(f"\n--- Parent Approving Product {product_id} ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. List approvals to confirm it's there
    res = requests.get(f"{base_url}/parent/approvals", headers=headers)
    products = res.json()
    found = any(p["_id"] == product_id for p in products)
    if found:
        print("Product found in pending approvals list.")
    else:
        print("Product NOT found in approvals list (might already be approved).")

    # 2. Approve
    data = {"action": "approve"}
    res = requests.post(f"{base_url}/parent/approvals/{product_id}", json=data, headers=headers)
    if res.status_code == 200:
        print("Product approved successfully.")
    else:
        print(f"Error approving product: {res.text}")

def verify_product_active(product_id):
    print(f"\n--- Verifying Product {product_id} is Active Publicly ---")
    res = requests.get(f"{base_url}/products/{product_id}")
    if res.status_code == 200:
        product = res.json()
        print(f"Product status: {product['status']}")
    else:
        print(f"Error fetching product: {res.text}")

if __name__ == "__main__":
    register_parent()
    register_kid()
    
    parent_token = login(parent_email, parent_password)
    kid_token = login(kid_email, kid_password)
    
    if kid_token:
        store_id = create_storefront(kid_token)
        if store_id:
            product_id = create_product(kid_token)
            
            if product_id and parent_token:
                parent_approve_product(parent_token, product_id)
                verify_product_active(product_id)