import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/Splash.css';

export default function Splash() {
    const [showContent, setShowContent] = useState(false);
    const [text, setText] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    
    const fullText = 'SPEEDLY';
    const loading = usePreloader(2000);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!loading) {
            let index = 0;
            const interval = setInterval(() => {
                if (index <= fullText.length) {
                    setText(fullText.slice(0, index));
                    index++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => setShowContent(true), 500);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [loading]);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Speedly - Your Everyday Ride Partner" />
            <div className="splash-container">
                <div className="brand-panel">
                    <div className="logo-wrapper">
                        <img src="/main-assets/logo.png" alt="Speedly" className="logo-img" />
                    </div>
                    <h1 className="brand-title">{text}</h1>
                    {showContent && (
                        <>
                            <p className="brand-tagline">Your Everyday Ride Partner</p>
                            <div className="splash-actions">
                                <a href="/register" className="btn-splash btn-splash-primary">
                                    Get Started
                                </a>
                                <a href="/login" className="btn-splash btn-splash-secondary">
                                    Sign In
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
