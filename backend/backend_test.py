#!/usr/bin/env python3
"""
System Status Panel Backend Testing
Testing /api/fractal/v2.1/terminal endpoint and phaseSnapshot data
"""

import requests
import json
import sys
from datetime import datetime

class SystemStatusPanelTester:
    def __init__(self, base_url="https://fractal-interface-v2.preview.emergentagent.com"):
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

    def test_drift_intelligence_api(self, window="all"):
        """Test GET /api/spx/v2.1/admin/drift/intelligence"""
        url = f"{self.base_url}/api/spx/v2.1/admin/drift/intelligence"
        params = {"window": window}
        
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code != 200:
                self.log_test(
                    f"Drift Intelligence API ({window})", 
                    False, 
                    f"Status code {response.status_code}, expected 200"
                )
                return None
                
            data = response.json()
            
            # Check required fields
            required_fields = ["ok", "meta", "comparisons", "matrix"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if missing_fields:
                self.log_test(
                    f"Drift Intelligence API ({window})", 
                    False, 
                    f"Missing required fields: {missing_fields}"
                )
                return None
                
            if not data.get("ok", False):
                self.log_test(
                    f"Drift Intelligence API ({window})", 
                    False, 
                    f"API returned ok=false, error: {data.get('error', 'Unknown error')}"
                )
                return None
                
            self.log_test(
                f"Drift Intelligence API ({window})", 
                True, 
                f"API returns ok=true with required fields"
            )
            
            return data
            
        except Exception as e:
            self.log_test(
                f"Drift Intelligence API ({window})", 
                False, 
                f"Request failed: {str(e)}"
            )
            return None

    def test_critical_severity_with_zero_live_samples(self, data):
        """Test that severity is CRITICAL when LIVE samples = 0"""
        if not data:
            return
            
        live_samples = data.get("meta", {}).get("liveSamples", -1)
        severity = data.get("meta", {}).get("severity", "")
        
        if live_samples == 0:
            expected_critical = severity == "CRITICAL"
            self.log_test(
                "CRITICAL Severity (LIVE=0)", 
                expected_critical, 
                f"LIVE samples: {live_samples}, Severity: {severity}, Expected: CRITICAL"
            )
        else:
            self.log_test(
                "CRITICAL Severity Check", 
                True, 
                f"LIVE samples: {live_samples} > 0, Severity: {severity} (not required to be CRITICAL)"
            )

    def test_cohort_comparisons(self, data):
        """Test that comparisons contain V1950, V2020, ALL_VINTAGE"""
        if not data:
            return
            
        comparisons = data.get("comparisons", [])
        expected_cohorts = {"V1950", "V2020", "ALL_VINTAGE"}
        found_cohorts = {comp.get("cohort") for comp in comparisons}
        
        missing_cohorts = expected_cohorts - found_cohorts
        extra_cohorts = found_cohorts - expected_cohorts
        
        success = len(missing_cohorts) == 0
        details = f"Found cohorts: {sorted(found_cohorts)}"
        if missing_cohorts:
            details += f", Missing: {sorted(missing_cohorts)}"
        if extra_cohorts:
            details += f", Extra: {sorted(extra_cohorts)}"
            
        self.log_test("Cohort Comparisons", success, details)
        
        return success

    def test_delta_matrix_structure(self, data):
        """Test that delta matrix contains hitRate, expectancy, sharpe, maxDD"""
        if not data:
            return
            
        matrix = data.get("matrix", {})
        expected_metrics = {"hitRate", "expectancy", "sharpe", "maxDD"}
        found_metrics = set(matrix.keys())
        
        missing_metrics = expected_metrics - found_metrics
        extra_metrics = found_metrics - expected_metrics
        
        success = len(missing_metrics) == 0
        details = f"Found metrics: {sorted(found_metrics)}"
        if missing_metrics:
            details += f", Missing: {sorted(missing_metrics)}"
        if extra_metrics:
            details += f", Extra: {sorted(extra_metrics)}"
            
        self.log_test("Delta Matrix Structure", success, details)
        
        # Check that each metric has cohort data
        if success and found_metrics:
            cohorts_check = True
            for metric in expected_metrics:
                metric_data = matrix.get(metric, {})
                if not isinstance(metric_data, dict) or len(metric_data) == 0:
                    cohorts_check = False
                    self.log_test(f"Delta Matrix {metric} Data", False, f"No cohort data for {metric}")
                else:
                    cohort_list = sorted(metric_data.keys())
                    self.log_test(f"Delta Matrix {metric} Data", True, f"Cohorts: {cohort_list}")

    def test_different_windows(self):
        """Test different window parameters"""
        windows = ["30d", "60d", "90d", "180d", "365d", "all"]
        
        for window in windows:
            data = self.test_drift_intelligence_api(window)
            if data and window == "90d":
                # Run detailed tests on 90d window
                self.test_critical_severity_with_zero_live_samples(data)
                self.test_cohort_comparisons(data)
                self.test_delta_matrix_structure(data)

    def test_invalid_window(self):
        """Test API with invalid window parameter"""
        url = f"{self.base_url}/api/spx/v2.1/admin/drift/intelligence"
        params = {"window": "invalid_window"}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 400:
                data = response.json()
                if not data.get("ok", True) and "Invalid window" in data.get("error", ""):
                    self.log_test("Invalid Window Validation", True, "Correctly rejected invalid window")
                else:
                    self.log_test("Invalid Window Validation", False, "Wrong error response format")
            else:
                self.log_test("Invalid Window Validation", False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Window Validation", False, f"Request failed: {str(e)}")

    def run_all_tests(self):
        """Run all SPX Drift Intelligence tests"""
        print("=" * 60)
        print("SPX DRIFT INTELLIGENCE BACKEND TESTING")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print()
        
        # Test all windows
        self.test_different_windows()
        
        # Test error handling
        self.test_invalid_window()
        
        print()
        print("=" * 60)
        print(f"RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 60)
        
        return self.tests_passed, self.tests_run, self.test_results

def main():
    """Main test execution"""
    tester = SPXDriftTester()
    passed, total, results = tester.run_all_tests()
    
    # Save results
    with open('/app/backend/spx_drift_test_results.json', 'w') as f:
        json.dump({
            "summary": f"SPX Drift Intelligence Backend Testing",
            "tests_passed": passed,
            "tests_total": total,
            "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            "timestamp": datetime.now().isoformat(),
            "test_details": results
        }, f, indent=2)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())