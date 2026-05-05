import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Required',
                text: 'Please enter your email address',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }
        
        setLoading(true);
        
        const formData = new FormData();
        formData.append('email', email);
        
        try {
            const response = await fetch('/SERVER/API/send-reset-link.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Reset Link Sent!',
                    text: 'Please check your email for the password reset link.',
                    confirmButtonColor: '#ff5e00'
                }).then(() => {
                    window.location.href = '/login';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to send reset link',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Unable to connect to the server. Please try again.',
                confirmButtonColor: '#ff5e00'
            });
        } finally {
            setLoading(false);
        }
    };

    if (preloaderLoading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <div className="logo-wrapper">
                        <img src="/main-assets/logo-no-background.png" alt="Speedly Logo" className="logo-image" />
                    </div>
                    <h2>Forgot Password?</h2>
                    <p>Don't worry! Enter your email address and we'll send you a secure link to reset your password.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="input-group">
                        <i className="fas fa-envelope"></i>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            <><i className="fas fa-paper-plane"></i> Send Reset Link</>
                        )}
                    </button>
                    
                    <div className="links">
                        <a href="/login"><i className="fas fa-arrow-left"></i> Back to Login</a>
                    </div>
                    
                    <div className="security-note">
                        <i className="fas fa-shield-alt"></i>
                        For your security, this link will expire in 1 hour
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;