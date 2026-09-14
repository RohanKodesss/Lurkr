# Lurkr — Hackathon Architecture Document

Team: beginner devs (HTML/CSS/JS basics), using AI coding agent. Goal: simple, explainable, buildable in hackathon time.

## 1. Recommended Tech Stack

- **Python + Flask** — backend, ties all checks together into one app
- **HTML/CSS/JavaScript (hand-written)** — single-page frontend, form + report view
- **Python `requests` library** — calls external APIs (breach check) from Flask
- **Python `re` (regex)** — rule-based URL pattern checks, no ML needed
- **In-Memory Cache (RAM)** — `database/memory_store.py` for privacy-first temporary scan history
- **SQLite (optional)** — `database/lurkr.db` for scan history persistence

Why this stack: matches skills team already has (Python 7/10, HTML/CSS 7/10), avoids new frameworks under time pressure, no build tools/compilers needed — plain files, runs directly.

## 2. Frontend Architecture

One HTML page, states shown/hidden with JavaScript (not separate pages — avoids page-reload complexity):

- **Form state**: URL input, email input, browser version field (auto-filled from `navigator.userAgent`)
- **Report state**: score gauge + per-check result cards, shown after form submits
- **History Drawer**: slide-over or collapsible drawer displaying temporary RAM cached scans

JavaScript's job: collect form data, send it to Flask backend (`fetch()` call), receive JSON result, and update the page to show the report — no page reload needed.

Plain language: `fetch()` is JavaScript's way of "calling" your backend from the browser without refreshing the page. You send data, wait, get data back, then use JS to fill in the report section on the same page.

## 3. Backend Architecture

Single Flask app (`app.py`), modularized into clear packages:

- **Primary route** (`POST /check`) accepts form data (URL, email, browser version) as a POST request
- Route function calls three separate Python check functions:
    - `check_url(url)` — regex rules + HTTPS/cert check
    - `check_email(email)` — calls XposedOrNot breach API
    - `check_browser(version)` — compares against latest known version
- Each function returns a structured result (status + reason + recommendation), wrapped in `try/except` so one failing check doesn't crash the others
- All three results get combined into one score (`calculate_score()`) + saved to temporary RAM cache (`add_to_memory_cache()`) and optional SQLite (`save_scan()`)
- Returns combined JSON response to frontend

## 4. In-Memory & Database Architecture

- **Temporary RAM Cache** (`database/memory_store.py`): Uses Python's `collections.deque(maxlen=20)` to temporarily hold the most recent scans in server RAM. Flushed on restart or via `DELETE /recent-scans`. Respects user privacy.
- **SQLite Persistence** (`database/lurkr.db`): Provides historical records in `scans` and `check_results` tables via `database/db.py`.

## 5. Authentication Approach

**None.** No login, no accounts — matches "quick single tool" pitch and PRD's out-of-scope list. Skipping this entirely saves significant hackathon time and isn't needed for the core demo.

## 6. External APIs / Services

- **XposedOrNot API** (or Have I Been Pwned) — for email breach checking. Fast, reliable, with graceful fallback on timeouts.
- No other external services needed — URL rules and browser version check are done with local logic, no external API required for those.

## 7. AI Model Integration

**Not required for MVP.** PRD explicitly rules out ML-based phishing detection for the hackathon — rule-based regex checks are enough and far faster to build/debug/explain in a demo or viva. Mentioning "future work: ML-based detection" in the pitch is fine, but don't build it.

## 8. Complete Request/Data Flow

```
User fills form (URL, email, browser version)
        ↓
JS collects data, calls fetch() to POST /check
        ↓
Flask route receives data
        ↓
   ┌────────────┬─────────────┬──────────────┐
   ↓            ↓             ↓
check_url()  check_email()  check_browser()
   ↓            ↓             ↓
   └────────────┴─────────────┘
        ↓
Combine results → calculate score
        ↓
Save to RAM cache (`memory_store`) + SQLite (`lurkr.db`)
        ↓
Return JSON: {overall_score, checks: [...]}
        ↓
JS receives JSON, updates page to show report & gauge
```

## 9. Folder Structure

```
Lurkr/
├── API1.md
├── Design.md
├── Readme.md
├── ds1.md
├── product resource document.md
├── system architecture.md
└── BSR/
    ├── app.py                 # Flask app, routes
    ├── config.py              # Benchmarks & deduction constants
    ├── vercel.json            # Vercel serverless deployment config
    ├── requirements.txt       # Flask, requests, etc.
    ├── checks/
    │   ├── url_check.py       # URL + HTTPS/cert logic
    │   ├── email_check.py     # breach API call
    │   ├── browser_check.py   # version comparison
    │   └── score_engine.py    # score calculation
    ├── database/
    │   ├── db.py              # SQLite storage logic
    │   ├── memory_store.py    # In-memory RAM deque cache
    │   ├── lurkr.db           # SQLite database
    │   └── schema.sql         # Database schema
    ├── templates/
    │   └── index.html         # single page (form + report sections)
    ├── static/
    │   ├── style.css          # Dark cyber theme styling
    │   ├── script.js          # fetch() call, DOM update logic
    │   ├── favicon.png        # Favicon
    │   └── logo.png           # Brand logo
    └── tests/                 # Unit test suite
        ├── test_app.py
        ├── test_browser_check.py
        ├── test_email_check.py
        ├── test_score_engine.py
        └── test_url_check.py
```

## 10. Major Components

1. **Frontend form + report UI** (HTML/CSS/JS)
2. **Flask route handler** (`app.py`) — receives requests, orchestrates checks
3. **URL check module** — regex rules + HTTPS/cert validation
4. **Email check module** — breach API integration
5. **Browser check module** — version comparison logic
6. **Score engine** — combines all check results into one score
7. **RAM Memory Store** (`memory_store.py`) — privacy-first ephemeral history
8. **SQLite Database** (`db.py` & `lurkr.db`) — persistent scan logging

## 11. Security Considerations

- Validate all inputs server-side (don't trust the frontend alone) — check URL format, email format before processing
- Don't log or store submitted emails/URLs permanently without user awareness; provide RAM-only cache with clear endpoints
- Handle API errors without exposing raw error messages/stack traces to the user
- Run locally on port 5001 to avoid default macOS AirPlay port 5000 conflicts
- Use HTTPS if deploying publicly
- Keep any API keys out of code — use environment variables, don't hardcode or push to GitHub

## 12. Deployment Architecture

- **Local demo**: `python app.py` (or `flask run --port=5001`), demo via `localhost:5001`.
- **Public deployment**: Serverless deployment via Vercel (`vercel.json`) or platforms like Render/PythonAnywhere.

## 13. Simplifications for Hackathon

- In-memory cache + lightweight SQLite — calculate everything fast per-request
- No login/auth — anonymous single-use tool
- No ML — regex/rule-based checks only
- No extension scanner — mentioned as future work only
- One Flask app, one primary route for all checks — not microservices
- Browser version auto-detection via `navigator.userAgent` with manual override capability
- Single HTML page with dynamic JS state transitions — no multi-page routing needed