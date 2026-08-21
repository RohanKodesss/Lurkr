# BSR — Browser Security Report

A single tool that checks your browser version, a URL, and an email address for security risks — replacing the need to visit multiple separate sites.

## Problem

Everyday users must visit multiple separate tools to check their digital safety — one site for breach checks, one for URL scans, one for browser update status. No single package runs all checks together. As a result, users either skip checks entirely (too much friction) or miss checks they don't know exist.

## Solution

BSR is a single web app (one interface, one Flask backend) that runs all checks together — browser version, URL phishing signals, and email breach status — and returns one combined report with a score, flags, and fixes. Core pitch: replace 4 tools with 1.

## Key Features

- URL phishing check — flags misspelled domains, misleading subdomains, suspicious redirects
- HTTPS / certificate validity check — flags HTTP-only or invalid/expired certificates
- Email breach check — checks a submitted email against a breach-checking API
- Browser version check — compares current browser version against the latest known stable version
- Combined security score (0–100) with deductions per risk found
- Individual check results — status, findings, and recommendation shown per check, not just an overall score
- Actionable, plain-language recommendations for each flagged risk
- Independent module failure handling — if one check fails/is unavailable, the others still complete and the report marks the unavailable check

## Demo

[Placeholder — add link to live demo or demo video here]

## Screenshots

[Placeholder — add screenshots of the form and report screens here]

## Tech Stack

- **Python + Flask** — backend, ties all checks together into one app
- **HTML/CSS/JavaScript** (hand-written) — single-page frontend, form + report view
- **Python `requests` library** — calls external APIs (breach check) from Flask
- **Python `re` (regex)** — rule-based URL pattern checks, no ML
- **SQLite** (optional) — only used if scan history feature is built; otherwise not required

## Architecture Overview

Single Flask app, single form-based page. Frontend sends one request to one backend route, which runs three independent checks and returns one combined JSON report.

```
User fills form (URL, email, browser version)
        ↓
JS collects data, calls fetch() to POST /check
        ↓
Flask route receives data
        ↓
   ┌────────────┬─────────────┬──────────────┐
   ↓             ↓             ↓
check_url()   check_email()  check_browser()
   ↓             ↓             ↓
   └────────────┴─────────────┘
        ↓
Combine results → calculate score
        ↓
Return JSON: {score, checks: [...]}
        ↓
JS receives JSON, updates page to show report
```

## Project Structure

```
BSR/
├── app.py                 # Flask app, routes
├── checks/
│   ├── url_check.py        # URL + HTTPS/cert logic
│   ├── email_check.py      # breach API call
│   └── browser_check.py    # version comparison
├── templates/
│   └── index.html          # single page (form + report sections)
├── static/
│   ├── style.css
│   └── script.js            # fetch() call, DOM update logic
├── requirements.txt         # Flask, requests, etc.
└── venv/                    # virtual environment (not pushed to GitHub)
```

## Prerequisites

- Python 3.x installed
- pip installed
- [Placeholder — add any other prerequisites your team requires]

## Installation

```bash
# Clone the repository
git clone [Placeholder — add repo URL]
cd BSR

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Environment Variables

BSR uses an external breach-checking API (e.g. Have I Been Pwned) which may require an API key.

```
BREACH_API_KEY=[Placeholder — add your API key here]
```

Do not commit your `.env` file or hardcode API keys in source code.

## How to Run — Backend

```bash
flask run
```

By default, this starts the Flask app locally (e.g. `http://127.0.0.1:5000`) since the frontend is served from the same app (`templates/index.html`), there is no separate frontend server to start.

## How to Run — Frontend

The frontend (`templates/index.html`, `static/style.css`, `static/script.js`) is served directly by the Flask backend — no separate build step or frontend server required. Once `flask run` is running, open the local URL in a browser to use the app.

## Database Setup

No database is required for the core MVP — all checks run and return results within a single request.

If the scan-history feature is implemented, BSR uses SQLite:

```sql
CREATE TABLE scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    url TEXT,
    email TEXT,
    browser_version TEXT,
    overall_score INTEGER NOT NULL
);

CREATE TABLE check_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    recommendation TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE INDEX idx_check_results_scan_id ON check_results(scan_id);
```

[Placeholder — add instructions for initializing the SQLite file if this feature is built]

## API Documentation

### `POST /check`

Runs all three checks (URL, email, browser version) and returns a combined report.

**Request body:**

```json
{
  "url": "http://fake-bank-login.com",
  "email": "test@example.com",
  "browser_version": "118.0"
}
```

**Success response (200):**

```json
{
  "overall_score": 62,
  "checks": [
    {
      "check_type": "url",
      "status": "risk",
      "reason": "Suspicious domain pattern detected; site uses HTTP, not HTTPS",
      "recommendation": "Avoid visiting this link"
    },
    {
      "check_type": "email",
      "status": "warning",
      "reason": "Found in known breach",
      "recommendation": "Change password, enable MFA"
    },
    {
      "check_type": "browser",
      "status": "pass",
      "reason": "Browser up to date",
      "recommendation": null
    }
  ]
}
```

**Error responses:**

- `400` — invalid or missing input
- `500` — unexpected server error
- `200` (with `"status": "unavailable"` on the affected check) — used when one check (e.g. the breach API) fails, so the rest of the report still returns successfully

### `GET /health`

Returns `{ "status": "ok" }` if the server is running. Useful for a quick pre-demo sanity check.

## Testing

[Placeholder — add testing approach/instructions here, e.g. manual test cases for each check, sample inputs to try]

## Deployment

For the hackathon demo, BSR is intended to run locally via `flask run`, demoed on `localhost`.

Optional public deployment (stretch goal, not required): a free-tier host such as Render or PythonAnywhere can run a small Flask app with minimal setup.

[Placeholder — add actual deployment URL here if deployed]

## Future Improvements

- Extension permission scanner (full implementation)
- Save/rescan history within the app
- Browser-extension popup form factor for the whole tool
- Historical trend tracking across multiple scans
- Production-grade security hardening (rate limiting, full authentication)

## Team Members

[Placeholder — add team member names and roles here]