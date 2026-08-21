import os
from flask import Flask, render_template, request, jsonify
from checks.url_check import check_url
from checks.email_check import check_email
from checks.browser_check import check_browser
from checks.score_engine import calculate_score
from database.db import init_db, save_scan

app = Flask(__name__)

# Initialize database tables on startup (optional history feature)
try:
    init_db()
except Exception as e:
    print(f"[Init Warning] Database setup skipped: {e}")

@app.route('/')
def index():
    """Renders single-page frontend application."""
    return render_template('index.html')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint to verify server status."""
    return jsonify({"status": "ok"}), 200

@app.route('/check', methods=['POST'])
def run_check():
    """
    Primary API endpoint for security checks.
    Accepts JSON body: { "url": "...", "email": "...", "browser_version": "..." }
    """
    if not request.is_json:
        return jsonify({
            "error": "Invalid request",
            "details": "Content-Type must be application/json"
        }), 400

    data = request.get_json() or {}
    url = data.get("url", "").strip() if data.get("url") else None
    email = data.get("email", "").strip() if data.get("email") else None
    browser_version = data.get("browser_version", "").strip() if data.get("browser_version") else None

    # Check if at least one field is provided
    if not url and not email and not browser_version:
        return jsonify({
            "error": "Invalid request",
            "details": "at least one of url, email, browser_version required"
        }), 400

    checks_results = []

    # Run URL check
    if url:
        try:
            url_res = check_url(url)
        except Exception as e:
            url_res = {
                "check_type": "url",
                "status": "unavailable",
                "reason": f"URL check service failed: {str(e)}",
                "recommendation": None
            }
        checks_results.append(url_res)

    # Run Email check
    if email:
        try:
            email_res = check_email(email)
        except Exception as e:
            email_res = {
                "check_type": "email",
                "status": "unavailable",
                "reason": f"Breach check service failed: {str(e)}",
                "recommendation": None
            }
        checks_results.append(email_res)

    # Run Browser check
    if browser_version or not (url or email):
        user_agent = request.headers.get('User-Agent')
        try:
            browser_res = check_browser(browser_version, user_agent=user_agent)
        except Exception as e:
            browser_res = {
                "check_type": "browser",
                "status": "unavailable",
                "reason": f"Browser check service failed: {str(e)}",
                "recommendation": None
            }
        checks_results.append(browser_res)

    # Calculate overall security score
    overall_score = calculate_score(checks_results)

    # Save to optional SQLite database
    save_scan(url, email, browser_version, overall_score, checks_results)

    return jsonify({
        "overall_score": overall_score,
        "checks": checks_results
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
