from collections import deque
from datetime import datetime, timezone

# Bounded in-memory store (RAM only - max 20 recent scans)
# Automatically discarded when server stops/restarts, complying with privacy requirements.
MEMORY_CACHE = deque(maxlen=20)

def add_to_memory_cache(url, email, browser_version, overall_score, checks):
    """Stores scan metadata temporarily in server RAM."""
    entry = {
        "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S %d-%b-%Y"),
        "url": url if url else "Not Provided",
        "email": email if email else "Not Provided",
        "browser_version": browser_version if browser_version else "Not Provided",
        "overall_score": overall_score,
        "check_count": len(checks)
    }
    MEMORY_CACHE.appendleft(entry)

def get_memory_cache():
    """Returns list of temporarily stored in-memory scans."""
    return list(MEMORY_CACHE)

def clear_memory_cache():
    """Clears all in-memory temporary scans."""
    MEMORY_CACHE.clear()
