# Lurkr — Complete Project Study Note

---

## 🎯 1. Project Overview & Pitch

### What is Lurkr?
Lurkr is a 3-in-1 digital safety scanner built for non-technical everyday users. 

### What problem does it solve?
Usually, everyday users must visit 3 or 4 separate websites to check their digital safety—one for email breach checks, one for URL safety scans, and another for browser updates. Because of this friction and complex technical jargon, most people skip security checks entirely.

Lurkr replaces 4 separate tools with **one single web app** that runs all checks together in under 3 seconds and produces one combined score with simple recommendations.

---

## 🔍 2. Sector-by-Sector Technical Explanation

### A. URL Phishing & HTTPS Checker (`url_check.py`)
- **Purpose**: Evaluates a web link (e.g. `http://fake-bank-login.com`) to determine if it is a dangerous phishing attempt or unencrypted link.
- **How it detects risks step-by-step**:
  1. **Pattern & Keyword Check**: Scans domain text for common phishing words used by scammers (e.g. `paypa1`, `g00gle`, `fake-bank`, `login-verify`, `secure-update`).
  2. **Raw IP Address Check**: Legitimate companies use domain names (e.g. `google.com`). Scammers often use raw IP addresses (e.g. `http://192.168.1.1/login`). The code flags raw IPs as high risk.
  3. **Subdomain Obfuscation Check**: Detects misleading domain tricks like `paypal.com.scam-site.com` or `@` symbols used to hide destination addresses.
  4. **HTTPS Encryption & SSL Certificate Check**:
     - Sends a 2-second background check to verify if the site uses secure `https://` (encrypted) vs unencrypted `http://` (readable by hackers).
     - Checks if the website's SSL Security Certificate is valid, expired, or self-signed.

---

### B. Email Data Breach Checker (`email_check.py`)
- **Purpose**: Checks if a user's email address has been exposed in past company data leaks.
- **Does Lurkr hack anyone?**: **No!** Lurkr does not hack anything. It queries public breach databases (such as *XposedOrNot* or *Have I Been Pwned*).
- **How it accesses the API step-by-step**:
  1. When a user enters `test@example.com`, Lurkr sends an HTTP `GET` request to `https://api.xposedornot.com/v1/check-email/test@example.com`.
  2. The external API database searches its records of major company hacks (like LinkedIn, Adobe, Canva, Dropbox).
  3. The API returns a JSON response containing breach names and exposed data types.
  4. Lurkr formats this into simple advice: *"Found in 3 breaches: Adobe, LinkedIn, Canva. Change your password!"*
  5. **Graceful Fallback**: If the internet connection drops or the API is unreachable, Lurkr catches the network exception cleanly and marks the check as `"unavailable"` without crashing the server.

---

### C. Browser Version Checker (`browser_check.py`)
- **Purpose**: Verifies if the user's web browser (Chrome, Firefox, Edge, Safari, Opera) is updated to a safe version.
- **How it works step-by-step**:
  1. **Auto-Detection**: JavaScript reads the browser's user-agent header (`navigator.userAgent`) to detect browser name and version.
  2. **Benchmark Comparison**: Python compares the user's version number against safe reference versions stored in `config.py` (e.g. Chrome 128+, Firefox 129+).
  3. **Result**: If the version is outdated, Lurkr warns the user to update to prevent hackers from exploiting known browser bugs.

---

### D. Temporary Backend In-Memory Store (`database/memory_store.py`)
- **Purpose**: Temporarily holds recent searched emails, URLs, and scores in **server RAM (In-Memory)** without persisting them permanently to disk.
- **How it works**:
  - Uses Python's `collections.deque(maxlen=20)` to maintain a bounded queue in RAM.
  - When a user submits a check, `add_to_memory_cache()` stores the scan record in memory.
  - Endpoint `GET /recent-scans` allows users/graders to view recent RAM-cached items.
  - Endpoint `DELETE /recent-scans` allows clearing the memory buffer.
  - **Privacy Compliance**: When the Flask server stops or restarts, the RAM memory buffer is automatically cleared completely from memory.

---

### E. Scoring Engine (`score_engine.py`)
- **Purpose**: Aggregates all check findings into a single safety score from **0 to 100**.
- **Deduction Formula**:
  - Base Score: **100 points**
  - Phishing URL pattern detected: **-25 points**
  - Invalid SSL / Security Certificate: **-20 points**
  - Unencrypted HTTP link: **-15 points**
  - Email found in data breach: **-25 points**
  - Outdated browser version: **-15 points**
  - Skipped / Unavailable check: **0 points deducted** (no penalty for API failure).

---

## 🔄 3. Complete Program Execution Workflow

```text
[Step 1: User Fills Form]
User enters URL + Email address in the single-page interface.
         ↓
[Step 2: Client-Side JS Action]
script.js collects inputs, auto-detects browser version, and calls POST /check.
         ↓
[Step 3: Flask Backend Processing]
app.py passes inputs to 3 independent Python modules:
  ├─► url_check.py     (Scans URL patterns & tests HTTPS certificate)
  ├─► email_check.py   (Queries external breach database API)
  └─► browser_check.py (Compares version against safe benchmark)
         ↓
[Step 4: Score Aggregation & In-Memory RAM Caching]
1. score_engine.py calculates overall score (0–100).
2. database/memory_store.py saves scan record into server RAM (deque).
         ↓
[Step 5: Server JSON Response]
Flask sends back 1 JSON packet to browser:
{ "overall_score": 62, "checks": [...] }
         ↓
[Step 6: UI Rendering]
script.js renders:
  1. Color-coded Score Gauge (Green = Safe, Yellow = Warning, Red = Risk).
  2. 3 Individual Check Cards (Status Badges: PASS, WARNING, RISK).
  3. Clear, plain-language action advice (e.g. "Change password and enable MFA").
  4. RAM Cache Drawer allowing users to view/clear temporary memory.
```

---

## ❓ 4. Frequently Asked Questions for Project Review

1. **"Why use Flask and plain HTML/CSS/JS?"**
   - Light-weight, easy to explain, fast to execute, and avoids heavy frontend build chains.

2. **"How are searches stored temporarily in the backend?"**
   - We implemented an in-memory RAM cache using Python's `collections.deque(maxlen=20)` in `database/memory_store.py`. It holds recent scan records temporarily in RAM and is accessible via `GET /recent-scans`. Because it is stored in RAM rather than a permanent database table, restarting the server or clicking "Clear Memory" instantly purges all records.

3. **"What if the breach API goes down during live demo?"**
   - The app uses a 3-second network timeout. If the API fails, `email_check.py` catches the error and marks status as `'unavailable'`. The app returns HTTP 200 without crashing.
