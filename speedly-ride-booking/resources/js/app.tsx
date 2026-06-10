import '../css/app.css';
import '@/../css/Preloader.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

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
        root.render(<App {...props} />);
    },
    progress: {
        color: '#ff5e00',
    },
});
