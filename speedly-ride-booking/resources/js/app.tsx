import { createInertiaApp } from '@inertiajs/react';
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
        // @ts-ignore
        import('react-dom/client').then(({ createRoot }) => {
            createRoot(el).render(
                <QueryClientProvider client={queryClient}>
                    <ActiveRideProvider>
                        <App {...props} />
                    </ActiveRideProvider>
                </QueryClientProvider>
            );
        });
    },
    progress: {
        color: '#ff5e00',
    },
});
