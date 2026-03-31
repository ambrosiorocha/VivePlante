import requests

try:
    print("Testing /products/public...")
    r = requests.get("http://localhost:8000/products/public")
    print(r.status_code)
    print(r.text[:500])
except Exception as e:
    print(f"Error: {e}")

try:
    print("\nTesting /dashboard/stats...")
    r = requests.get("http://localhost:8000/dashboard/stats")
    print(r.status_code)
    print(r.text)
except Exception as e:
    print(f"Error: {e}")
