# realtime
- Use HTTP polling instead of WebSockets/Reverb for real-time features (Render free plan constraint). Confidence: 0.85
- For chat: poll messages every 3s via setInterval, no Pusher/Echo dependencies. Confidence: 0.80
- For driver ride requests: poll pending rides every 10s instead of WebSocket events. Confidence: 0.75

# ride-flow
- Private rides (request_type='private') get status 'declined' when the assigned driver declines and notify the client. Confidence: 0.80
- Public rides stay 'pending' when a driver declines so other drivers can still accept — only log the decline, no notification. Confidence: 0.75
- Receipt should be viewable for ALL non-cancelled ride statuses (including pending). Confidence: 0.70

# navigation
- Nav active state should use exact path matching with query-string stripping and trailing-slash normalization to avoid mismatches. Confidence: 0.70
- Remove dead kebab-case `matchPaths` entries that don't match actual routes. Confidence: 0.70

# performance
- Remove artificial loading delays — usePreloader hook default should be 0ms so pages render as soon as real API data arrives. Confidence: 0.85
- The chown step in Docker builds takes 205s+ if node_modules is in the build context — add .dockerignore to exclude it. Confidence: 0.75

# sweetalert2
- SweetAlert2's html parameter is a plain string and does NOT evaluate JavaScript template literals — use string concatenation ('text ' + variable + ' more') instead of template literals (\`text \${variable}\`). Confidence: 0.70

# mail
- Deploy on Render blocks SMTP ports — use HTTP API transports (Brevo) with raw cURL over Symfony's HTTP client chain to avoid SSL/missing dependency issues. Confidence: 0.85
- DB::transaction() should only contain database operations — email sending and other external I/O must happen outside the transaction so failures can be properly caught and returned. Confidence: 0.80
- Symfony Mime 8.x removed Address::getEncodedAddress() — use getAddress() instead. Also, getRecipients() only exists on AbstractApiTransport (not AbstractTransport). Confidence: 0.80
- When email transport fails on Render, prefer writing a custom raw-cURL transport that matches a working test script rather than debugging Symfony's HTTP client chain. Confidence: 0.75

# frontend-editing
- When edit_file fails on .tsx files (CRLF mismatch), write a Node.js script that uses fs.readFileSync/fs.writeFileSync with explicit \\r\\n matching instead of using sed or PowerShell. Confidence: 0.70

# pwa
- PWA manifest start_url should be "/" (root) so the app stays in standalone mode after login redirects — if start_url doesn't match the current URL, Chrome shows the URL bar. Confidence: 0.85
- PWABuilder generates a standalone project (Vite + Lit) that won't integrate with an existing Laravel app — delete it and use the existing service worker + manifest setup instead. Confidence: 0.75
- PWA APKs built by PWABuilder must be regenerated when the site changes — the APK embeds the app at build time. Copy the generated APK to public/ and commit to git so it's deployed with the app. Confidence: 0.70

# frontend-editing
- Avoid scripts that inject JSX wrappers into return statements — they corrupt div balance and remove export statements. Prefer targeted single-line changes or full file rewrites for complex JSX modifications. Confidence: 0.80

# css-profile-pictures
- .profile-pic-placeholder needs overflow:hidden plus explicit img { width:100%; height:100%; object-fit:cover; border-radius:50% } in CSS — inline styles alone get covered by the solid background div. Confidence: 0.75

# csp
- Narrow CSP allowlists cause ongoing breakage (Boxicons fonts, Font Awesome, CDN assets). Use permissive wildcard CSP with object-src:none, base-uri:self, form-action:self plus X-Content-Type-Options, X-XSS-Protection, HSTS for actual protection. Confidence: 0.80

# inertia-middleware
- Inertia doesn't handle JSON error responses from middleware gracefully — middleware guarding Inertia pages should use redirect() for non-JSON requests (check $request->expectsJson() first to preserve API behavior). Confidence: 0.70

# postgresql
- DATE_FORMAT() is a MySQL-only function — on PostgreSQL use TO_CHAR(column, 'YYYY-MM-DD') instead. The project uses PostgreSQL on Render, so avoid MySQL-specific SQL functions. Confidence: 0.70

# render-env
- VITE_ prefixed env vars are embedded at build time by Vite. If missing from Render's env, Google Maps loads with key=&libraries= (empty key), causing NoApiKeys/InvalidKey errors and React crashes like "Cannot access K before initialization". Must be set before docker build runs npm run build. Confidence: 0.85
