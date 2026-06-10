import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { queryClient } from '@/lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { ActiveRideProvider } from '@/contexts/ActiveRideContext';
import '@/../css/Preloader.css';

const appName = import.meta.env.VITE_APP_NAME || 'Speedly';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: false });
        const page = pages[`./pages/${name}.tsx`];
        if (!page) {
            console.warn('Page not found:', name);
            return import('./pages/Home');
        }
        return page;
    },
    setup({ el, App, props }) {
        const app = (
            <QueryClientProvider client={queryClient}>
                <ActiveRideProvider>
                    <App {...props} />
                </ActiveRideProvider>
            </QueryClientProvider>
        );
        if (el.hasChildNodes()) {
            hydrateRoot(el, app);
        } else {
            createRoot(el).render(app);
        }
    },
    progress: {
        color: '#ff5e00',
    },
});
