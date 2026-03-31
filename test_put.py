import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_put_sale():
    sale_id = 1
    # Payload matching SaleCreate matching what frontend sends
    payload = {
        "client_id": None, 
        "items": [
            {"product_id": 1, "quantity": 1} # Assuming product 1 exists
        ]
    }
    
    url = f"{BASE_URL}/sales/{sale_id}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    print(f"Testing PUT {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code}")
        print(e.read().decode())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_put_sale()
