import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/AdminLogin.css';

interface AdminLoginForm {
    username: string;
    password: string;
    remember: boolean;
}

export default function AdminLogin() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const loading = usePreloader(1000);
    const isMobile = useMobile();
    
    const { data, setData, post, processing } = useForm<AdminLoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!data.username || !data.password) {
            setError('Please enter both username and password');
            return;
        }

        post('/admin/login', {
            onError: (errors) => {
                setError(errors.message || 'Invalid username or password');
            },
        });
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-brand">
                    <div className="logo">
                        <img src="/main-assets/logo.png" alt="Speedly" />
                    </div>
                    <h1>SPEEDLY</h1>
                    <p>Your Everyday Ride Partner<br />Admin Portal</p>
                </div>

                <div className="admin-login-form">
                    <h2>Admin Login</h2>
                    <p className="subtitle">Sign in to access the admin dashboard</p>

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <a href="/admin/forgot-password">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
