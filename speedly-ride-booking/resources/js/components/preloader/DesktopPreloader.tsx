import { useEffect, useState } from 'react';

interface DesktopPreloaderProps {
    onLoadComplete?: () => void;
}

export default function DesktopPreloader({ onLoadComplete }: DesktopPreloaderProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            onLoadComplete?.();
        }, 1000);

        return () => clearTimeout(timer);
    }, [onLoadComplete]);

    if (!loading) return null;

    return (
        <div className="desktop-preloader">
            <div className="preloader-content">
                <img src="/main-assets/logo.png" alt="Speedly" className="preloader-logo-img" />
                <p className="preloader-text">Loading...</p>
            </div>
        </div>
    );
}
