import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';

export default function PaymentProcessing() {
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [message, setMessage] = useState('Please do not close this window...');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const amount = urlParams.get('amount');

        if (!reference) {
            setStatus('failed');
            setMessage('Invalid payment reference.');
            return;
        }

        // Simulate payment processing
        const timer = setTimeout(() => {
            fetch(`/api/payment/verify?reference=${reference}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setStatus('success');
                        setMessage('Payment verified successfully!');
                        setTimeout(() => {
                            window.location.href = `/payment/callback?paymentId=${reference}`;
                        }, 2000);
                    } else {
                        setStatus('failed');
                        setMessage(data.message || 'Payment verification failed.');
                    }
                })
                .catch(() => {
                    setStatus('failed');
                    setMessage('Connection error. Please try again.');
                });
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Processing Payment" />
            <div className="payment-processing-page">
                <div className="processing-container">
                    <div className="processing-icon">
                        {status === 'processing' && (
                            <div className="spinner">⏳</div>
                        )}
                        {status === 'success' && '✅'}
                        {status === 'failed' && '❌'}
                    </div>
                    <h1>
                        {status === 'processing' && 'Processing Payment'}
                        {status === 'success' && 'Payment Verified!'}
                        {status === 'failed' && 'Payment Failed'}
                    </h1>
                    <p>{message}</p>
                    
                    {status === 'success' && (
                        <p className="redirect-notice">Redirecting to confirmation page...</p>
                    )}
                    
                    {status === 'failed' && (
                        <a href="/client/wallet" className="btn-premium">
                            Try Again
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
