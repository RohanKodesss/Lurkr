# BSR REST API Specification

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

// 502 — breach API unreachable (email check marked unavailable, NOT a full request failure)
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

## Endpoint 2: Health Check (optional, useful for demo/debugging)

**1. HTTP Method:** `GET`

**2. URL:** `/health`

**3. Purpose:** Confirm server is running — useful for quick demo-day sanity check before judges arrive.

**4. Authentication:** None

**5. Request Parameters:** None

**6. Request Body:** None

**7. Example Request:**

```
GET /health HTTP/1.1
```

**8. Example Success Response:**

```json
{ "status": "ok" }
```

**9. Possible Error Responses:** None expected — if server's down, request just won't reach it.

**10. HTTP Status Codes:**

|Code|Meaning|
|---|---|
|200|Server running|

---

Notes tying back to earlier docs:

- Single `/check` endpoint matches architecture's "one route, all checks together" decision — no need for `/check-url`, `/check-email` separately
- 200 status even with a partial "unavailable" check matches PRD requirement: one failing check shouldn't fail the whole scan
- No auth headers anywhere — consistent with no-login MVP scope