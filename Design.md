# Lurkr — UI Redesign Spec

Instructions for AI agent: redesign existing Lurkr (BSR) frontend to match this spec. Reference inspiration: uploaded "GuardianAI" mobile UI (shield hero, stat cards, scan-result screen). Adapt structure, replace branding.

## 1. Brand tokens (non-negotiable)
- Background: pure black `#000000`
- Accent: mint-green `#2ee6a6` (glow/gradient allowed, e.g. `#2ee6a6 → #1fae82`)
- Logo: eye/radar icon, mint-green on black
- Tagline: "See the threat before it sees you"
- Danger/critical: red `#e63946`
- Warning: amber `#f4a300`
- Safe/solved: mint-green (reuse accent)
- Font: clean sans-serif (Inter/Poppins), bold weights for headers, tactical/radar visual motif (scan lines, dotted grid, pulse rings) instead of purple gradients seen in reference

## 2. Screens to build

### 2a. Landing / Hero (replaces reference screen 1)
- Full-bleed black background
- Center: pulsing radar-ring shield/eye icon (mint glow)
- Headline: "Lurkr Protection from Phishing & Browser Threats"
- Subtext: 1-2 lines, plain language, no guarantees ("assessment" wording only)
- Primary CTA button: mint-green fill, black text, pill shape — "Get Started"

### 2b. Dashboard (replaces reference screen 2)
- Top bar: user/greeting placeholder + "Protection Active" pill (mint outline, small pulse dot)
- Stat card: "Links Scanned Today" — big number + small radial/gauge indicator (mint→amber→red)
- Three small stat chips in a row: Critical / High / Medium counts, each colored per severity, NOT purple/pink like reference
- Summary list: Daily Scanned, Weekly Scanned, Email Breach Checks, Extension Risk Scans — rows with icon + label + count
- Bottom nav (mobile) / left sidebar (desktop): Home, Scan, History, Settings

### 2c. Scan Result (replaces reference screen 3)
- Header: back arrow + "Check Links, Avoid Risks"
- Scan input: search bar, placeholder "Paste a URL to scan"
- Result card: severity icon + verdict (Safe / Suspicious / Malicious)
- Bullet list of reasons (why flagged) — this is mandatory, BSR always explains the "why"
- Primary action button: mint-green (safe) or red (block/warn) depending on verdict — never pink

## 3. Layout rules — Mobile
- Single column, max-width matches phone frame
- Bottom tab nav, 4 icons max
- Cards stack vertically, 16px gutter
- Touch targets ≥44px

## 4. Layout rules — Desktop / PC
- Left sidebar nav (persistent), 220px wide, icons + labels
- Main content area: 2-column grid for dashboard (stat cards left 60%, activity feed right 40%)
- Scan screen: centered card, max-width 640px, input + result stacked
- Hero/landing: split layout — left text + CTA, right animated radar/shield graphic
- Min supported width: 1280px design frame

## 5. Explicit deltas from reference screenshot
- Replace all purple/pink gradients → mint-green on black
- Replace generic "ai" shield glyph → Lurkr eye/radar logo
- Keep: card-based stat layout, gauge/ring indicator, bottom nav pattern, scan-input + result-card pattern
- Add: reasoning bullet list on every scan result (reference lacks explanation depth BSR requires)
- Add: severity color system must map to BSR's real categories (Critical/High/Medium/Safe), not decorative colors

## 6. Agent task order
1. Set up design tokens (colors, spacing, font) in CSS/theme file
2. Build landing hero (mobile first, then desktop breakpoint)
3. Build dashboard screen (mobile, then desktop)
4. Build scan-result screen (mobile, then desktop)
5. Wire nav between screens
6. Do NOT touch backend/Flask logic — frontend/UI only
