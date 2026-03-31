# Kalakar.in Design Document

Kalakar.in is a cinematic professional networking platform designed as a "Mobile-First Entertainment OS". It connects talent (actors, crew, writers) with studios and recruiters through a high-performance, visually immersive interface.

## 1. Visual Identity & Brand Language
The design system is built to evoke a "cinematic" feel, using deep charcoal backgrounds and premium gold accents.

### Color Palette
*   **Primary Background (`--bg`):** `#121212` (Deep Cinematic Charcoal)
*   **Surface Elevation (`--surface`):** `#141414` (Elevated Matte)
*   **Accent Color (`--brand-gold`):** `#C5A059` (Metallic Gold)
*   **Success State (`--success`):** `#34D399` (Emerald Green)
*   **Typography Tone (`--text-secondary`):** `#A1A1AA` (Softer muted white)

### Typography
*   **Headings:** Yatra One (Devanagari-inspired serif for brand presence)
*   **Body & Logic:** Inter (Sans-serif for readability and high-density information)

## 2. Launch Experience & Animation
The "Shirorekha" animation is the core of the app's first impression, symbolizing the "headline" of a talent's career.

### Shirorekha Splash Screen
The splash screen features a hand-drawn SVG underline (Shirorekha) that animates beneath the "kalakar" logo.

#### Implementation (HTML)
```html
<div id="splash-screen" class="splash-container">
  <div class="logo-wrapper">
    <span class="kalakar-logo-text">kalakar
      <svg class="shirorekha-svg" viewBox="0 0 100 10" preserveAspectRatio="none">
        <path d="M 0 5 Q 50 2, 100 5" stroke="var(--brand-gold)" stroke-width="4" fill="none" class="draw-line" />
      </svg>
    </span>
  </div>
  <p id="loading-phrase" class="splash-tagline">Setting the Stage...</p>
</div>
```

#### Animation Logic (CSS)
The path uses `stroke-dasharray` and `stroke-dashoffset` to simulate a "drawing" effect.

```css
.draw-line {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawSvgLine 1.2s ease-in-out forwards;
}
@keyframes drawSvgLine {
  to {
    stroke-dashoffset: 0;
  }
}
.splash-tagline {
  animation: fadeInOut 1s infinite alternate 1.2s;
}
```

#### Timeout & Safety Protocol (JS)
To ensure the app feels responsive even if initialization is slow, multiple "hard-hide" timeouts and initialization-triggered hides are implemented:

*   **Immediate Fallback (index.html):** A `setTimeout` of 4500ms in the `<head>` ensures the splash is hidden even if scripts fail to load.
*   **Boot Phase Safety (app.js):** A second fallback at 5000ms is set during the `boot()` function.
*   **Initialization Trigger:** The splash is hidden as soon as the `getCurrentUser()` call resolves (successfully or with an error), typically much faster than the 4.5s timeout.

```javascript
// From app.js boot()
const user = unwrapResult(await getCurrentUser().catch(() => null));
if (splash) splash.style.display = 'none';
```

## 3. Tech Stack Architecture
The app is built with a Vanilla Web Components approach to ensure zero-latency interactions on mobile devices.

*   **Frontend:** Vanilla HTML5, CSS3, and ES6+ JavaScript.
*   **Backend-as-a-Service:** Appwrite
*   **Auth:** Phone (OTP) and Google OAuth 2.0.
*   **Database:** `kalakar_db` with collections for creators, posts, and connections.
*   **Storage:** `avatars` bucket for profile and proof-of-work media.
*   **Offline Readiness:** Service Workers (`sw.js`) and Offline Indicators.

## 4. UI Components
*   **Cinematic Header:** Sticky navigation with glassmorphism (`backdrop-filter: blur(20px)`).
*   **The Greenroom (Feed):** Vertical scroll-snap video feed inspired by high-end showreel players.
*   **Identity Gate:** A role-selection modal that configures the user's workspace upon first login.
*   **Professional Deals (Messaging):** A structured chat interface for contract and milestone verification.
*   **Screen Stack:** A view-switching engine that manages UI state without page reloads.

## 5. Mobile-First Optimization
The app uses Phase 21-36 optimizations including:

*   **Floating Action Buttons (FAB)** for mobile navigation.
*   **Responsive Flexbox/Grid layouts** that shift from a 3-column desktop layout to a single-column mobile feed.
*   **PWA (Progressive Web App):** Manifest-enabled for full-screen "standalone" installation on iOS/Android.
