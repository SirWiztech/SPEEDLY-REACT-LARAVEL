import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/PaymentCallback.css';

const PaymentCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [amount, setAmount] = useState<number>(0);
    const [reference, setReference] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    useEffect(() => {
        const sessionId = searchParams.get('session');
        const ref = searchParams.get('reference');
        
        if (!sessionId || !ref) {
            setStatus('error');
            setErrorMessage('Invalid payment session');
            return;
        }
        
        setReference(ref);
        
        // Check transaction status
        const checkStatus = async () => {
            try {
                const response = await fetch(`/SERVER/API/check_transaction_status.php?reference=${ref}`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    setAmount(data.amount || 0);
                    setStatus('success');
                    
                    setTimeout(() => {
                        navigate(`/wallet?payment_status=completed&reference=${ref}`);
                    }, 2000);
                } else if (data.status === 'failed') {
                    setStatus('error');
                    setErrorMessage(data.failure_reason || 'Payment failed');
                } else {
                    // Still processing, check again after 2 seconds
                    setTimeout(checkStatus, 2000);
                }
            } catch (error) {
                console.error('Error checking status:', error);
                setStatus('error');
                setErrorMessage('Connection error');
            }
        };
        
        // Start checking after 1 second
        setTimeout(checkStatus, 1000);
        
        // Fallback timeout
        const timeout = setTimeout(() => {
            if (status === 'processing') {
                setStatus('error');
                setErrorMessage('Payment processing timeout');
            }
        }, 30000);
        
        return () => clearTimeout(timeout);
    }, [searchParams, navigate]);

    if (preloaderLoading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <div className="payment-callback-container">
            {status === 'processing' && (
                <div className="callback-card">
                    <div className="spinner"></div>
                    <h2>Processing Payment</h2>
                    <div className="amount">₦{amount.toLocaleString()}</div>
                    <p className="status-text">Verifying your payment...</p>
                    <div className="reference">Ref: {reference.substring(0, 20)}...</div>
                </div>
            )}
            
            {status === 'success' && (
                <div className="callback-card success">
                    <div className="success-icon">
                        <i className="fas fa-check"></i>
                    </div>
                    <h2>Payment Successful!</h2>
                    <div className="amount">₦{amount.toLocaleString()}</div>
                    <p className="status-text">Redirecting to wallet...</p>
                </div>
            )}
            
            {status === 'error' && (
                <div className="callback-card error">
                    <div className="error-icon">
                        <i className="fas fa-times"></i>
                    </div>
                    <h2>Payment Failed</h2>
                    <p className="status-text">{errorMessage || 'Your payment could not be processed'}</p>
                    <button onClick={() => navigate('/wallet')} className="back-btn">
                        Back to Wallet
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentCallback;