import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/DriverSettings.css';

export default function DriverSettingsMobile() {
    const [activeSection, setActiveSection] = useState('profile');
    const loading = usePreloader(1500);

    const { data, setData, post, processing } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        post('/driver/settings/password');
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
                            <button 
                                type="submit" 
                                className="btn-update"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
