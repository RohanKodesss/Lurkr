import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from checks.email_check import check_email

class TestEmailCheck(unittest.TestCase):

    def test_invalid_email(self):
        result = check_email("invalid-email-address")
        self.assertEqual(result["check_type"], "email")
        self.assertEqual(result["status"], "warning")
        self.assertIn("Invalid email", result["reason"])

    def test_empty_email(self):
        result = check_email("")
        self.assertEqual(result["status"], "unavailable")

    def test_simulated_breach_email(self):
        result = check_email("test@example.com")
        self.assertIn(result["status"], ["warning", "pass", "unavailable"])

if __name__ == '__main__':
    unittest.main()
