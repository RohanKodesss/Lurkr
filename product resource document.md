# Product Requirements Document — BSR (Browser Security Report)

## 1. Product Name

BSR — Browser Security Report

## 2. One-Line Product Description

A single tool that checks your browser version, a URL, and an email address for security risks — replacing the need to visit multiple separate sites.

## 3. Problem Statement

Everyday users must visit multiple separate tools to check their digital safety — one site for breach checks, one for URL scans, one for browser update status. No single package runs all checks together. As a result, users either skip checks entirely (too much friction) or miss checks they don't know exist.

## 4. Target Users

Non-technical, everyday browser users — not security professionals. People who would rather run one check than hunt across four different websites.

## 5. User Pain Points

- Must know 4+ separate tools exist and where to find them
- Switching between sites creates friction; most people skip checks entirely
- Each tool uses its own technical language, with no unified explanation
- No single combined risk picture — just scattered raw data across browser tabs
- No existing tool bundles browser + URL + email checks into one flow

## 6. Proposed Solution

A single web app (one interface, one Flask backend) that runs all checks together — browser version, URL phishing signals, and email breach status — and returns one combined report with a score, flags, and fixes. Core pitch: replace 4 tools with 1.

## 7. Product Goals

- Let a non-technical user complete a full safety check in under 2 minutes
- Present findings in plain language, not raw technical output
- Demonstrate a working, integrated MVP within the hackathon timeframe
- Make the "single package" value proposition obvious in the demo

## 8. User Stories

- As a user, I want to enter a URL and see if it looks like phishing, so I can decide whether to click it.
- As a user, I want to enter my email and see if it's been in a data breach, so I know if I should change my password.
- As a user, I want to see my browser version checked automatically, so I know if I need to update.
- As a user, I want one combined score and report, so I don't have to interpret three separate results myself.
- As a user, I want plain-language recommendations, so I know what action to take next.

## 9. Functional Requirements

- System shall accept a URL as text input and evaluate it against phishing-indicator rules (misspelled domains, misleading subdomains, suspicious redirects).
- System shall check whether the URL uses HTTPS and flag HTTP-only or invalid/expired certificate cases as part of the URL check.
- System shall accept an email address and query a breach-checking API (e.g. Have I Been Pwned) for exposure status.
- System shall detect or accept the user's browser version and compare it against the latest known stable version.
- System shall combine all three check results into a single score (e.g. out of 100) with deductions per risk found.
- System shall display a report listing each check, its result, and a plain-language explanation/fix.
- Report shall display the status, findings, and recommended action for each individual check separately, in addition to the overall score.
- If one check fails or is unavailable, the remaining checks shall still complete, and the report shall clearly mark the unavailable check rather than failing the entire scan.
- System shall handle API failures or missing data gracefully (e.g. "breach check unavailable" instead of crashing).

## 10. Non-Functional Requirements

- Usability: no security knowledge required to understand the report
- Performance: full check (all 3) should complete and display within ~5–10 seconds
- Privacy: email/URL inputs are not stored beyond the current session unless the user opts in
- Reliability: app should not crash on invalid input (bad URL format, empty email, etc.)
- Scope discipline: single Flask app — no separate services per check

## 11. Core Features (Must-Have)

- Single-page input: URL field + email field + browser version (auto or dropdown)
- Backend logic for all checks, called together on one submit
- URL check includes both phishing-pattern rules and HTTPS/certificate validity
- Combined report screen: one score, all flags, one place
- Individual check results: report displays status, findings, and recommendation for each check separately (not just the overall score)
- Actionable recommendations: each flagged risk includes a clear, specific recommended action (e.g. "change password and enable MFA"), not just a generic warning
- Independent module failure handling: if one check fails, others still complete and the report marks the failed check clearly

## 12. Nice-to-Have Features

- Extension permission scanner folded into the same package
- Save/rescan history within the app
- Browser-extension popup form factor for the whole tool

## 13. User Journeys

**Primary journey:**

1. User lands on BSR homepage
2. User pastes a URL, enters their email, browser is auto-detected
3. User clicks "Run Security Check"
4. Backend runs all 3 checks in one request
5. User sees one report: overall score, list of flags (if any), plain-language fix for each
6. User acts on recommendations (e.g. changes password, updates browser)

## 14. MVP Scope

- One Flask app, one page, one form
- URL rule-based phishing check (no ML) + HTTPS/certificate validity check
- Email breach check via free API
- Browser version check (manual dropdown acceptable if auto-detection is too slow to build)
- One combined score + report output

## 15. Out-of-Scope Features (for Hackathon)

- Custom ML-based phishing detection model
- Self-built breach database
- User accounts / login system
- Extension permission scanner (full implementation)
- Historical trend tracking across multiple scans
- Native mobile app
- Production-grade security hardening (rate limiting, full auth)