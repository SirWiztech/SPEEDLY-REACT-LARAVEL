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
