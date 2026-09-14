# Lurkr — 3-in-1 Digital Safety Scanner

> *"See the threat before it sees you."*

**Lurkr** is a unified digital safety scanner built for non-technical everyday users. It evaluates a web URL, an email address, and your current browser version in under 3 seconds — replacing the friction of visiting multiple separate security portals with a single real-time assessment and plain-language fixes.

---

## 🎯 The Problem

Everyday users are forced to juggle multiple disjointed tools just to check their digital safety:
- One site for data breach checks
- Another for URL and phishing scans
- A separate setting or website for browser update audits

Because of high friction and complex technical jargon, most users either skip security checks entirely or miss critical vulnerabilities they did not know existed.

---

## 💡 The Solution

**Lurkr** consolidates these checks into **one lightweight web application** (Flask backend + responsive dark-mode cyber UI):
1. **URL Phishing & Spoofing Detection** — Analyzes domain structures for deceptive keywords, typosquatting, raw IP usage, and misleading subdomains.
2. **HTTPS & SSL Certificate Verification** — Verifies TLS encryption, certificate expiration, and self-signed certificates with automated timeouts.
3. **Email Data Breach Scanner** — Queries public breach databases (via XposedOrNot) to report compromised services and leaked data types.
4. **Browser Security Audit** — Auto-detects browser client info and benchmarks the installed version against safe reference versions.
5. **Unified Security Score (0–100)** — Calculates a transparent risk score with itemized deductions and clear, plain-language action items.
6. **Privacy-First In-Memory History (RAM Cache)** — Temporarily caches recent scans in ephemeral server memory (`collections.deque`), giving users full control to inspect or flush history at any time without mandatory disk persistence.

---

## ⚡ Key Features

- **Consolidated 3-in-1 Scan**: Run URL, email, and browser audits in a single request.
- **Explainable Results ("The Why")**: Every flagged finding comes with human-readable rationale and actionable advice (e.g., *"Change your password and enable MFA"* or *"Site uses unencrypted HTTP; avoid entering sensitive data"*).
- **Independent Module Fault Tolerance**: If one external service (such as the breach API) experiences latency or downtime, the remaining modules execute seamlessly, returning `status: "unavailable"` without failing the request.
- **Tactical Cyberpunk UI**: Built with a sleek `#000000` dark theme, neon mint (`#2ee6a6`) radar motifs, dynamic SVG score gauge, and responsive mobile/desktop layouts.
- **Dual-Layer History Architecture**:
  - **In-Memory Buffer (RAM)**: Ephemeral, session-friendly cache accessible via `GET /recent-scans` and flushable via `DELETE /recent-scans`.
  - **SQLite Database (`lurkr.db`)**: Optional persistent historical record tracking `scans` and `check_results`.
- **Zero Heavy Frontend Build Steps**: Pure semantic HTML5, CSS3, and vanilla JavaScript for maximum speed and simplicity.

---

## 🏗️ Architecture & Data Flow

```
User submits form (URL, Email, Browser Version)
                    │
                    ▼
          Client-side JavaScript
    (Auto-detects browser if omitted)
                    │
                    ▼  POST /check (JSON)
           Flask Route (`app.py`)
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
check_url()   check_email()   check_browser()
(Regex & SSL) (XposedOrNot)   (Version Compare)
     │              │              │
     └──────────────┼──────────────┘
                    │
                    ▼
       Scoring Engine (`score_engine.py`)
         (Calculates 0–100 safety score)
                    │
     ┌──────────────┴──────────────┐
     ▼                             ▼
In-Memory Store (RAM)       SQLite DB (`lurkr.db`)
(`memory_store.py`)         (`save_scan()`)
                    │
                    ▼
         JSON Response Return (HTTP 200)
                    │
                    ▼
         Client-side UI Rendering
  (Dynamic Gauge + Result Cards + Recommendations)
```

---

## 📁 Project Structure

```
Lurkr/
├── API1.md                     # REST API Specification
├── Design.md                   # UI/UX Specification & Theme Tokens
├── Readme.md                   # Project Documentation
├── ds1.md                      # Data Schema Documentation
├── product resource document.md # Product Requirements Document
├── system architecture.md      # System Architecture Overview
└── BSR/                        # Main Application Package
    ├── app.py                  # Flask entry point & API routes
    ├── config.py               # Security score deductions & browser benchmarks
    ├── vercel.json             # Vercel serverless deployment config
    ├── requirements.txt        # Python package dependencies
    ├── checks/                 # Modular security check engines
    │   ├── browser_check.py    # User-agent parsing & version benchmark
    │   ├── email_check.py      # XposedOrNot breach API integration
    │   ├── score_engine.py     # Deductions & score calculator
    │   └── url_check.py        # Phishing heuristics & SSL cert verification
    ├── database/               # Storage & persistence layer
    │   ├── db.py               # SQLite connection & scan persistence
    │   ├── memory_store.py     # Ephemeral RAM deque cache
    │   ├── lurkr.db            # SQLite database file
    │   └── schema.sql          # Database initialization schema
    ├── static/                 # Frontend assets
    │   ├── style.css           # Tactical dark theme & layout styles
    │   ├── script.js           # Client interactions, API calls & DOM updates
    │   ├── favicon.png         # Lurkr radar favicon
    │   └── logo.png            # Lurkr brand asset
    ├── templates/
    │   └── index.html          # Single-page application template
    └── tests/                  # Automated test suite (18 unit tests)
        ├── test_app.py
        ├── test_browser_check.py
        ├── test_email_check.py
        ├── test_score_engine.py
        └── test_url_check.py
```

