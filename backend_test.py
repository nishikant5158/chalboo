import requests
import sys
import json
from datetime import datetime, timedelta
import time

class ChalbooAPITester:
    def __init__(self, base_url="https://travel-buddy-246.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{int(time.time())}@example.com"
        self.test_user_password = "TestPass123!"
        self.created_group_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_signup(self):
        """Test user signup"""
        user_data = {
            "name": "Test User",
            "email": self.test_user_email,
            "password": self.test_user_password,
            "city": "Test City",
            "age": 25
        }
        
        success, response = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_group(self):
        """Test creating a travel group"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        group_data = {
            "from_location": "New York",
            "to_location": "Los Angeles",
            "travel_date": tomorrow,
            "budget_min": 500,
            "budget_max": 1000,
            "trip_type": "adventure",
            "description": "Epic road trip across America!",
            "max_members": 4
        }
        
        success, response = self.run_test(
            "Create Travel Group",
            "POST",
            "groups",
            200,
            data=group_data
        )
        
        if success and 'id' in response:
            self.created_group_id = response['id']
            print(f"   Group ID: {self.created_group_id}")
            return True
        return False

    def test_search_groups(self):
        """Test searching groups"""
        # Test without filters
        success1, _ = self.run_test(
            "Search Groups (No Filter)",
            "GET",
            "groups",
            200
        )
        
        # Test with filters
        search_params = {
            "from_location": "New York",
            "to_location": "Los Angeles"
        }
        success2, _ = self.run_test(
            "Search Groups (With Filter)",
            "GET",
            "groups",
            200,
            data=search_params
        )
        
        return success1 and success2

    def test_get_group_detail(self):
        """Test getting group details"""
        if not self.created_group_id:
            print("❌ No group ID available for testing")
            return False
            
        success, _ = self.run_test(
            "Get Group Detail",
            "GET",
            f"groups/{self.created_group_id}",
            200
        )
        return success

    def test_get_group_members(self):
        """Test getting group members"""
        if not self.created_group_id:
            print("❌ No group ID available for testing")
            return False
            
        success, _ = self.run_test(
            "Get Group Members",
            "GET",
            f"groups/{self.created_group_id}/members",
            200
        )
        return success

    def test_my_groups(self):
        """Test getting user's groups"""
        success, _ = self.run_test(
            "Get My Groups",
            "GET",
            "my-groups",
            200
        )
        return success

    def test_join_request_flow(self):
        """Test join request workflow - requires second user"""
        # Create second user for testing join requests
        second_user_email = f"test_user_2_{int(time.time())}@example.com"
        second_user_data = {
            "name": "Test User 2",
            "email": second_user_email,
            "password": self.test_user_password,
            "city": "Test City 2",
            "age": 30
        }
        
        # Create second user
        success, response = self.run_test(
            "Create Second User",
            "POST",
            "auth/signup",
            200,
            data=second_user_data
        )
        
        if not success:
            return False
            
        second_token = response['token']
        
        # Test join request with second user
        original_token = self.token
        self.token = second_token
        
        if not self.created_group_id:
            print("❌ No group ID available for testing")
            return False
        
        success1, _ = self.run_test(
            "Send Join Request",
            "POST",
            f"groups/{self.created_group_id}/join-request",
            200
        )
        
        # Switch back to admin user
        self.token = original_token
        
        # Get join requests (admin only)
        success2, requests_response = self.run_test(
            "Get Join Requests",
            "GET",
            f"groups/{self.created_group_id}/join-requests",
            200
        )
        
        if success2 and requests_response:
            # Try to approve the first request
            if len(requests_response) > 0:
                request_id = requests_response[0]['request']['id']
                success3, _ = self.run_test(
                    "Approve Join Request",
                    "POST",
                    f"groups/{self.created_group_id}/join-requests/{request_id}/approve",
                    200
                )
                return success1 and success2 and success3
        
        return success1 and success2

    def test_chat_messages(self):
        """Test chat message retrieval"""
        if not self.created_group_id:
            print("❌ No group ID available for testing")
            return False
            
        success, _ = self.run_test(
            "Get Chat Messages",
            "GET",
            f"groups/{self.created_group_id}/messages",
            200
        )
        return success

    def test_rating_system(self):
        """Test rating system validation"""
        if not self.created_group_id:
            print("❌ No group ID available for testing")
            return False
        
        # Test self-rating prevention
        rating_data = {
            "to_user_id": self.user_id,  # Same as from_user_id
            "group_id": self.created_group_id,
            "stars": 5,
            "review": "Great traveler!"
        }
        
        success1, _ = self.run_test(
            "Prevent Self Rating",
            "POST",
            "ratings",
            400,  # Should fail
            data=rating_data
        )
        
        # Test rating before trip date (should fail)
        fake_user_id = "fake-user-id-123"
        rating_data['to_user_id'] = fake_user_id
        
        success2, _ = self.run_test(
            "Prevent Rating Before Trip",
            "POST",
            "ratings",
            400,  # Should fail - trip is tomorrow
            data=rating_data
        )
        
        return success1 and success2

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        # Save current token
        original_token = self.token
        self.token = None
        
        # Try to access protected endpoint without token
        success1, _ = self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401  # Should fail
        )
        
        # Restore token
        self.token = original_token
        return success1

def main():
    print("🚀 Starting Chalboo API Testing...")
    print("=" * 50)
    
    tester = ChalbooAPITester()
    
    # Authentication Tests
    print("\n📝 AUTHENTICATION TESTS")
    if not tester.test_signup():
        print("❌ Signup failed, stopping tests")
        return 1
    
    if not tester.test_login():
        print("❌ Login failed, stopping tests")
        return 1
    
    if not tester.test_get_me():
        print("❌ Get user failed")
    
    # Group Management Tests
    print("\n🏔️ GROUP MANAGEMENT TESTS")
    if not tester.test_create_group():
        print("❌ Group creation failed, stopping group tests")
    else:
        tester.test_search_groups()
        tester.test_get_group_detail()
        tester.test_get_group_members()
        tester.test_my_groups()
    
    # Join Request Tests
    print("\n🤝 JOIN REQUEST TESTS")
    tester.test_join_request_flow()
    
    # Chat Tests
    print("\n💬 CHAT TESTS")
    tester.test_chat_messages()
    
    # Rating System Tests
    print("\n⭐ RATING SYSTEM TESTS")
    tester.test_rating_system()
    
    # Security Tests
    print("\n🔒 SECURITY TESTS")
    tester.test_unauthorized_access()
    
    # Print Results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API tests mostly successful!")
        return 0
    else:
        print("⚠️ Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())