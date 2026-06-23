import { useState, useEffect } from 'react';

export function usePreloader(duration?: number) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // No artificial delay — preloader shows only while real data loads
        if (duration === undefined || duration <= 0) {
            setLoading(false);
            return;
        }
        const timer = setTimeout(() => {
            setLoading(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    return loading;
}
