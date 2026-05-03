import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/form.css';

interface ResetPasswordForm {
    token: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword() {
    const [success, setSuccess] = useState(false);
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data, setData, post, processing, errors } = useForm<ResetPasswordForm>({
        token: new URLSearchParams(window.location.search).get('token') || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', {
            onSuccess: () => setSuccess(true),
        });
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Reset Password" />
            <div className="reset-password-page">
                <div className="reset-container">
                    <div className="reset-header">
                        <img src="/main-assets/logo.png" alt="Speedly" className="reset-logo" />
                        <h1>Reset Password</h1>
                        <p>Enter your new password below.</p>
                    </div>

                    {success ? (
                        <div className="success-message">
                            <span>✅</span>
                            <p>Your password has been reset successfully!</p>
                            <a href="/form" className="btn-premium" style={{ marginTop: '16px', display: 'inline-block' }}>
                                Sign In
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="reset-form">
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <span className="error-text">{errors.password}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password_confirmation">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                />
                                {errors.password_confirmation && (
                                    <span className="error-text">{errors.password_confirmation}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn-premium"
                                disabled={processing}
                            >
                                {processing ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
