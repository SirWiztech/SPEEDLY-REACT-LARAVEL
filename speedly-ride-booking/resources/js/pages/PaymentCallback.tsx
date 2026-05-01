import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';

export default function PaymentCallback() {
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('paymentId');
        const payerId = urlParams.get('PayerID');

        if (paymentId && payerId) {
            api.payment.callback(paymentId, payerId)
                .then(data => {
                    if (data.success) {
                        setStatus('success');
                        setMessage('Payment completed successfully!');
                    } else {
                        setStatus('failed');
                        setMessage(data.message || 'Payment failed. Please try again.');
                    }
                })
                .catch(() => {
                    setStatus('failed');
                    setMessage('Connection error. Please try again.');
                });
        } else {
            setStatus('failed');
            setMessage('Invalid payment callback parameters.');
        }
    }, []);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Payment Callback" />
            <div className="payment-callback-page">
                <div className="callback-container">
                    <div className="callback-icon">
                        {status === 'processing' && '⏳'}
                        {status === 'success' && '✅'}
                        {status === 'failed' && '❌'}
                    </div>
                    <h1>
                        {status === 'processing' && 'Processing Payment...'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'failed' && 'Payment Failed'}
                    </h1>
                    <p>{message}</p>
                    
                    {status === 'success' && (
                        <a href="/client/dashboard" className="btn-premium">
                            Go to Dashboard
                        </a>
                    )}
                    
                    {status === 'failed' && (
                        <div className="callback-actions">
                            <a href="/client/wallet" className="btn-premium">
                                Try Again
                            </a>
                            <a href="/client/dashboard" className="btn-secondary">
                                Go to Dashboard
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
