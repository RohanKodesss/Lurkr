import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "bsr.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with open(SCHEMA_PATH, 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()

def save_scan(url, email, browser_version, overall_score, check_results):
    """
    Saves scan metadata and check results into SQLite.
    Fails silently on DB error so main application flow is never disrupted.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        created_at = datetime.now(timezone.utc).isoformat()

        cursor.execute(
            "INSERT INTO scans (created_at, url, email, browser_version, overall_score) VALUES (?, ?, ?, ?, ?)",
            (created_at, url, email, browser_version, overall_score)
        )
        scan_id = cursor.lastrowid

        for result in check_results:
            cursor.execute(
                "INSERT INTO check_results (scan_id, check_type, status, reason, recommendation) VALUES (?, ?, ?, ?, ?)",
                (scan_id, result.get("check_type"), result.get("status"), result.get("reason"), result.get("recommendation"))
            )

        conn.commit()
        conn.close()
        return scan_id
    except Exception as e:
        print(f"[DB Warning] Could not record scan history: {e}")
        return None
