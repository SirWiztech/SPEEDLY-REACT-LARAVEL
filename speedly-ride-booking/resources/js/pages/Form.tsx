import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/form.css';

interface FormData {
    isLogin: boolean;
    email: string;
    password: string;
    name: string;
}

export default function Form() {
    const [isLogin, setIsLogin] = useState(true);
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data, setData, post, processing, errors } = useForm<FormData>({
        isLogin: true,
        email: '',
        password: '',
        name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLogin) {
            post('/login');
        } else {
            post('/register');
        }
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title={isLogin ? 'Sign In' : 'Register'} />
            <div className="form-container">
                <div className="brand-panel">
                    <div className="brand-content">
                        <img src="/main-assets/logo.png" alt="Speedly" className="logo-img" />
                        <h1 className="brand-title">SPEEDLY</h1>
                        <p className="brand-tagline">Your Everyday Ride Partner</p>
                    </div>
                </div>

                <div className="form-panel">
                    <div className="form-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Sign in to continue' : 'Register to get started'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setData('isLogin', !isLogin);
                                }}
                            >
                                {isLogin ? 'Register' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
