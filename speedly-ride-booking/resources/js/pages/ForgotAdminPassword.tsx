import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/AdminLogin.css';

interface ForgotAdminPasswordForm {
    email: string;
}

export default function ForgotAdminPassword() {
    const [success, setSuccess] = useState(false);
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data, setData, post, processing, errors } = useForm<ForgotAdminPasswordForm>({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/forgot-password', {
            onSuccess: () => setSuccess(true),
        });
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Admin Forgot Password" />
            <div className="admin-login-page">
                <div className="admin-login-container">
                    <div className="admin-login-brand">
                        <div className="logo">
                            <img src="/main-assets/logo.png" alt="Speedly" />
                        </div>
                        <h1>SPEEDLY</h1>
                        <p>Admin Portal - Forgot Password</p>
                    </div>

                    <div className="admin-login-form">
                        <h2>Forgot Password?</h2>
                        <p className="subtitle">Enter your admin email to reset your password.</p>

                        {success ? (
                            <div className="success-message">
                                <span>✅</span>
                                <p>Password reset instructions sent to admin email.</p>
                                <a href="/admin/login" className="btn-login" style={{ display: 'inline-block', textAlign: 'center', marginTop: '16px' }}>
                                    Back to Login
                                </a>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="admin-login-form">
                                <div className="form-group">
                                    <label htmlFor="email">Admin Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter admin email"
                                        autoComplete="email"
                                    />
                                    {errors.email && (
                                        <span className="error-text">{errors.email}</span>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn-login"
                                    disabled={processing}
                                >
                                    {processing ? 'Sending...' : 'Send Reset Link'}
                                </button>

                                <a href="/admin/login" className="back-link">Back to Login</a>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
