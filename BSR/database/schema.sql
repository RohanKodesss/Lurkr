CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    url TEXT,
    email TEXT,
    browser_version TEXT,
    overall_score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS check_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL,
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT,
    recommendation TEXT,
    FOREIGN KEY (scan_id) REFERENCES scans(id)
);

CREATE INDEX IF NOT EXISTS idx_check_results_scan_id ON check_results(scan_id);
