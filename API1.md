# Lurkr REST API Specification

## Endpoint 1: Run Security Check

**1. HTTP Method:** `POST`

**2. URL:** `/check`

**3. Purpose:** Accepts URL, email, and browser version; runs all three checks; returns combined score + individual results.

**4. Authentication:** None — no auth required, matches no-login MVP scope.

**5. Request Parameters:** None (all data in body, not query params).

**6. Request Body** (JSON):

```json
{
  "url": "http://fake-bank-login.com",
  "email": "test@example.com",
  "browser_version": "118.0"
}
```

Notes: all three fields optional individually — if one is empty, skip that check server-side (mark as skipped, not error, matches "independent failure handling" requirement). At least one field required to run the check.

**7. Example Request:**

```
POST /check HTTP/1.1
Content-Type: application/json

{
  "url": "http://fake-bank-login.com",
  "email": "test@example.com",
  "browser_version": "118.0"
}
```

**8. Example Success Response:**

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

**9. Possible Error Responses:**

```json
// 400 — bad input
{ "error": "Invalid request", "details": "url is not a valid URL format" }

// 400 — nothing submitted
{ "error": "Invalid request", "details": "at least one of url, email, browser_version required" }

// 200 with partial unavailable — breach API unreachable (email check marked unavailable, NOT a full request failure)
{
  "overall_score": 55,
  "checks": [
    { "check_type": "url", "status": "risk", "reason": "...", "recommendation": "..." },
    { "check_type": "email", "status": "unavailable", "reason": "Breach check service unreachable", "recommendation": null },
    { "check_type": "browser", "status": "pass", "reason": "...", "recommendation": null }
  ]
}

// 500 — unexpected server error
{ "error": "Internal server error" }
```

**10. HTTP Status Codes:**

|Code|Meaning|
|---|---|
|200|Success — report generated (even if one sub-check is "unavailable", overall response is still 200, per PRD's graceful-degradation requirement)|
|400|Bad request — invalid/missing input|
|500|Unexpected server error|

---

## Endpoint 2: Temporary History / RAM Cache

### 2a. Fetch Recent In-Memory Scans

**1. HTTP Method:** `GET`

**2. URL:** `/recent-scans`

**3. Purpose:** Retrieves recent security checks temporarily held in server RAM buffer (`collections.deque(maxlen=20)`).

**4. Example Request:**
```
GET /recent-scans HTTP/1.1
```

**5. Example Success Response (200 OK):**
```json
{
  "count": 1,
  "storage_type": "Temporary RAM Cache (Not stored permanently on disk)",
  "scans": [
    {
      "browser_version": "118.0",
      "checks": [ ... ],
      "email": "test@example.com",
      "overall_score": 62,
      "timestamp": "2026-09-14T19:30:00.000Z",
      "url": "http://fake-bank-login.com"
    }
  ]
}
```

### 2b. Flush Recent In-Memory Scans

**1. HTTP Method:** `DELETE`

**2. URL:** `/recent-scans`

**3. Purpose:** Clears all temporary in-memory scans currently cached in server RAM.

**4. Example Request:**
```
DELETE /recent-scans HTTP/1.1
```

**5. Example Success Response (200 OK):**
```json
{
  "message": "In-memory temporary cache cleared"
}
```

---

## Endpoint 3: Health Check

**1. HTTP Method:** `GET`

**2. URL:** `/health`

**3. Purpose:** Confirm server is running — useful for pre-demo sanity checks.

**4. Example Request:**
```
GET /health HTTP/1.1
```

**5. Example Success Response (200 OK):**
```json
{ "status": "ok" }
```

---

## Architecture Notes
- Single `/check` endpoint matches architecture's "one route, all checks together" decision — no separate routes required.
- 200 status even with a partial "unavailable" check matches PRD requirement: one failing check never fails the entire scan.
- Ephemeral in-memory history (`/recent-scans`) respects user privacy by avoiding forced disk persistence.