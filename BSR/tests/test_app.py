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

if __name__ == '__main__':
    unittest.main()
