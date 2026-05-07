import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ClientSupportMobile from '../components/mobileViewComponent/DriverSupportMobile';
import '../../css/DriverSupport.css';

// Types
interface SupportTicket {
    category: string;
    subject: string;
    message: string;
    priority: string;
}

interface FaqItem {
    question: string;
    answer: string;
    isOpen: boolean;
}

const DriverSupport: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('General Inquiry');
    const [subject, setSubject] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [priority, setPriority] = useState<string>('Normal');
    const [loading, setLoading] = useState<boolean>(true);
    const [charCount, setCharCount] = useState<number>(0);
    const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
    const [notificationCount, setNotificationCount] = useState<number>(0);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // FAQ Data
    const faqs: FaqItem[] = [
        {
            question: 'How do I cancel a ride?',
            answer: 'Open the active ride on your dashboard and tap "Cancel Ride". Free cancellation is available within 2 minutes of booking.',
            isOpen: true
        },
        {
            question: 'Why hasn\'t my wallet been credited?',
            answer: 'Credits can take up to 5 minutes to reflect. If it\'s been more than 30 minutes, contact support with your payment reference number.',
            isOpen: false
        },
        {
            question: 'How do I request a refund?',
            answer: 'Go to Ride History, select the disputed ride, and tap "Request Refund". Our team reviews refunds within 48 hours.',
            isOpen: false
        },
        {
            question: 'How do I report a driver?',
            answer: 'Select the "Safety Concern" category and submit a complaint, or call our hotline for urgent matters. All reports are treated confidentially.',
            isOpen: false
        }
    ];

    // Categories
    const categories = [
        { value: 'General Inquiry', icon: 'fa-question-circle', label: 'General' },
        { value: 'Ride Issue', icon: 'fa-car', label: 'Ride Issue' },
        { value: 'Payment Problem', icon: 'fa-credit-card', label: 'Payment' },
        { value: 'Account Problem', icon: 'fa-user', label: 'Account' },
        { value: 'Safety Concern', icon: 'fa-shield-alt', label: 'Safety' },
        { value: 'Other', icon: 'fa-ellipsis-h', label: 'Other' }
    ];

    // Fetch user data
    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/client_dashboard_data.php');
            const data = await response.json();
            
            if (data.success) {
                setUserData(data.user);
                setNotificationCount(data.notification_count || 0);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update character count
    useEffect(() => {
        setCharCount(message.length);
    }, [message]);

    // Handle FAQ toggle
    const toggleFaq = (index: number) => {
        const newIndex = openFaqIndex === index ? -1 : index;
        setOpenFaqIndex(newIndex);
    };

    // Submit support ticket
    const handleSubmit = async () => {
        if (!subject.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Subject Required',
                text: 'Please add a short subject so we know what your message is about.',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        if (message.length < 20) {
            Swal.fire({
                icon: 'warning',
                title: 'Message Too Short',
                text: 'Please describe your issue in at least a few words.',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Submitting...',
            text: 'Please wait while we submit your request',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('priority', priority);

        try {
            const response = await fetch('/SERVER/API/submit_support_ticket.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Request Submitted!',
                    html: `
                        <p>Your support request has been submitted successfully!</p>
                        <p class="mt-2">Ticket Number: <strong>${data.ticket_number}</strong></p>
                        <p class="mt-2 text-sm text-gray-500">Our team will respond within 24 hours.</p>
                    `,
                    confirmButtonColor: '#ff5e00'
                }).then(() => {
                    // Clear form
                    setSubject('');
                    setMessage('');
                    setCharCount(0);
                    // Redirect after 2 seconds
                    setTimeout(() => {
                        router.visit('/client-dashboard');
                    }, 2000);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: data.message || 'Failed to submit support request. Please try again.',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Network error. Please check your connection and try again.',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const response = await fetch('/SERVER/API/get_notifications.php');
            const data = await response.json();

            if (data.success && data.notifications && data.notifications.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                data.notifications.forEach((notif: any) => {
                    html += `
                        <div style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p><strong>${notif.title || 'Notification'}</strong></p>
                            <p style="font-size: 13px;">${notif.message || ''}</p>
                            <p style="font-size: 11px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';

                Swal.fire({
                    title: `Notifications (${data.notifications.length})`,
                    html: html,
                    icon: 'info',
                    confirmButtonColor: '#ff5e00'
                });
            } else {
                Swal.fire({
                    title: 'Notifications',
                    text: 'No new notifications',
                    icon: 'info',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Notifications',
                text: 'No new notifications',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Go back
    const goBack = () => {
        window.history.back();
    };

    const firstName = userData?.fullname?.split(' ')[0] || 'Guest';
    const userInitial = userData?.fullname?.charAt(0)?.toUpperCase() || 'U';

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <ClientSupportMobile />;
    }

    const getPriorityIcon = (value: string) => {
        switch (value) {
            case 'Normal': return '🟡 Normal';
            case 'High': return '🔴 High – Urgent';
            case 'Low': return '🟢 Low – No Rush';
            default: return '🟡 Normal';
        }
    };

    const getCharColor = () => {
        if (charCount > 1800) return '#ef4444';
        if (charCount > 1400) return '#ff5e00';
        return '';
    };

    return (
        <div className="support-desktop-container">
            <ClientSidebarDesktop 
                userName={userData?.fullname || 'User'} 
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="support-desktop-main">
                {/* Header */}
                <div className="support-desktop-header">
                    <div className="support-desktop-title">
                        <h1>Support Center</h1>
                        <p>Tell us what's going on, {firstName}. We're listening.</p>
                    </div>
                    <button className="support-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Hero Section */}
                <div className="support-hero">
                    <div className="hero-icon">
                        <i className="fas fa-headset"></i>
                    </div>
                    <div className="hero-badges">
                        <span className="hero-badge"><i className="fas fa-clock"></i> Reply within 24h</span>
                        <span className="hero-badge"><i className="fas fa-lock"></i> Secure &amp; Private</span>
                        <span className="hero-badge"><i className="fas fa-envelope"></i> Email Support</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="support-content">
                    {/* Category Selection */}
                    <div className="support-section">
                        <p className="section-label">What's this about?</p>
                        <div className="pills-wrap">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    className={`pill ${selectedCategory === cat.value ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.value)}
                                >
                                    <i className={`fas ${cat.icon}`}></i> {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject and Priority */}
                    <div className="support-row">
                        <div className="support-field">
                            <label>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Brief title of your issue…"
                                maxLength={120}
                            />
                        </div>
                        <div className="support-field">
                            <label>Priority</label>
                            <div className="select-wrapper">
                                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="Normal">🟡 Normal</option>
                                    <option value="High">🔴 High – Urgent</option>
                                    <option value="Low">🟢 Low – No Rush</option>
                                </select>
                                <i className="fas fa-chevron-down select-arrow"></i>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="support-field">
                        <label>Your Message</label>
                        <textarea
                            rows={6}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={2000}
                            placeholder="Describe your issue in detail — include your ride ID or transaction reference if relevant…"
                        />
                        <div className="char-row">
                            <span className="char-count" style={{ color: getCharColor() }}>
                                {charCount} / 2000
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="support-submit">
                        <button className="submit-btn" onClick={handleSubmit}>
                            <i className="fas fa-paper-plane"></i>
                            Submit Support Request
                        </button>
                        <p className="submit-note">
                            Your request will be forwarded to our support team.
                            <strong> Response within 24 hours.</strong>
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="divider">
                        <span>or reach us via</span>
                    </div>

                    {/* Contact Cards */}
                    <div className="contact-grid">
                        <a href="tel:+2348000000000" className="contact-card">
                            <div className="contact-icon phone">
                                <i className="fas fa-phone"></i>
                            </div>
                            <p>Phone</p>
                            <span>Mon – Sat, 8am – 8pm</span>
                        </a>
                        <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="contact-card">
                            <div className="contact-icon whatsapp">
                                <i className="fab fa-whatsapp"></i>
                            </div>
                            <p>WhatsApp</p>
                            <span>Chat with our team</span>
                        </a>
                        <a href="mailto:speedlyentreprise01@gmail.com" className="contact-card">
                            <div className="contact-icon email">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <p>Direct Email</p>
                            <span>speedlyentreprise01@gmail.com</span>
                        </a>
                    </div>

                    {/* FAQ Section */}
                    <div className="faq-section">
                        <p className="section-label">Common Questions</p>
                        <div className="faq-list">
                            {faqs.map((faq, index) => (
                                <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                                    <button className="faq-btn" onClick={() => toggleFaq(index)}>
                                        <span>{faq.question}</span>
                                        <i className={`fas fa-chevron-down faq-chevron ${openFaqIndex === index ? 'rotated' : ''}`}></i>
                                    </button>
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="support-footer">
                    <p>Speedly Support &middot; <strong>speedlyentreprise01@gmail.com</strong> &middot; Response within 24 hours</p>
                </div>
            </div>
        </div>
    );
};

export default DriverSupport;