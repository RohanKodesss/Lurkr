import re
import urllib.parse
import requests
from config import NETWORK_TIMEOUT

# Common phishing keywords in hostnames
SUSPICIOUS_KEYWORDS = [
    r'fake-bank', r'login-verify', r'paypa1', r'g00gle', r'secure-update',
    r'account-verify', r'bank-security', r'signin-confirm', r'update-account',
    r'wallet-connect', r'free-crypto', r'appleid-verify', r'security-check'
]

def check_url(url_input):
    """
    Evaluates URL for phishing patterns and HTTPS/SSL certificate validity.
    Returns dict formatted per API spec.
    """
    if not url_input or not str(url_input).strip():
        return {
            "check_type": "url",
            "status": "unavailable",
            "reason": "URL was not provided",
            "recommendation": "Enter a URL to check for security risks"
        }

    raw_url = str(url_input).strip()
    
    # Ensure scheme for parsing
    if not raw_url.startswith(('http://', 'https://')):
        url_to_parse = 'http://' + raw_url
        has_explicit_scheme = False
    else:
        url_to_parse = raw_url
        has_explicit_scheme = True

    try:
        parsed = urllib.parse.urlparse(url_to_parse)
        hostname = parsed.hostname or ""
    except Exception:
        return {
            "check_type": "url",
            "status": "risk",
            "reason": "Invalid or unparseable URL format",
            "recommendation": "Check the URL for typos or invalid characters"
        }

    risk_reasons = []

    # Rule 1: IP address used in domain
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', hostname):
        risk_reasons.append("URL uses a raw IP address instead of a domain name")

    # Rule 2: Suspicious phishing keywords
    for keyword in SUSPICIOUS_KEYWORDS:
        if re.search(keyword, hostname, re.IGNORECASE):
            risk_reasons.append(f"Domain contains suspicious phishing pattern ('{keyword}')")
            break

    # Rule 3: Excessive subdomains / Misleading structure
    subdomain_parts = hostname.split('.')
    if len(subdomain_parts) > 4:
        risk_reasons.append("Domain contains an unusually high number of subdomains")

    # Rule 4: '@' symbol in URL (used to obfuscate destination)
    if '@' in raw_url:
        risk_reasons.append("URL contains '@' symbol, which can hide the true target domain")

    # Rule 5: HTTPS & SSL Certificate Check
    uses_https = raw_url.lower().startswith('https://')
    cert_valid = True
    ssl_error_msg = None

    if not uses_https:
        risk_reasons.append("Site uses HTTP, not HTTPS (connection is unencrypted)")
    else:
        # Verify SSL Certificate
        try:
            # Short HEAD request to check certificate
            response = requests.head(raw_url, timeout=NETWORK_TIMEOUT, allow_redirects=True, verify=True)
        except requests.exceptions.SSLError:
            cert_valid = False
            ssl_error_msg = "Invalid, self-signed, or expired SSL certificate"
            risk_reasons.append(ssl_error_msg)
        except requests.exceptions.RequestException:
            # Could be offline, DNS failure, or non-existent domain (e.g. fake-bank-login.com)
            # Flag that HTTPS cert could not be verified
            risk_reasons.append("Could not establish a secure connection to verify SSL certificate")

    # Determine final status and recommendation
    if risk_reasons:
        status = "risk"
        reason = "; ".join(risk_reasons)
        
        if "HTTP, not HTTPS" in reason:
            recommendation = "Avoid entering sensitive information or passwords on unencrypted HTTP sites."
        elif "phishing pattern" in reason or "IP address" in reason:
            recommendation = "Avoid visiting this link. It exhibits indicators of phishing or deception."
        elif "SSL" in reason or "secure connection" in reason:
            recommendation = "Exercise caution. Do not submit credentials on sites with invalid security certificates."
        else:
            recommendation = "Proceed with caution and verify the source before interacting with this site."

        return {
            "check_type": "url",
            "status": status,
            "reason": reason,
            "recommendation": recommendation
        }

    return {
        "check_type": "url",
        "status": "pass",
        "reason": "URL appears safe: clean domain structure, uses secure HTTPS with valid certificate",
        "recommendation": None
    }
