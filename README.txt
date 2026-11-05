THUNDER GUARD PWA - WINDOWS 11 SETUP

WHAT THIS VERSION DOES
- Installable browser-based PWA for iPhone Home Screen.
- Uses device location when you tap the location button.
- Fetches Open-Meteo thunderstorm_probability forecast for 17 sample points: center, 8 at 10 km, and 8 at 19 km.
- Shows the maximum forecast probability and the center-point next-hour forecast.
- Refreshes every 15 minutes only while the page remains open and visible.
- Forecast risk only; it does not detect confirmed lightning strikes.

IMPORTANT LIMITATIONS
- This starter has no always-on server, no remote push service, and no guaranteed background monitoring.
- iOS may suspend a PWA when closed. This version cannot alert you while closed.
- Do not rely on it as a certified life-safety warning system. If thunder is heard, move indoors and follow official warnings.
- Open-Meteo is free for non-commercial use under its terms and requires attribution. Check current terms before public/commercial use.

LOCAL TEST ON WINDOWS 11
1. Install Python 3 from https://www.python.org/downloads/windows/ (enable Add Python to PATH).
2. Extract this ZIP to a folder, e.g. C:\ThunderGuard_PWA.
3. Open that folder in File Explorer. Click the address bar, type cmd, press Enter.
4. Run: python -m http.server 8000
5. On the Windows laptop open: http://localhost:8000
6. To test on iPhone, laptop and iPhone must be on same Wi-Fi. Find laptop IPv4 address with `ipconfig`, then open http://LAPTOP-IP:8000 on iPhone. Location access may not work over plain HTTP on iPhone because geolocation generally requires a secure context. Use HTTPS hosting for real iPhone testing.

PUBLISH FOR IPHONE (GITHUB PAGES)
1. Create/sign in to a GitHub account.
2. Create a new PUBLIC repository named thunder-guard-pwa.
3. Upload all files and folders from this extracted folder to the repository root (index.html must be at root).
4. In repository Settings > Pages, set Build and deployment to Deploy from a branch; choose main and /(root); Save.
5. Wait for GitHub Pages to publish. Open the HTTPS URL it provides, e.g. https://YOUR-USERNAME.github.io/thunder-guard-pwa/ .
6. On iPhone, open that HTTPS URL in Safari. Tap Share > Add to Home Screen > Add.
7. Launch Thunder Guard from the Home Screen and tap Use my current location; allow location access.

NOTIFICATIONS / BACKGROUND MONITORING
This package is a first installable PWA prototype. Background push notifications on iOS require the PWA to be added to the Home Screen, iOS 16.4 or later, a service worker push handler, a push subscription, and a secure backend that sends Web Push using VAPID. A continuously running backend scheduler is also needed for monitoring while the app is closed. Those components are not included in this starter and must be implemented and deployed separately.
