document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // DOM ELEMENT REFERENCES
    // ------------------------------------------------------------------
    const views = {
        hero: document.getElementById('heroView'),
        features: document.getElementById('featuresView'),
        about: document.getElementById('aboutView'),
        contact: document.getElementById('contactView'),
        dashboard: document.getElementById('dashboardView'),
        scan: document.getElementById('scanView'),
        history: document.getElementById('historyView')
    };

    const navItems = document.querySelectorAll('.top-pill-nav .nav-item, .bottom-nav .bottom-nav-item');
    
    // Scanner Form & Views
    const formState = document.getElementById('formState');
    const loadingState = document.getElementById('loadingState');
    const reportState = document.getElementById('reportState');
    const checkForm = document.getElementById('checkForm');
    const errorBanner = document.getElementById('errorBanner');
    const errorMessage = document.getElementById('errorMessage');
    
    // Inputs & Action Buttons
    const urlInput = document.getElementById('urlInput');
    const emailInput = document.getElementById('emailInput');
    const browserInput = document.getElementById('browserInput');
    const detectBtn = document.getElementById('detectBtn');
    const rescanBtn = document.getElementById('rescanBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const heroDemoBtn = document.getElementById('heroDemoBtn');
    const backToDashBtn = document.getElementById('backToDashBtn');

    // Verdict & Verdict Elements
    const verdictBanner = document.getElementById('verdictBanner');
    const verdictTitle = document.getElementById('verdictTitle');
    const verdictIcon = document.getElementById('verdictIcon');
    const scoreValue = document.getElementById('scoreValue');
    const reasonsList = document.getElementById('reasonsList');
    const checkResultsGrid = document.getElementById('checkResultsGrid');

    // Dashboard Analytics Elements
    const dashScansCount = document.getElementById('dashScansCount');
    const chipCriticalCount = document.getElementById('chipCriticalCount');
    const chipWarningCount = document.getElementById('chipWarningCount');
    const chipSafeCount = document.getElementById('chipSafeCount');
    const gaugeProgress = document.getElementById('gaugeProgress');

    // History RAM Elements
    const cacheList = document.getElementById('cacheList');
    const refreshCacheBtn = document.getElementById('refreshCacheBtn');
    const clearCacheBtn = document.getElementById('clearCacheBtn');

    // Session Analytics Tracker
    let sessionStats = {
        totalScans: 0,
        critical: 0,
        warning: 0,
        safe: 0
    };

    // ------------------------------------------------------------------
    // NAVIGATION & VIEW SWITCHER
    // ------------------------------------------------------------------
    function showView(viewName) {
        if (!views[viewName]) return;

        // Hide all views
        Object.keys(views).forEach(key => {
            if (views[key]) views[key].classList.add('hidden');
        });

        // Show target view
        views[viewName].classList.remove('hidden');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(views[viewName], 
                { opacity: 0, y: 16 }, 
                { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
            );
        }

        // Sync Nav active states
        navItems.forEach(item => {
            const target = item.getAttribute('data-view');
            if (target === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Trigger view-specific data refresh
        if (viewName === 'history') {
            fetchRecentScans();
        } else if (viewName === 'dashboard') {
            updateDashboardStats();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach click events to nav links
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = item.getAttribute('data-view');
            showView(targetView);
        });
    });

    // Hero Action Buttons
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            showView('scan');
            resetScanForm();
        });
    }

    if (heroDemoBtn) {
        heroDemoBtn.addEventListener('click', () => {
            showView('dashboard');
        });
    }

    if (backToDashBtn) {
        backToDashBtn.addEventListener('click', () => {
            showView('dashboard');
        });
    }

    // ------------------------------------------------------------------
    // BROWSER AUTO-DETECTION
    // ------------------------------------------------------------------
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

    autoDetectBrowser();

    if (detectBtn) {
        detectBtn.addEventListener('click', autoDetectBrowser);
    }

    // ------------------------------------------------------------------
    // SCAN SUBMISSION & PROCESSOR
    // ------------------------------------------------------------------
    checkForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const urlVal = urlInput.value.trim();
        const emailVal = emailInput.value.trim();
        const browserVal = browserInput.value.trim();

        if (!urlVal && !emailVal && !browserVal) {
            showError("Please enter at least one target parameter (URL, Email, or Browser version).");
            return;
        }

        hideError();
        showScanLoading();

        try {
            const response = await fetch('/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlVal,
                    email: emailVal,
                    browser_version: browserVal
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Scan execution failed');
            }

            renderReport(data);
        } catch (err) {
            showError(err.message || 'An unexpected error occurred. Please try again.');
            showScanForm();
        }
    });

    if (rescanBtn) {
        rescanBtn.addEventListener('click', () => {
            resetScanForm();
        });
    }

    function resetScanForm() {
        hideError();
        urlInput.value = '';
        emailInput.value = '';
        autoDetectBrowser();
        showScanForm();
    }

    // ------------------------------------------------------------------
    // REPORT RENDERER & MANDATORY REASONING BULLET LIST
    // ------------------------------------------------------------------
    function renderReport(data) {
        const score = data.overall_score !== undefined ? data.overall_score : 100;
        scoreValue.textContent = score;

        // Determine Verdict & Styling
        verdictBanner.classList.remove('verdict-safe', 'verdict-warning', 'verdict-risk');
        let verdictClass = 'verdict-safe';
        let verdictText = 'SAFE';
        let verdictEmoji = '🛡️';

        if (score >= 80) {
            verdictClass = 'verdict-safe';
            verdictText = 'SAFE';
            verdictEmoji = '🛡️';
            sessionStats.safe++;
        } else if (score >= 50) {
            verdictClass = 'verdict-warning';
            verdictText = 'SUSPICIOUS';
            verdictEmoji = '⚠️';
            sessionStats.warning++;
        } else {
            verdictClass = 'verdict-risk';
            verdictText = 'MALICIOUS / CRITICAL';
            verdictEmoji = '🚨';
            sessionStats.critical++;
        }

        sessionStats.totalScans++;

        verdictBanner.classList.add(verdictClass);
        verdictTitle.textContent = verdictText;
        verdictIcon.textContent = verdictEmoji;

        // Render MANDATORY Reasoning Bullet List
        reasonsList.innerHTML = '';
        let findingsList = [];

        if (data.checks && Array.isArray(data.checks)) {
            data.checks.forEach(check => {
                if (check.reason) {
                    findingsList.push(`${check.check_type.toUpperCase()}: ${check.reason}`);
                }
            });
        }

        if (findingsList.length === 0) {
            findingsList.push("All security parameters passed baseline checks cleanly.");
        }

        findingsList.forEach(reasonText => {
            const li = document.createElement('li');
            li.textContent = reasonText;
            reasonsList.appendChild(li);
        });

        // Render Individual Detailed Cards
        checkResultsGrid.innerHTML = '';
        if (data.checks && Array.isArray(data.checks)) {
            data.checks.forEach(check => {
                const card = createCheckCard(check);
                checkResultsGrid.appendChild(card);
            });
        }

        updateDashboardStats();
        hideScanLoading();
        showScanReport();
    }

    function createCheckCard(check) {
        const card = document.createElement('div');
        const status = (check.status || 'unavailable').toLowerCase();
        card.className = `result-item border-${status}`;

        let icon = "🛡️";
        let checkTitleText = "Security Check";

        if (check.check_type === 'url') {
            icon = "🔗";
            checkTitleText = "URL Safety & SSL Check";
        } else if (check.check_type === 'email') {
            icon = "✉️";
            checkTitleText = "Email Breach Registry";
        } else if (check.check_type === 'browser') {
            icon = "🌐";
            checkTitleText = "Browser Update Status";
        }

        let recommendationHtml = '';
        if (check.recommendation) {
            recommendationHtml = `
                <div class="recommendation-box">
                    <strong>Action Required:</strong> ${escapeHtml(check.recommendation)}
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

    // ------------------------------------------------------------------
    // DASHBOARD STATS UPDATER
    // ------------------------------------------------------------------
    function updateDashboardStats() {
        if (dashScansCount) dashScansCount.textContent = sessionStats.totalScans;
        if (chipCriticalCount) chipCriticalCount.textContent = sessionStats.critical;
        if (chipWarningCount) chipWarningCount.textContent = sessionStats.warning;
        if (chipSafeCount) chipSafeCount.textContent = sessionStats.safe;

        if (gaugeProgress) {
            // Calculate circumference stroke dash offset
            const maxOffset = 251.2; // 2 * PI * r (r=40)
            const count = Math.min(sessionStats.totalScans, 20);
            const offset = maxOffset - (count / 20) * maxOffset;
            gaugeProgress.style.strokeDashoffset = offset;
        }
    }

    // ------------------------------------------------------------------
    // HISTORY / RAM CACHE MANAGER
    // ------------------------------------------------------------------
    if (refreshCacheBtn) {
        refreshCacheBtn.addEventListener('click', fetchRecentScans);
    }

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearRecentScans);
    }

    async function fetchRecentScans() {
        if (!cacheList) return;
        try {
            const res = await fetch('/recent-scans');
            const data = await res.json();

            cacheList.innerHTML = '';

            if (!data.scans || data.scans.length === 0) {
                cacheList.innerHTML = '<p class="cache-subtext">No scans in temporary RAM memory.</p>';
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
            }
        } catch (err) {
            console.error("Failed to fetch memory cache", err);
        }
    }

    async function clearRecentScans() {
        try {
            await fetch('/recent-scans', { method: 'DELETE' });
            fetchRecentScans();
        } catch (err) {
            console.error("Failed to clear memory cache", err);
        }
    }

    // ------------------------------------------------------------------
    // HELPER FUNCTIONS
    // ------------------------------------------------------------------
    function showError(msg) {
        errorMessage.textContent = msg;
        errorBanner.classList.remove('hidden');
    }

    function hideError() {
        errorBanner.classList.add('hidden');
    }

    function showScanForm() {
        reportState.classList.add('hidden');
        loadingState.classList.add('hidden');
        formState.classList.remove('hidden');
    }

    function showScanLoading() {
        formState.classList.add('hidden');
        reportState.classList.add('hidden');
        loadingState.classList.remove('hidden');
    }

    function hideScanLoading() {
        loadingState.classList.add('hidden');
    }

    function showScanReport() {
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

    // ------------------------------------------------------------------
    // HERO QUICK SCAN HANDLER
    // ------------------------------------------------------------------
    const heroQuickScanForm = document.getElementById('heroQuickScanForm');
    const heroQuickInput = document.getElementById('heroQuickInput');

    if (heroQuickScanForm && heroQuickInput) {
        heroQuickScanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = heroQuickInput.value.trim();
            if (!val) {
                showView('scan');
                return;
            }

            if (val.includes('@')) {
                emailInput.value = val;
                urlInput.value = '';
            } else {
                urlInput.value = val;
                emailInput.value = '';
            }

            showView('scan');
            checkForm.dispatchEvent(new Event('submit'));
        });
    }

    // ------------------------------------------------------------------
    // THREE.JS 3D CANVAS & GSAP ANIMATION ENGINE
    // ------------------------------------------------------------------
    function initThreeJSBackground() {
        const canvas = document.getElementById('hero3dCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;

        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 3D Wireframe Node Ring (TorusKnot)
        const geometry = new THREE.TorusKnotGeometry(12, 3, 120, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x7FB2FF,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const torusNode = new THREE.Mesh(geometry, material);
        scene.add(torusNode);

        // Secondary Inner Wireframe Mesh
        const innerGeo = new THREE.IcosahedronGeometry(6, 2);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x6EE7B7,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });
        const innerNode = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerNode);

        // Full-Screen Particle Swarm Cloud (1,500 particles)
        const particleCount = 1500;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 140;
            positions[i + 1] = (Math.random() - 0.5) * 140;
            positions[i + 2] = (Math.random() - 0.5) * 140;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x7FB2FF,
            size: 1.3,
            transparent: true,
            opacity: 0.55
        });
        const particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);

        // Mouse Parallax Effect
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Animation Render Loop
        function animate() {
            requestAnimationFrame(animate);

            torusNode.rotation.x += 0.002;
            torusNode.rotation.y += 0.004;
            innerNode.rotation.x -= 0.003;
            innerNode.rotation.y -= 0.003;
            particleSystem.rotation.y += 0.0008;

            camera.position.x += (mouseX * 5 - camera.position.x) * 0.04;
            camera.position.y += (-mouseY * 5 - camera.position.y) * 0.04;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        animate();

        // Responsive Resize Handler (Window Full Screen)
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') return;

        // Header & Hero Timeline Entrance
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.top-pill-nav', { y: -40, opacity: 0, duration: 0.8 })
          .from('.hero-header-box .badge', { y: 15, opacity: 0, duration: 0.5 }, '-=0.4')
          .from('.hero-title', { y: 20, opacity: 0, duration: 0.7 }, '-=0.3')
          .from('.hero-subtext', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
          .from('.hero-quick-scan', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
          .from('.hero-trust-bar', { opacity: 0, duration: 0.5 }, '-=0.3')
          .from('.node-card', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.2')
          .from('.metric-card-floating', { y: 30, opacity: 0, duration: 0.7, stagger: 0.12 }, '-=0.3');

        // Magnetic 3D Tilt Effect on Cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(card, {
                    rotationY: (x / rect.width) * 10,
                    rotationX: (-y / rect.height) * 10,
                    transformPerspective: 1000,
                    duration: 0.3,
                    ease: 'power1.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }

    // Initialize 3D Visuals and GSAP Animations
    initThreeJSBackground();
    initGSAPAnimations();
});
