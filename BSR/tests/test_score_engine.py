import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from checks.score_engine import calculate_score

class TestScoreEngine(unittest.TestCase):

    def test_all_pass_score(self):
        checks = [
            {"check_type": "url", "status": "pass", "reason": "OK"},
            {"check_type": "email", "status": "pass", "reason": "OK"},
            {"check_type": "browser", "status": "pass", "reason": "OK"}
        ]
        score = calculate_score(checks)
        self.assertEqual(score, 100)

    def test_deductions(self):
        checks = [
            {"check_type": "url", "status": "risk", "reason": "Phishing pattern detected"},
            {"check_type": "email", "status": "warning", "reason": "Found in breach"},
            {"check_type": "browser", "status": "pass", "reason": "OK"}
        ]
        score = calculate_score(checks)
        self.assertEqual(score, 50) # 100 - 25 - 25 = 50

    def test_unavailable_check_no_penalty(self):
        checks = [
            {"check_type": "url", "status": "pass", "reason": "OK"},
            {"check_type": "email", "status": "unavailable", "reason": "API offline"},
            {"check_type": "browser", "status": "pass", "reason": "OK"}
        ]
        score = calculate_score(checks)
        self.assertEqual(score, 100)

if __name__ == '__main__':
    unittest.main()
