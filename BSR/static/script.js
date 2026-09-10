document.addEventListener('DOMContentLoaded', () => {
    const formState = document.getElementById('formState');
    const loadingState = document.getElementById('loadingState');
    const reportState = document.getElementById('reportState');
    const checkForm = document.getElementById('checkForm');
    const errorBanner = document.getElementById('errorBanner');
    const errorMessage = document.getElementById('errorMessage');
    const rescanBtn = document.getElementById('rescanBtn');
    const detectBtn = document.getElementById('detectBtn');
    
    const urlInput = document.getElementById('urlInput');
    const emailInput = document.getElementById('emailInput');
    const browserInput = document.getElementById('browserInput');
    
    const scoreGauge = document.getElementById('scoreGauge');
    const scoreValue = document.getElementById('scoreValue');
    const scoreTitle = document.getElementById('scoreTitle');
    const scoreDescription = document.getElementById('scoreDescription');
    const checkResultsGrid = document.getElementById('checkResultsGrid');

    const viewCacheBtn = document.getElementById('viewCacheBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const cacheList = document.getElementById('cacheList');

    // Auto-detect browser user agent
    function autoDetectBrowser() {
        const ua = navigator.userAgent;
        let browserName = "Chrome";
        let version = "";

        if (ua.indexOf("Edg") > -1) {
            browserName = "Edge";
            version = ua.substring(ua.indexOf("Edg") + 4).split(" ")[0];
        } else if (ua.indexOf("Firefox") > -1) {
            browserName = "Firefox";
            version = ua.substring(ua.indexOf("Firefox") + 8).split(" ")[0];
        } else if (ua.indexOf("OPR") > -1 || ua.indexOf("Opera") > -1) {
            browserName = "Opera";
            version = ua.substring(ua.indexOf("OPR") + 4).split(" ")[0];
        } else if (ua.indexOf("Chrome") > -1) {
            browserName = "Chrome";
            version = ua.substring(ua.indexOf("Chrome") + 7).split(" ")[0];
        } else if (ua.indexOf("Safari") > -1) {
            browserName = "Safari";
            const verIdx = ua.indexOf("Version");
            if (verIdx > -1) {
                version = ua.substring(verIdx + 8).split(" ")[0];
            }
        }

        const majorVersion = version ? version.split('.')[0] : "128";
        browserInput.value = `${browserName} ${majorVersion}`;
    }

    // Run auto-detect on page load
    autoDetectBrowser();

    if (detectBtn) {
        detectBtn.addEventListener('click', autoDetectBrowser);
    }

    // Form Submit Event
    checkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlVal = urlInput.value.trim();
        const emailVal = emailInput.value.trim();
        const browserVal = browserInput.value.trim();

        if (!urlVal && !emailVal && !browserVal) {
            showError("At least one input field (URL, Email, or Browser) is required.");
            return;
        }

        hideError();
        showLoading();

        try {
            const response = await fetch('/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: urlVal,
                    email: emailVal,
                    browser_version: browserVal
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Check request failed');
            }

            renderReport(data);
        } catch (err) {
            showError(err.message || 'An unexpected error occurred. Please try again.');
            showForm();
        }
    });

    // Reset Form / Rescan Event
    if (rescanBtn) {
        rescanBtn.addEventListener('click', () => {
            showForm();
        });
    }

    // RAM Cache View/Toggle Event
    if (viewCacheBtn) {
        viewCacheBtn.addEventListener('click', fetchRecentScans);
    }

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearRecentScans);
    }

    async function fetchRecentScans() {
        try {
            const res = await fetch('/recent-scans');
            const data = await res.json();
            
            cacheList.innerHTML = '';

            if (!data.scans || data.scans.length === 0) {
                cacheList.innerHTML = '<p class="cache-desc">No scans in temporary RAM memory.</p>';
                clearCacheBtn.classList.add('hidden');
            } else {
                data.scans.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'cache-item';
                    el.innerHTML = `
                        <div class="cache-item-details">
                            <strong>URL: ${escapeHtml(item.url)} | Email: ${escapeHtml(item.email)}</strong>
                            <span class="cache-time">Score: ${item.overall_score}/100 &bull; ${escapeHtml(item.timestamp)}</span>
                        </div>
                    `;
                    cacheList.appendChild(el);
                });
                clearCacheBtn.classList.remove('hidden');
            }

            cacheList.classList.toggle('hidden');
            viewCacheBtn.textContent = cacheList.classList.contains('hidden') ? 'View RAM Cache' : 'Hide RAM Cache';
        } catch (err) {
            console.error("Could not fetch memory cache", err);
        }
    }

    async function clearRecentScans() {
        try {
            await fetch('/recent-scans', { method: 'DELETE' });
            fetchRecentScans();
        } catch (err) {
            console.error("Could not clear memory cache", err);
        }
    }

    // Render Report View
    function renderReport(data) {
        const score = data.overall_score !== undefined ? data.overall_score : 100;
        scoreValue.textContent = score;

        // Update Score Gauge Styling
        scoreGauge.classList.remove('score-pass', 'score-warning', 'score-risk');
        if (score >= 80) {
            scoreGauge.classList.add('score-pass');
            scoreTitle.textContent = "Excellent Security Rating";
            scoreDescription.textContent = "Minimal or no digital safety risks identified in this scan.";
        } else if (score >= 50) {
            scoreGauge.classList.add('score-warning');
            scoreTitle.textContent = "Moderate Safety Risks Detected";
            scoreDescription.textContent = "Certain check items require your attention and action.";
        } else {
            scoreGauge.classList.add('score-risk');
            scoreTitle.textContent = "High Risk Level Detected";
            scoreDescription.textContent = "Critical security issues identified. Follow recommendations below immediately.";
        }

        // Render Individual Checks Grid
        checkResultsGrid.innerHTML = '';

        if (data.checks && Array.isArray(data.checks)) {
            data.checks.forEach(check => {
                const card = createCheckCard(check);
                checkResultsGrid.appendChild(card);
            });
        }

        hideLoading();
        showReport();
    }

    function createCheckCard(check) {
        const card = document.createElement('div');
        const status = (check.status || 'unavailable').toLowerCase();
        card.className = `result-item border-${status}`;

        let icon = "🛡️";
        let checkTitleText = "Security Check";

        if (check.check_type === 'url') {
            icon = "🔗";
            checkTitleText = "URL Safety & HTTPS Check";
        } else if (check.check_type === 'email') {
            icon = "✉️";
            checkTitleText = "Email Breach Check";
        } else if (check.check_type === 'browser') {
            icon = "🌐";
            checkTitleText = "Browser Update Check";
        }

        let recommendationHtml = '';
        if (check.recommendation) {
            recommendationHtml = `
                <div class="recommendation-box">
                    <strong>Recommended Action:</strong> ${escapeHtml(check.recommendation)}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="result-header-row">
                <span class="check-title">${icon} ${checkTitleText}</span>
                <span class="status-badge badge-${status}">${status.toUpperCase()}</span>
            </div>
            <div class="check-reason">${escapeHtml(check.reason || 'Check complete')}</div>
            ${recommendationHtml}
        `;

        return card;
    }

    // Helper functions
    function showError(msg) {
        errorMessage.textContent = msg;
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    function showLoading() {
        formState.classList.add('hidden');
        reportState.classList.add('hidden');
        loadingState.classList.remove('hidden');
    }

    function hideLoading() {
        loadingState.classList.add('hidden');
    }

    function showForm() {
        reportState.classList.add('hidden');
        loadingState.classList.add('hidden');
        formState.classList.remove('hidden');
    }

    function showReport() {
        formState.classList.add('hidden');
        loadingState.classList.add('hidden');
        reportState.classList.remove('hidden');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }
});
