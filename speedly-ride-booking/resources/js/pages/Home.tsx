import { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import '../../css/home.css';

export default function Home() {
    const isMobile = useMobile();
    const loading = usePreloader(isMobile ? 1500 : 1000);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">Premium Ride Experience</div>
                    <h1 className="hero-title">
                        Redefining <span className="gradient-text">Urban Mobility</span>
                    </h1>
                    <p className="hero-description">
                        Fast, safe, and affordable rides at your fingertips. Experience the future of transportation with Speedly.
                    </p>
                    <div className="hero-buttons">
                        <Link href="/register" className="btn-hero btn-hero-primary">
                            Get Started
                        </Link>
                        <Link href="/login" className="btn-hero btn-hero-secondary">
                            Sign In
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Active Users</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4.8</span>
                            <span className="stat-label">App Rating</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">1M+</span>
                            <span className="stat-label">Rides Completed</span>
                        </div>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="/main-assets/hero-image.png" alt="Speedly Ride" />
                </div>
            </div>

            <div className="features-section">
                <h2 className="section-title">Why Choose Speedly</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Book Instantly</h3>
                        <p>Get a ride in minutes with just a few taps. No waiting, no hassle.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📍</div>
                        <h3>Track Live</h3>
                        <p>Real-time driver tracking for complete peace of mind during your journey.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Safe & Secure</h3>
                        <p>Verified drivers, secure payments, and 24/7 support for your safety.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💎</div>
                        <h3>Premium Experience</h3>
                        <p>Luxury vehicles and professional drivers for an elevated ride experience.</p>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Experience Premium Rides?</h2>
                    <p>Join thousands of satisfied users who trust Speedly for their daily commute.</p>
                    <Link href="/register" className="btn-hero btn-hero-primary">
                        Download App Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
