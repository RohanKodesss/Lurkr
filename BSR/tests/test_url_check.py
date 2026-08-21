import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from checks.url_check import check_url

class TestUrlCheck(unittest.TestCase):

    def test_phishing_pattern_url(self):
        result = check_url("http://fake-bank-login.com")
        self.assertEqual(result["check_type"], "url")
        self.assertEqual(result["status"], "risk")
        self.assertIn("phishing", result["reason"].lower())

    def test_http_only_url(self):
        result = check_url("http://example.com")
        self.assertEqual(result["status"], "risk")
        self.assertIn("HTTP", result["reason"])

    def test_empty_url(self):
        result = check_url("")
        self.assertEqual(result["status"], "unavailable")

if __name__ == '__main__':
    unittest.main()
