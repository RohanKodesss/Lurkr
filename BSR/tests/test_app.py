import unittest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

class TestAppEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check(self):
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "ok")

    def test_index_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    def test_check_post_empty_body(self):
        response = self.app.post('/check', data=json.dumps({}), content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_check_post_valid_payload(self):
        payload = {
            "url": "http://fake-bank-login.com",
            "email": "test@example.com",
            "browser_version": "118.0"
        }
        response = self.app.post('/check', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("overall_score", data)
        self.assertIn("checks", data)
        self.assertEqual(len(data["checks"]), 3)

    def test_recent_scans_in_memory_cache(self):
        # 1. Clear memory
        self.app.delete('/recent-scans')
        
        # 2. Perform a check
        payload = {
            "url": "https://example.com",
            "email": "user@example.com",
            "browser_version": "128"
        }
        self.app.post('/check', data=json.dumps(payload), content_type='application/json')
        
        # 3. Verify item exists in /recent-scans
        response = self.app.get('/recent-scans')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertGreater(data["count"], 0)
        self.assertEqual(data["scans"][0]["url"], "https://example.com")
        
        # 4. Clear cache and verify count drops to 0
        del_response = self.app.delete('/recent-scans')
        self.assertEqual(del_response.status_code, 200)
        
        get_again = self.app.get('/recent-scans')
        data_again = json.loads(get_again.data)
        self.assertEqual(data_again["count"], 0)

if __name__ == '__main__':
    unittest.main()
