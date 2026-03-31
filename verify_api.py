import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(url, name):
    print(f"Testing {name} ({url})...")
    try:
        with urllib.request.urlopen(url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print(f"✅ {name}: OK")
                return True, data
            else:
                print(f"❌ {name}: Failed (Status {response.status})")
                return False, None
    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        return False, None

def main():
    print("--- Starting Backend Verification ---\n")
    
    # 1. Root
    ok, _ = test_endpoint(f"{BASE_URL}/", "API Root")
    
    # 2. Products
    ok, products = test_endpoint(f"{BASE_URL}/products/", "List Products")
    if ok:
        print(f"   Found {len(products)} products.")
    
    # 3. Dashboard
    ok, stats = test_endpoint(f"{BASE_URL}/dashboard/stats", "Dashboard Stats")
    if ok:
        print(f"   Stats: {stats}")

    # 4. Chatbot
    req = urllib.request.Request(
        f"{BASE_URL}/chatbot/", 
        data=json.dumps({"message": "regar"}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as response:
             if response.status == 200:
                print("✅ Chatbot: OK")
    except Exception as e:
        print(f"❌ Chatbot: Error - {e}")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    main()
