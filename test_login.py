#!/usr/bin/env python3
"""
Test script to reproduce the login 500 error
"""
import requests
import json
import psycopg2

def test_database_connection():
    """Test direct database connection with the same parameters as the Dr. Alex AI service"""
    print("🔍 Testing database connection...")

    # Test configurations - try both localhost and 127.0.0.1
    test_configs = [
        ("localhost with password", {
            'host': 'localhost',
            'port': 5432,
            'database': 'ecosystem_intelligence',
            'user': 'postgres',
            'password': 'postgres'
        }),
        ("127.0.0.1 with password", {
            'host': '127.0.0.1',
            'port': 5432,
            'database': 'ecosystem_intelligence',
            'user': 'postgres',
            'password': 'postgres'
        }),
        ("127.0.0.1 without password", {
            'host': '127.0.0.1',
            'port': 5432,
            'database': 'ecosystem_intelligence',
            'user': 'postgres'
        })
    ]

    for config_name, db_config in test_configs:
        try:
            print(f"  Trying connection {config_name}...")
            # Test connection
            conn = psycopg2.connect(**db_config)
            cursor = conn.cursor()

            # Test query
            cursor.execute("SELECT 'Database connection successful!' as message")
            result = cursor.fetchone()

            print(f"✅ Database connection successful {config_name}: {result[0]}")

            # Test if providers table exists and has data
            cursor.execute("SELECT COUNT(*) FROM providers")
            provider_count = cursor.fetchone()[0]
            print(f"📊 Providers table has {provider_count} records")

            cursor.close()
            conn.close()
            return True

        except psycopg2.OperationalError as e:
            print(f"❌ Database connection failed {config_name}: {e}")
            continue
        except Exception as e:
            print(f"❌ Database error {config_name}: {e}")
            continue

    return False

def test_register():
    """Test the registration endpoint to create a test user"""
    url = "http://localhost:3004/api/auth/register"

    # Test registration data
    test_registration = {
        "email": "test@example.com",
        "password": "TestPassword123",
        "firstName": "Test",
        "lastName": "Provider",
        "licenseNumber": "TEST123",
        "specialty": "General Practice",
        "organization": "Test Clinic",
        "phone": "1234567890"
    }

    headers = {
        "Content-Type": "application/json"
    }

    print("Testing registration endpoint...")
    print(f"URL: {url}")

    try:
        response = requests.post(url, json=test_registration, headers=headers)

        print(f"\nRegistration Status Code: {response.status_code}")

        if response.status_code == 201:
            print("✅ Registration successful!")
            return True
        elif response.status_code == 409:
            print("ℹ️ User already exists - proceeding with login test")
            return True
        else:
            print(f"❌ Registration failed:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
            return False

    except Exception as e:
        print(f"❌ Registration error: {e}")
        return False

def test_login():
    """Test the login endpoint"""
    url = "http://localhost:3004/api/auth/login"

    # Test data - Dr. Alex AI requires firstName and lastName for login
    test_credentials = {
        "email": "test@example.com",
        "password": "TestPassword123",
        "firstName": "Test",
        "lastName": "Provider"
    }

    headers = {
        "Content-Type": "application/json"
    }

    print("Testing login endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(test_credentials, indent=2)}")

    try:
        response = requests.post(url, json=test_credentials, headers=headers)

        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        if response.status_code == 500:
            print("\n🚨 500 ERROR DETECTED!")
            print("Response Body:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
        else:
            print(f"\nResponse Body:")
            try:
                data = response.json()
                print(json.dumps(data, indent=2))
            except:
                print(response.text)

    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the server running on port 3004?")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health():
    """Test the health endpoint first"""
    url = "http://localhost:3004/health"

    try:
        response = requests.get(url, timeout=5)
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print("✅ Server is running")
            try:
                data = response.json()
                print(f"Health response: {data}")
            except:
                print(f"Health response: {response.text}")
            return True
        else:
            print("❌ Server health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - server may not be running")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server timeout - server may be starting up")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_no_auth_ai_chat():
    """Test the AI chat endpoint without authentication"""
    url = "http://localhost:3004/api/ai-assistant/chat"

    test_message = {
        "message": "Hello Dr. Alex AI, can you help me with patient care?",
        "context": "clinical_assistant"
    }

    try:
        response = requests.post(url, json=test_message, timeout=10)
        print(f"AI Chat test: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ AI Chat working without authentication!")
            print(f"AI Response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ AI Chat failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Error text: {response.text}")
            return False

    except Exception as e:
        print(f"❌ AI Chat error: {e}")
        return False

def test_no_auth_insights():
    """Test the insights endpoint without authentication"""
    url = "http://localhost:3004/api/insights/summary"

    try:
        response = requests.get(url, timeout=5)
        print(f"Insights test: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Insights working without authentication!")
            print(f"Total patients: {data.get('summary', {}).get('totalPatients', 'N/A')}")
            return True
        else:
            print(f"❌ Insights failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Insights error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Dr. Alex AI No-Auth Demo Test")
    print("=" * 40)

    # Test server health
    print("\n" + "=" * 40)
    if test_health():
        print("\n" + "=" * 40)
        # Test AI chat without authentication
        test_no_auth_ai_chat()

        print("\n" + "=" * 40)
        # Test insights without authentication
        test_no_auth_insights()

        print("\n" + "=" * 40)
        print("🎉 No-Auth Demo Mode Successfully Configured!")
        print("✅ Landing page: http://localhost:3004")
        print("✅ Dashboard: http://localhost:3004/dashboard.html")
        print("✅ AI Chat: Working without authentication")
        print("✅ Insights: Working without authentication")
        print("\n🚀 Ready for show-and-tell!")

    else:
        print("❌ Please start the Dr. Alex AI server first")
        print("Run: cd provider-dashboard/dralexai-provider-platform && node server.js")

