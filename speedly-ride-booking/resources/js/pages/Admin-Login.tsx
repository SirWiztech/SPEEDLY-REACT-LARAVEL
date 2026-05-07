import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/AdminLogin.css';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Check if already logged in
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/SERVER/API/check_admin_session.php');
                const data = await response.json();
                if (data.logged_in) {
                    router.visit('/admin-dashboard');
                }
            } catch (error) {
                console.error('Session check failed:', error);
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        
        setLoading(true);
        setError('');
        
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('remember', rememberMe ? '1' : '0');
        
        try {
            const response = await fetch('/SERVER/API/admin-login.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: 'Redirecting to dashboard...',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.visit('/admin-dashboard');
                });
            } else {
                setError(data.message || 'Invalid username or password');
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Invalid credentials',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            setError('Connection error. Please try again.');
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Unable to connect to the server',
                confirmButtonColor: '#ff5e00'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Swal.fire({
            title: 'Reset Password',
            html: `
                <input type="email" id="resetEmail" class="swal2-input" placeholder="Enter your email">
            `,
            showCancelButton: true,
            confirmButtonText: 'Send Reset Link',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const email = (document.getElementById('resetEmail') as HTMLInputElement)?.value;
                if (!email || !email.includes('@')) {
                    Swal.showValidationMessage('Please enter a valid email');
                    return false;
                }
                return email;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                Swal.fire({
                    icon: 'success',
                    title: 'Reset Link Sent!',
                    text: 'Check your email for password reset instructions.',
                    confirmButtonColor: '#ff5e00'
                });
            }
        });
    };

    if (preloaderLoading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="login-header">
                    <div className="logo-wrapper">
                        <img src="/main-assets/logo-no-background.png" alt="Speedly" className="logo-image" />
                    </div>
                    <h1>Admin Dashboard</h1>
                    <p>Sign in to manage your platform</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <i className="fas fa-user input-icon"></i>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group">
                        <i className="fas fa-lock input-icon"></i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input-field"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i 
                            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
                            onClick={() => setShowPassword(!showPassword)}
                        ></i>
                    </div>

                    <div className="login-options">
                        <label className="remember-me">
                            <input 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>
                        <button type="button" className="forgot-password" onClick={handleForgotPassword}>
                            Forgot Password?
                        </button>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <><span className="spinner"></span> Signing in...</>
                        ) : (
                            <><span className="btn-text">Sign In</span> <i className="fas fa-arrow-right"></i></>
                        )}
                    </button>

                    <div className="security-badge">
                        <i className="fas fa-shield-alt"></i>
                        <span>Secure 256-bit SSL encrypted connection</span>
                    </div>

                    <div className="back-link">
                        <a href="/">
                            <i className="fas fa-arrow-left"></i>
                            Back to Website
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;