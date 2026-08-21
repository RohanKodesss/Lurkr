import os
from dotenv import load_dotenv

load_dotenv()

# Network Request Timeouts (seconds)
NETWORK_TIMEOUT = 3.0

# External API Configuration
BREACH_API_KEY = os.getenv("BREACH_API_KEY", None)
XPOSEDORNOT_API_URL = "https://api.xposedornot.com/v1/check-email/"

# Stable Browser Version Benchmarks (Minimum recommended stable versions)
STABLE_BROWSER_VERSIONS = {
    "chrome": 128,
    "firefox": 129,
    "edge": 128,
    "safari": 17,
    "opera": 112
}

# Score Deduction Weights
DEDUCTIONS = {
    "url_phishing_pattern": 25,
    "url_invalid_ssl": 20,
    "url_http_only": 15,
    "email_breached": 25,
    "browser_outdated": 15,
}
