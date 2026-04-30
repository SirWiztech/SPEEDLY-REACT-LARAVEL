import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/VerifyOtp.css';

import type { FormEventHandler } from 'react';

interface OtpForm {
    otp: string;
    phone: string;
}

export default function VerifyOtp() {
    const [error, setError] = useState('');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data, setData, post, processing } = useForm<OtpForm>({
        otp: '',
        phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (data.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        post('/verify-otp', {
            onError: (errors) => {
                setError(errors.message || 'Invalid OTP. Please try again.');
            },
        });
    };

    const handleResend = () => {
        fetch('/api/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: data.phone }),
        }).then(() => {
            alert('OTP resent successfully!');
        });
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Verify OTP" />
            <div className="verify-otp-page">
                <div className="otp-container">
                    <div className="otp-header">
                        <img src="/main-assets/logo.png" alt="Speedly" className="otp-logo" />
                        <h1>Verify Your Number</h1>
                        <p>We've sent a 6-digit code to your phone number</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="otp-form">
                        <div className="otp-input-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
                                className="otp-input"
                                autoComplete="one-time-code"
                            />
                            <p className="otp-hint">Enter the 6-digit code sent to your phone</p>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium"
                            disabled={processing || data.otp.length !== 6}
                        >
                            {processing ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>

                    <div className="resend-section">
                        <p>Didn't receive the code?</p>
                        <button
                            type="button"
                            className="btn-resend"
                            onClick={handleResend}
                        >
                            Resend OTP
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
