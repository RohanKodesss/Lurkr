import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from checks.browser_check import check_browser

class TestBrowserCheck(unittest.TestCase):

    def test_up_to_date_browser(self):
        result = check_browser("128", None)
        self.assertEqual(result["check_type"], "browser")
        self.assertEqual(result["status"], "pass")
        self.assertIn("up to date", result["reason"])

    def test_outdated_browser(self):
        result = check_browser("115", None)
        self.assertEqual(result["check_type"], "browser")
        self.assertEqual(result["status"], "warning")
        self.assertIsNotNone(result["recommendation"])

    def test_user_agent_parsing(self):
        ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
        result = check_browser("", ua)
        self.assertEqual(result["status"], "pass")

    def test_missing_version(self):
        result = check_browser("", "")
        self.assertEqual(result["status"], "unavailable")

if __name__ == '__main__':
    unittest.main()
