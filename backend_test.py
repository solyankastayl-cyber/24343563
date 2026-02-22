#!/usr/bin/env python3
"""
Backend API Test for Fractal UX Refactor
Testing the /api/fractal/v2.1/chart endpoint and related APIs for UX improvements:
- Chart data availability
- API response structure
- Error handling
"""

import requests
import json
import sys
from datetime import datetime

class FractalBackendTester:
    def __init__(self, base_url="https://fractal-core-branch.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": test_name,
            "passed": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")

    def test_chart_endpoint(self):
        """Test main /api/fractal/v2.1/chart endpoint"""
        url = f"{self.base_url}/api/fractal/v2.1/chart"
        params = {"symbol": "BTC", "limit": 365}
        
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code != 200:
                self.log_test(
                    "Chart API Status", 
                    False, 
                    f"Status code {response.status_code}, expected 200"
                )
                return None
                
            data = response.json()
            
            # Check required fields for chart rendering
            required_fields = ['candles', 'sma200']
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test(
                    "Chart API Structure", 
                    False, 
                    f"Missing required fields: {missing_fields}"
                )
                return None
                
            candles = data.get('candles', [])
            if len(candles) == 0:
                self.log_test(
                    "Chart API Data", 
                    False, 
                    "No candle data returned"
                )
                return None
                
            self.log_test(
                "Chart API Data", 
                True, 
                f"Valid response with {len(candles)} candles"
            )
            return data
                
        except Exception as e:
            self.log_test(
                "Chart API Request", 
                False, 
                f"Request failed: {str(e)}"
            )
            return None

    def test_api_connectivity(self):
        """Test basic API connectivity"""
        try:
            # Test root endpoint to verify server is up
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code in [200, 404]:  # 404 is fine for root
                self.log_test("API Connectivity", True, "API server is responsive")
                return True
            else:
                self.log_test("API Connectivity", False, f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Connectivity", False, f"Connection failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 70)
        print("FRACTAL UX REFACTOR - BACKEND API TESTING")
        print("=" * 70)
        print(f"Base URL: {self.base_url}")
        print()
        
        # Test API connectivity first
        if not self.test_api_connectivity():
            print("❌ Cannot connect to API - stopping tests")
            return self.tests_passed, self.tests_run, self.test_results
        
        # Test chart endpoint
        chart_data = self.test_chart_endpoint()
        
        print()
        print("=" * 70)
        print(f"RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        if self.tests_run > 0:
            print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("=" * 70)
        
        return self.tests_passed, self.tests_run, self.test_results

def main():
    """Main test execution"""
    tester = FractalChartTester()
    passed, total, results = tester.run_all_tests()
    
    # Save results
    with open('/app/test_reports/fractal_chart_test_results.json', 'w') as f:
        json.dump({
            "summary": f"Fractal Chart Margin & Forecast Zone Testing",
            "tests_passed": passed,
            "tests_total": total,
            "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            "timestamp": datetime.now().isoformat(),
            "test_details": results
        }, f, indent=2)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())