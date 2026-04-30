import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/ClientSettings.css';

export default function ClientSettingsMobile() {
    const loading = usePreloader(1500);
    const [activeSection, setActiveSection] = useState('profile');

    const { data, setData, post, processing } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        notifications_enabled: true,
        email_notifications: true,
    });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        post('/client/settings/password');
    };

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Settings - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>Settings</h1>
                </div>

                <div className="settings-tabs">
                    <button 
                        className={`tab ${activeSection === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveSection('profile')}
                    >
                        Profile
                    </button>
                    <button 
                        className={`tab ${activeSection === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveSection('security')}
                    >
                        Security
                    </button>
                    <button 
                        className={`tab ${activeSection === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSection('notifications')}
                    >
                        Notifications
                    </button>
                </div>

                <div className="settings-content">
                    {activeSection === 'profile' && (
                        <div className="settings-section">
                            <h2>Profile Settings</h2>
                            <p>Manage your profile information</p>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <form onSubmit={handlePasswordChange} className="settings-section">
                            <h2>Change Password</h2>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input 
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password"
                                    value={data.new_password}
                                    onChange={(e) => setData('new_password', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input 
                                    type="password"
                                    value={data.new_password_confirmation}
                                    onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-premium" disabled={processing}>
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="settings-section">
                            <h2>Notification Preferences</h2>
                            <div className="toggle-group">
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked={data.notifications_enabled}
                                        onChange={(e) => setData('notifications_enabled', e.target.checked)}
                                    />
                                    <span>Push Notifications</span>
                                </label>
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked={data.email_notifications}
                                        onChange={(e) => setData('email_notifications', e.target.checked)}
                                    />
                                    <span>Email Notifications</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