---

## ⚙️ Scoring System

Starting from a baseline score of **100**, deductions are applied for verified risks:

| Security Risk | Deduction | Severity |
| :--- | :---: | :---: |
| Phishing URL pattern detected | -25 pts | Risk |
| Invalid / Expired SSL certificate | -20 pts | Risk |
| Unencrypted HTTP link | -15 pts | Warning |
| Email exposed in data breach | -25 pts | Risk / Warning |
| Browser version outdated | -15 pts | Warning |
| Check skipped or service unavailable | 0 pts | Neutral |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- `pip` package manager

### 1. Clone & Navigate
```bash
git clone https://github.com/Rohan-Kami/Lurkr.git
cd Lurkr/BSR
```

### 2. Create and Activate Virtual Environment
```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt / PowerShell)
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```
*By default, the server starts on **`http://127.0.0.1:5001`** (configured to port 5001 to prevent macOS AirPlay port 5000 collisions).*

---

## 🔌 API Reference

### 1. `POST /check`
Executes security checks across URL, email, and browser version.

**Request Headers:**
`Content-Type: application/json`

**Request Body:**
```json
{
  "url": "http://suspicious-bank-login.com",
  "email": "user@example.com",
  "browser_version": "118.0"
}
```
*(All fields are optional; at least one field must be provided).*

**Response (HTTP 200):**
```json
{
  "overall_score": 50,
  "checks": [
    {
      "check_type": "url",
      "status": "risk",
      "reason": "Suspicious keywords detected (bank, login); Site uses HTTP, not HTTPS",
      "recommendation": "Do not enter sensitive credentials on this page."
    },
    {
      "check_type": "email",
      "status": "warning",
      "reason": "Found in 2 known data breaches (e.g. Adobe, Dropbox)",
      "recommendation": "Update passwords on affected services and enable Multi-Factor Authentication (MFA)."
    },
    {
      "check_type": "browser",
      "status": "warning",
      "reason": "Chrome version 118 is outdated. Minimum safe version is 128.",
      "recommendation": "Update Chrome to the latest version to patch known security vulnerabilities."
    }
  ]
}
```

---

### 2. `GET /recent-scans`
Retrieves recently cached scans from ephemeral server RAM.

**Response (HTTP 200):**
```json
{
  "count": 1,
  "storage_type": "Temporary RAM Cache (Not stored permanently on disk)",
  "scans": [
    {
      "timestamp": "2026-09-14T19:30:00.000Z",
      "url": "http://suspicious-bank-login.com",
      "email": "user@example.com",
      "browser_version": "118.0",
      "overall_score": 50,
      "checks": [...]
    }
  ]
}
```

---

### 3. `DELETE /recent-scans`
Flushes all items currently stored in ephemeral RAM.

**Response (HTTP 200):**
```json
{
  "message": "In-memory temporary cache cleared"
}
```

---

### 4. `GET /health`
Sanity check endpoint for server availability.

**Response (HTTP 200):**
```json
{
  "status": "ok"
}
```

---

## 🧪 Testing

Lurkr includes comprehensive unit test coverage across all check engines, the scoring engine, and Flask routes.

To execute the test suite:
```bash
python -m unittest discover -s tests
```

**Test Breakdown (18 tests):**
- `test_app.py`: Route validation, error handling, JSON responses, RAM cache endpoints.
- `test_url_check.py`: Domain validation, IP detection, phishing keywords, SSL/HTTPS handling.
- `test_email_check.py`: Valid email formatting, breach parsing, error fallback behavior.
- `test_browser_check.py`: User-agent parsing, version extraction, benchmark evaluation.
- `test_score_engine.py`: Baseline scoring, individual deductions, edge cases.

---

## 🌐 Deployment

Lurkr is production-ready for serverless deployment on platforms such as **Vercel**:
- Configured via [`BSR/vercel.json`](file:///Users/naveenkumar/.gemini/antigravity/scratch/Lurkr/BSR/vercel.json) using `@vercel/python`.
- For containerized or standard cloud hosts (e.g. Render, Railway, PythonAnywhere), run `python app.py` with standard environment variables.

---

## 👥 Contributors

- **Rohan Kami** ([@Rohan-Kami](https://github.com/Rohan-Kami))