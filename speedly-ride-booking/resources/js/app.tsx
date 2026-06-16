import '../css/app.css';
import '@/../css/Preloader.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import React from 'react';
import CookieConsent from '@/components/CookieConsent';
import GlobalChatBubble from '@/components/GlobalChatBubble';
import { registerPWA } from '@/pwa';

// Register PWA service worker on first load
registerPWA();

createInertiaApp({
    title: (title) =>
        title ? `${title} - Speedly` : 'Speedly',
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const { createRoot } = require('react-dom/client');
        const root = createRoot(el);
        root.render(
            <React.Fragment>
                <App {...props} />
                <CookieConsent />
                <GlobalChatBubble />
            </React.Fragment>
        );
    },
    progress: {
        color: '#ff5e00',
    },
});
