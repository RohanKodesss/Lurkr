Quick flag: architecture doc says no DB needed for MVP — this only applies if you're building the scan-history nice-to-have, or want schema ready for after hackathon. Assuming that's the case (scan history), here's the schema, kept minimal — matches PRD's "don't add for its own sake" spirit.

## 1-2. Tables & Columns

**scans**

|Column|Type|Notes|
|---|---|---|
|id|INTEGER|primary key|
|created_at|TEXT (ISO datetime)|when scan ran|
|url|TEXT|nullable, if URL check skipped|
|email|TEXT|nullable, if email check skipped|
|browser_version|TEXT|nullable|
|overall_score|INTEGER|0-100|

**check_results**

|Column|Type|Notes|
|---|---|---|
|id|INTEGER|primary key|
|scan_id|INTEGER|foreign key → scans.id|
|check_type|TEXT|'url' / 'email' / 'browser'|
|status|TEXT|'pass' / 'warning' / 'risk' / 'unavailable'|
|reason|TEXT|plain-language explanation|
|recommendation|TEXT|suggested fix|

## 3. Data Types

SQLite types used: `INTEGER`, `TEXT`. SQLite is loosely typed — fine for hackathon speed, no need for stricter types.

## 4. Primary Keys

- `scans.id`
- `check_results.id`

## 5. Foreign Keys

- `check_results.scan_id` → `scans.id`

## 6. Relationships

One scan → many check results (one-to-many). One scan produces 3 check_results rows (url/email/browser), matches "individual check results" requirement from PRD.

## 7. Required Fields

- `scans.created_at`, `scans.overall_score`
- `check_results.scan_id`, `check_results.check_type`, `check_results.status`

## 8. Optional Fields

- `scans.url`, `scans.email`, `scans.browser_version` — nullable since not all checks may run every time
- `check_results.reason`, `check_results.recommendation` — nullable for 'pass' status where no explanation needed

## 9. Indexes

- Index on `check_results.scan_id` — speeds up fetching all results for one scan (main query pattern)

## 10. Example Records

**scans**

|id|created_at|url|email|browser_version|overall_score|
|---|---|---|---|---|---|
|1|2026-08-20T10:00:00|http://fake-bank.com|test@example.com|118.0|62|

**check_results**

|id|scan_id|check_type|status|reason|recommendation|
|---|---|---|---|---|---|
|1|1|url|risk|Suspicious domain pattern detected|Avoid visiting this link|
|2|1|email|warning|Found in known breach|Change password, enable MFA|
|3|1|browser|pass|Browser up to date|None|

## 11. SQL Schema

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

## Why each table exists

- **scans** — one row per user run, holds inputs + final score, top-level record
- **check_results** — one row per individual check (url/email/browser) within a scan, keeps per-check detail without repeating scan-level data three times — matches PRD's "individual check results" requirement cleanly

Reminder: skip this entirely if scan history doesn't make it into your build — MVP works fully without any database, per architecture doc.