import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/form.css';

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPassword() {
    const [success, setSuccess] = useState(false);
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data, setData, post, processing, errors } = useForm<ForgotPasswordForm>({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password', {
            onSuccess: () => setSuccess(true),
        });
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Forgot Password" />
            <div className="forgot-password-page">
                <div className="forgot-container">
                    <div className="forgot-header">
                        <img src="/main-assets/logo.png" alt="Speedly" className="forgot-logo" />
                        <h1>Forgot Password?</h1>
                        <p>Enter your email address and we'll send you a password reset link.</p>
                    </div>

                    {success ? (
                        <div className="success-message">
                            <span>✅</span>
                            <p>Password reset link has been sent to your email.</p>
                            <a href="/login" className="btn-premium" style={{ marginTop: '16px', display: 'inline-block' }}>
                                Back to Login
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="forgot-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <span className="error-text">{errors.email}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn-premium"
                                disabled={processing}
                            >
                                {processing ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <a href="/login" className="back-link">Back to Login</a>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
