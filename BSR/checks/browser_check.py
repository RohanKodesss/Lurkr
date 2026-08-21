import re
from config import STABLE_BROWSER_VERSIONS

def check_browser(version_input, user_agent=None):
    """
    Evaluates browser version against known stable benchmarks.
    Accepts explicit version_input (e.g. "118.0" or "Chrome 118") or attempts parsing from user_agent string.
    Returns dict formatted per API spec.
    """
    if not version_input and not user_agent:
        return {
            "check_type": "browser",
            "status": "unavailable",
            "reason": "Browser version was not provided",
            "recommendation": "Select or auto-detect your browser version to perform this check"
        }

    browser_name = "chrome"
    major_version = None

    input_str = str(version_input).strip() if version_input else ""

    # Check if input includes browser name (e.g. "Firefox 115" or "Chrome 128")
    for name in STABLE_BROWSER_VERSIONS.keys():
        if name in input_str.lower():
            browser_name = name
            break

    # Extract numeric version
    version_match = re.search(r'(\d+)(?:\.\d+)*', input_str)
    if version_match:
        major_version = int(version_match.group(1))
    elif user_agent:
        # Fallback to User-Agent string parsing
        ua = user_agent.lower()
        if "edg/" in ua or "edge/" in ua:
            browser_name = "edge"
            match = re.search(r'(?:edg|edge)/(\d+)', ua)
            if match: major_version = int(match.group(1))
        elif "firefox/" in ua:
            browser_name = "firefox"
            match = re.search(r'firefox/(\d+)', ua)
            if match: major_version = int(match.group(1))
        elif "opr/" in ua or "opera/" in ua:
            browser_name = "opera"
            match = re.search(r'(?:opr|opera)/(\d+)', ua)
            if match: major_version = int(match.group(1))
        elif "chrome/" in ua:
            browser_name = "chrome"
            match = re.search(r'chrome/(\d+)', ua)
            if match: major_version = int(match.group(1))
        elif "safari/" in ua and "version/" in ua:
            browser_name = "safari"
            match = re.search(r'version/(\d+)', ua)
            if match: major_version = int(match.group(1))

    if major_version is None:
        return {
            "check_type": "browser",
            "status": "unavailable",
            "reason": "Could not determine valid numeric browser version",
            "recommendation": "Specify a valid browser version number (e.g. 128)"
        }

    target_stable = STABLE_BROWSER_VERSIONS.get(browser_name, 128)

    if major_version >= target_stable:
        return {
            "check_type": "browser",
            "status": "pass",
            "reason": f"{browser_name.capitalize()} is up to date (version {major_version})",
            "recommendation": None
        }
    else:
        return {
            "check_type": "browser",
            "status": "warning",
            "reason": f"{browser_name.capitalize()} version {major_version} is outdated. Minimum safe version is {target_stable}.",
            "recommendation": f"Update {browser_name.capitalize()} to version {target_stable} or higher to protect against known exploits."
        }
