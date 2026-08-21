from config import DEDUCTIONS

def calculate_score(checks):
    """
    Calculates overall security score (0–100) based on check findings.
    Base score is 100. Deductions are subtracted per identified risk/warning.
    Unavailable/skipped checks incur no score penalty per graceful degradation requirements.
    """
    score = 100

    for check in checks:
        status = check.get("status")
        check_type = check.get("check_type")
        reason = check.get("reason", "").lower()

        if status == "pass" or status == "unavailable":
            continue

        if check_type == "url":
            if status == "risk":
                if "phishing" in reason or "ip address" in reason or "invalid or unparseable" in reason:
                    score -= DEDUCTIONS.get("url_phishing_pattern", 25)
                elif "ssl" in reason or "certificate" in reason:
                    score -= DEDUCTIONS.get("url_invalid_ssl", 20)
                elif "http" in reason:
                    score -= DEDUCTIONS.get("url_http_only", 15)
                else:
                    score -= 20
            elif status == "warning":
                score -= 15

        elif check_type == "email":
            if status in ("warning", "risk"):
                score -= DEDUCTIONS.get("email_breached", 25)

        elif check_type == "browser":
            if status in ("warning", "risk"):
                score -= DEDUCTIONS.get("browser_outdated", 15)

    # Ensure score stays bounded [0, 100]
    return max(0, min(100, score))
