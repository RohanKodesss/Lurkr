# BSR — Hackathon Architecture Document

Team: beginner devs (HTML/CSS/JS basics), using AI coding agent. Goal: simple, explainable, buildable in hackathon time.

## 1. Recommended Tech Stack

- **Python + Flask** — backend, ties all checks together into one app
- **HTML/CSS/JavaScript (hand-written)** — single-page frontend, form + report view
- **Python `requests` library** — calls external APIs (breach check) from Flask
- **Python `re` (regex)** — rule-based URL pattern checks, no ML needed
- **SQLite (optional)** — only if scan history nice-to-have gets built; skip otherwise

Why this stack: matches skills team already has (Python 7/10, HTML/CSS 7/10), avoids new frameworks under time pressure, no build tools/compilers needed — plain files, runs directly.

## 2. Frontend Architecture

One HTML page, two states shown/hidden with JavaScript (not separate pages — avoids page-reload complexity):

- **Form state**: URL input, email input, browser version field (dropdown or auto-filled from `navigator.userAgent`)
- **Report state**: score + per-check results, shown after form submits

JavaScript's job: collect form data, send it to Flask backend (`fetch()` call), receive JSON result, and update the page to show the report — no page reload needed.

Plain language: `fetch()` is JavaScript's way of "calling" your backend from the browser without refreshing the page. You send data, wait, get data back, then use JS to fill in the report section on the same page.

## 3. Backend Architecture

Single Flask app, single file to start (`app.py`), can split into modules once each check works:

- **One route** (e.g. `/check`) accepts form data (URL, email, browser version) as a POST request
- Route function calls three separate Python functions, one per check:
    - `check_url(url)` — regex rules + HTTPS/cert check
    - `check_email(email)` — calls breach API
    - `check_browser(version)` — compares against latest known version
- Each function returns a small result (status + reason), wrapped in `try/except` so one failing check doesn't crash the others
- All three results get combined into one score + one JSON response, sent back to frontend

Plain language: a "route" is just "when the frontend sends data to this address, run this Python function." One route is enough here — you don't need separate routes per check since the frontend submits everything together.

## 4. Database Choice

**None required for MVP.** Score, report, and check results are calculated and returned in the same request — nothing needs to be saved.

If scan history nice-to-have gets built: SQLite, since it's a single file, no server setup, built into Python already (`import sqlite3`). Not worth adding unless MVP is done early with time to spare.

## 5. Authentication Approach

**None.** No login, no accounts — matches "quick single tool" pitch and PRD's out-of-scope list. Skipping this entirely saves significant hackathon time and isn't needed for the core demo.

## 6. External APIs / Services

- **Have I Been Pwned API** (or similar free breach-check API) — for email breach checking. Free tier may need an API key; check their docs before demo day so you're not blocked last minute.
- No other external services needed — URL rules and browser version check are done with local logic, no external API required for those.

## 7. AI Model Integration

**Not required.** PRD explicitly rules out ML-based phishing detection for the hackathon — rule-based regex checks are enough and far faster to build/debug/explain in a demo or viva. Mentioning "future work: ML-based detection" in the pitch is fine, but don't build it.

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
Return JSON: {score, checks: [...]}
        ↓
JS receives JSON, updates page to show report
```

## 9. Folder Structure

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

Plain language: separating each check into its own file in `checks/` keeps `app.py` short and readable — each file does one job, easy to explain individually in a viva.

## 10. Major Components

1. **Frontend form + report UI** (HTML/CSS/JS)
2. **Flask route handler** (`app.py`) — receives requests, orchestrates checks
3. **URL check module** — regex rules + HTTPS/cert validation
4. **Email check module** — breach API integration
5. **Browser check module** — version comparison logic
6. **Score engine** — combines all check results into one score
7. **Report formatter** — structures combined JSON response for frontend display

## 11. Security Considerations

- Validate all inputs server-side (don't trust the frontend alone) — check URL format, email format before processing
- Don't log or store submitted emails/URLs beyond the request itself (matches PRD privacy requirement)
- Handle API errors without exposing raw error messages/stack traces to the user
- Use HTTPS if deploying publicly (not required for local demo)
- Keep any API keys (breach API) out of code — use environment variables, don't hardcode or push to GitHub

## 12. Deployment Architecture

**For hackathon demo: run locally.** `flask run` on the laptop, demo via `localhost`, no deployment needed.

If public deployment is wanted for judging/bonus points: a free tier host like Render or PythonAnywhere can run a small Flask app with minimal setup — optional, not required for core demo.

## 13. Simplifications for Hackathon

- No database — calculate everything per-request
- No login/auth — anonymous single-use tool
- No ML — regex/rule-based checks only
- No extension scanner — mentioned as future work only
- One Flask app, one route for all checks — not microservices
- Browser version: dropdown selection is an acceptable fallback if auto-detection via `navigator.userAgent` proves fiddly
- Single HTML page with JS show/hide — no multi-page routing needed
- Local demo only — public deployment is a stretch goal, not a requirement