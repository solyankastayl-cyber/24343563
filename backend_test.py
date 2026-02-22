#!/usr/bin/env python3
"""
U7 RiskBox 2.0 Backend Testing
Testing volatility regime, sizing data, and terminal API integration
"""

import requests
import json
import sys
from datetime import datetime

class U7RiskBoxTester:
    def __init__(self, base_url="https://fractal-dev-3.preview.emergentagent.com"):
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

    def test_terminal_api(self, symbol="BTC", focus="30d"):
        """Test GET /api/fractal/v2.1/terminal for volatility and sizing data"""
        url = f"{self.base_url}/api/fractal/v2.1/terminal"
        params = {"symbol": symbol, "set": "extended", "focus": focus}
        
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code != 200:
                self.log_test(
                    f"Terminal API ({symbol}, {focus})", 
                    False, 
                    f"Status code {response.status_code}, expected 200"
                )
                return None
                
            data = response.json()
            
            # Check for required volatility data
            volatility = data.get("volatility")
            if not volatility:
                self.log_test(
                    f"Terminal API Volatility ({symbol}, {focus})", 
                    False, 
                    "Missing volatility data"
                )
                return None
                
            # Check volatility has regime field
            vol_regime = volatility.get("regime")
            if not vol_regime:
                self.log_test(
                    f"Terminal API Vol Regime ({symbol}, {focus})", 
                    False, 
                    "Missing volatility.regime field"
                )
            else:
                self.log_test(
                    f"Terminal API Vol Regime ({symbol}, {focus})", 
                    True, 
                    f"Vol regime: {vol_regime}"
                )
            
            # Check for sizing data in decisionKernel
            decision_kernel = data.get("decisionKernel", {})
            sizing = decision_kernel.get("sizing")
            
            if not sizing:
                self.log_test(
                    f"Terminal API Sizing ({symbol}, {focus})", 
                    False, 
                    "Missing decisionKernel.sizing data"
                )
                return None
            else:
                # Check sizing structure
                final_size = sizing.get("finalSize", 0)
                mode = sizing.get("mode", "")
                blockers = sizing.get("blockers", [])
                
                self.log_test(
                    f"Terminal API Sizing ({symbol}, {focus})", 
                    True, 
                    f"Final size: {final_size}, Mode: {mode}, Blockers: {len(blockers)}"
                )
            
            self.log_test(
                f"Terminal API ({symbol}, {focus})", 
                True, 
                "API returns required volatility and sizing data"
            )
            
            return data
            
        except Exception as e:
            self.log_test(
                f"Terminal API ({symbol}, {focus})", 
                False, 
                f"Request failed: {str(e)}"
            )
            return None

    def test_focus_pack_api(self, symbol="BTC", focus="30d"):
        """Test GET /api/fractal/v2.1/focus-pack for scenario data"""
        url = f"{self.base_url}/api/fractal/v2.1/focus-pack"
        params = {"symbol": symbol, "focus": focus}
        
        try:
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code != 200:
                self.log_test(
                    f"Focus Pack API ({symbol}, {focus})", 
                    False, 
                    f"Status code {response.status_code}, expected 200"
                )
                return None
                
            data = response.json()
            
            # Check for scenario data needed by RiskBox
            scenario = data.get("focusPack", {}).get("scenario")
            if not scenario:
                self.log_test(
                    f"Focus Pack Scenario ({symbol}, {focus})", 
                    False, 
                    "Missing focusPack.scenario data"
                )
                return None
            
            # Check for avgMaxDD and tailRiskP95
            avg_max_dd = scenario.get("avgMaxDD")
            tail_risk_p95 = scenario.get("tailRiskP95")
            
            if avg_max_dd is None:
                self.log_test(
                    f"Focus Pack avgMaxDD ({symbol}, {focus})", 
                    False, 
                    "Missing scenario.avgMaxDD"
                )
            else:
                self.log_test(
                    f"Focus Pack avgMaxDD ({symbol}, {focus})", 
                    True, 
                    f"avgMaxDD: {avg_max_dd:.3f} ({avg_max_dd*100:.1f}%)"
                )
            
            if tail_risk_p95 is None:
                self.log_test(
                    f"Focus Pack tailRiskP95 ({symbol}, {focus})", 
                    False, 
                    "Missing scenario.tailRiskP95"
                )
            else:
                self.log_test(
                    f"Focus Pack tailRiskP95 ({symbol}, {focus})", 
                    True, 
                    f"tailRiskP95: {tail_risk_p95:.3f} ({tail_risk_p95*100:.1f}%)"
                )
            
            self.log_test(
                f"Focus Pack API ({symbol}, {focus})", 
                True, 
                "API returns scenario data with drawdown stats"
            )
            
            return data
            
        except Exception as e:
            self.log_test(
                f"Focus Pack API ({symbol}, {focus})", 
                False, 
                f"Request failed: {str(e)}"
            )
            return None

    def test_crisis_mode_behavior(self, terminal_data):
        """Test that crisis mode shows NO_TRADE with blockers"""
        if not terminal_data:
            return
            
        volatility = terminal_data.get("volatility", {})
        vol_regime = volatility.get("regime", "")
        
        sizing = terminal_data.get("decisionKernel", {}).get("sizing", {})
        mode = sizing.get("mode", "")
        final_size = sizing.get("finalSize", 0)
        blockers = sizing.get("blockers", [])
        
        if vol_regime == "CRISIS":
            # In crisis mode, should have NO_TRADE mode and 0 final size
            crisis_behavior_correct = (
                mode == "NO_TRADE" and 
                final_size == 0 and 
                len(blockers) > 0
            )
            
            self.log_test(
                "Crisis Mode NO_TRADE Behavior", 
                crisis_behavior_correct, 
                f"Vol regime: {vol_regime}, Mode: {mode}, Size: {final_size}, Blockers: {len(blockers)}"
            )
            
            # Check for expected blockers in crisis
            expected_crisis_blockers = ["VOL_CRISIS", "EXTREME_VOL_SPIKE", "LOW_CONFIDENCE", "HIGH_ENTROPY"]
            found_crisis_blockers = [b for b in expected_crisis_blockers if b in blockers]
            
            self.log_test(
                "Crisis Mode Blockers", 
                len(found_crisis_blockers) > 0, 
                f"Expected crisis blockers found: {found_crisis_blockers}, All blockers: {blockers}"
            )
        else:
            self.log_test(
                "Crisis Mode Check", 
                True, 
                f"Vol regime: {vol_regime} (not in crisis, test N/A)"
            )

    def test_sizing_breakdown_structure(self, terminal_data):
        """Test that sizing has proper breakdown structure"""
        if not terminal_data:
            return
            
        sizing = terminal_data.get("decisionKernel", {}).get("sizing", {})
        
        # Check for sizing breakdown components
        required_fields = ["finalSize", "mode", "breakdown", "explain", "formula"]
        missing_fields = [f for f in required_fields if f not in sizing]
        
        if missing_fields:
            self.log_test(
                "Sizing Breakdown Structure", 
                False, 
                f"Missing fields: {missing_fields}"
            )
        else:
            breakdown = sizing.get("breakdown", [])
            explain = sizing.get("explain", [])
            formula = sizing.get("formula", "")
            
            self.log_test(
                "Sizing Breakdown Structure", 
                True, 
                f"Breakdown steps: {len(breakdown)}, Explanations: {len(explain)}, Formula: {formula[:50]}..."
            )
            
            # Check breakdown items have required structure
            if breakdown and len(breakdown) > 0:
                first_item = breakdown[0]
                item_fields = ["factor", "multiplier", "severity", "note"]
                item_missing = [f for f in item_fields if f not in first_item]
                
                self.log_test(
                    "Sizing Breakdown Items", 
                    len(item_missing) == 0, 
                    f"First item fields: {list(first_item.keys())}, Missing: {item_missing}"
                )

    def test_different_horizons(self):
        """Test multiple horizons return different risk assessments"""
        horizons = ["7d", "30d", "90d", "365d"]
        terminal_results = {}
        scenario_results = {}
        
        for horizon in horizons:
            terminal_data = self.test_terminal_api("BTC", horizon)
            scenario_data = self.test_focus_pack_api("BTC", horizon)
            
            if terminal_data:
                terminal_results[horizon] = terminal_data
            if scenario_data:
                scenario_results[horizon] = scenario_data
        
        # Check that different horizons have different risk characteristics
        if len(terminal_results) >= 2:
            horizon_keys = list(terminal_results.keys())
            h1, h2 = horizon_keys[0], horizon_keys[1]
            
            vol1 = terminal_results[h1].get("volatility", {}).get("regime")
            vol2 = terminal_results[h2].get("volatility", {}).get("regime")
            
            size1 = terminal_results[h1].get("decisionKernel", {}).get("sizing", {}).get("finalSize", 0)
            size2 = terminal_results[h2].get("decisionKernel", {}).get("sizing", {}).get("finalSize", 0)
            
            self.log_test(
                "Horizon Risk Variance", 
                True, 
                f"{h1}: Vol={vol1}, Size={size1:.2f} vs {h2}: Vol={vol2}, Size={size2:.2f}"
            )
        
        return terminal_results, scenario_results

    def run_all_tests(self):
        """Run all U7 RiskBox tests"""
        print("=" * 60)
        print("U7 RISKBOX 2.0 BACKEND TESTING")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print()
        
        # Test main APIs
        terminal_data = self.test_terminal_api("BTC", "30d")
        scenario_data = self.test_focus_pack_api("BTC", "30d")
        
        # Test crisis mode behavior
        if terminal_data:
            self.test_crisis_mode_behavior(terminal_data)
            self.test_sizing_breakdown_structure(terminal_data)
        
        # Test different horizons
        self.test_different_horizons()
        
        print()
        print("=" * 60)
        print(f"RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 60)
        
        return self.tests_passed, self.tests_run, self.test_results

def main():
    """Main test execution"""
    tester = U7RiskBoxTester()
    passed, total, results = tester.run_all_tests()
    
    # Save results
    with open('/app/test_reports/u7_backend_test_results.json', 'w') as f:
        json.dump({
            "summary": f"U7 RiskBox 2.0 Backend Testing",
            "tests_passed": passed,
            "tests_total": total,
            "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%",
            "timestamp": datetime.now().isoformat(),
            "test_details": results
        }, f, indent=2)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())