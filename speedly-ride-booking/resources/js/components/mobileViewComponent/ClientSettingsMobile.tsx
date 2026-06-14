// ClientSettingsMobile.tsx - Updated with full width content

import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import ClientNavMobile from '../../components/navbars/ClientNavMobile';
import Swal from 'sweetalert2';
import api, { setToken } from '../../services/api';
import '../../../css/ClientSettingsMobile.css';

// Types
interface UserData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    user_tier?: string;
}

interface SavedLocation {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
}

const ClientSettingsMobile: React.FC = () => {
    // State
    const [userData, setUserData] = useState<UserData | null>(null);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>('en');

    // Fetch settings data
    const fetchSettingsData = useCallback(async () => {
        try {
            const profileResult = await api.client.profile();
            if (profileResult.success || profileResult.data) {
                const user = profileResult.data?.user || profileResult.user || profileResult.data;
                setUserData(user);
                setNotificationCount(profileResult.data?.notification_count || profileResult.notification_count || 0);
            }
            
            // Fetch saved locations
            const locationsResult = await api.client.savedLocations();
            if (locationsResult.success || locationsResult.data) {
                setSavedLocations(locationsResult.data?.locations || locationsResult.locations || []);
            }
        } catch (error) {
            console.error('Error fetching settings data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = (enabled: boolean) => {
        setDarkMode(enabled);
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        // Save preference to API
        api.client.updatePreferences({ dark_mode: enabled }).catch(console.error);
    };

    // Change language
    const changeLanguage = (lang: string) => {
        setLanguage(lang);
        // Save preference to API
        api.client.updatePreferences({ language: lang }).catch(console.error);
    };

    // Edit profile
    const editProfile = () => {
        Swal.fire({
            title: 'Edit Profile',
            html: `
                <input type="text" id="profile-name" class="swal2-input" placeholder="Full Name" value="${userData?.full_name || ''}">
                <input type="email" id="profile-email" class="swal2-input" placeholder="Email" value="${userData?.email || ''}">
                <input type="tel" id="profile-phone" class="swal2-input" placeholder="Phone" value="${userData?.phone_number || ''}">
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const name = (document.getElementById('profile-name') as HTMLInputElement)?.value;
                const email = (document.getElementById('profile-email') as HTMLInputElement)?.value;
                const phone = (document.getElementById('profile-phone') as HTMLInputElement)?.value;
                return { full_name: name, email, phone_number: phone };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                try {
                    const data = await api.client.updateProfile(result.value);
                    Swal.close();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Profile Updated', timer: 1500, showConfirmButton: false }).then(() => {
                            fetchSettingsData();
                        });
                    }
                } catch (error) {
                    Swal.close();
                    Swal.fire({ icon: 'error', title: 'Update Failed', text: 'An error occurred while updating your profile', confirmButtonColor: '#ff5e00' });
                }
            }
        });
    };

    // Change password
    const changePassword = () => {
        Swal.fire({
            title: 'Change Password',
            html: `
                <input type="password" id="current-password" class="swal2-input" placeholder="Current Password">
                <input type="password" id="new-password" class="swal2-input" placeholder="New Password">
                <input type="password" id="confirm-password" class="swal2-input" placeholder="Confirm New Password">
            `,
            showCancelButton: true,
            confirmButtonText: 'Update Password',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const current = (document.getElementById('current-password') as HTMLInputElement)?.value;
                const newPass = (document.getElementById('new-password') as HTMLInputElement)?.value;
                const confirm = (document.getElementById('confirm-password') as HTMLInputElement)?.value;
                
                if (!current || !newPass || !confirm) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                if (newPass !== confirm) {
                    Swal.showValidationMessage('New passwords do not match');
                    return false;
                }
                if (newPass.length < 6) {
                    Swal.showValidationMessage('Password must be at least 6 characters');
                    return false;
                }
                return { current_password: current, new_password: newPass, confirm_password: confirm };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                try {
                    const data = await api.client.changePassword(result.value);
                    Swal.close();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Password Updated', text: 'Your password has been changed successfully', confirmButtonColor: '#ff5e00' });
                    }
                } catch (error: any) {
                    Swal.close();
                    Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to update password', confirmButtonColor: '#ff5e00' });
                }
            }
        });
    };

    // Manage payment methods
    const managePaymentMethods = () => {
        Swal.fire({
            title: 'Payment Methods',
            html: `
                <div class="payment-methods-container" style="text-align: left; max-height: 400px; overflow-y: auto;">
                    <div class="payment-method-item" style="padding: 12px; border: 1px solid #eee; border-radius: 12px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <i class="fas fa-credit-card" style="color: #ff5e00;"></i>
                                <strong>•••• 4242</strong>
                                <p style="font-size: 12px; color: #666;">Expires 12/28</p>
                            </div>
                            <span class="badge" style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 20px; font-size: 10px;">Default</span>
                        </div>
                    </div>
                    <button id="add-card-btn" style="width: 100%; padding: 12px; background: #ff5e00; color: white; border: none; border-radius: 12px; margin-top: 10px;">+ Add New Card</button>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close',
            didOpen: () => {
                const addBtn = document.getElementById('add-card-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', () => {
                        Swal.close();
                        Swal.fire({
                            title: 'Add Card',
                            html: `
                                <input type="text" id="card-number" class="swal2-input" placeholder="Card Number" maxlength="16">
                                <input type="text" id="card-name" class="swal2-input" placeholder="Name on Card">
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="expiry" class="swal2-input" placeholder="MM/YY" style="flex: 1;">
                                    <input type="text" id="cvv" class="swal2-input" placeholder="CVV" style="flex: 1;">
                                </div>
                            `,
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Add Card'
                        });
                    });
                }
            }
        });
    };

    // Ride preferences
    const ridePreferences = () => {
        Swal.fire({
            title: 'Ride Preferences',
            html: `
                <div style="text-align: left;">
                    <div class="preference-item" style="margin-bottom: 15px;">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>🌍 Preferred Language</span>
                            <select id="pref-language" class="swal2-select">
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </label>
                    </div>
                    <div class="preference-item" style="margin-bottom: 15px;">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            <span>🚗 Vehicle Type</span>
                            <select id="vehicle-type" class="swal2-select">
                                <option value="economy">Economy</option>
                                <option value="comfort">Comfort</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </label>
                    </div>
                    <div class="preference-item" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="share-eta"> Share ETA with contacts
                        </label>
                    </div>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Save Preferences'
        });
    };

    // Manage saved locations
    const manageSavedLocations = () => {
        let locationsHtml = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
        if (savedLocations.length === 0) {
            locationsHtml += '<p class="text-center text-gray-500">No saved locations yet</p>';
        } else {
            savedLocations.forEach((loc, index) => {
                locationsHtml += `
                    <div class="saved-location-item" style="padding: 12px; border: 1px solid #eee; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i class="fas fa-map-marker-alt" style="color: #ff5e00;"></i>
                            <strong>${loc.name}</strong>
                            <p style="font-size: 12px; color: #666;">${loc.address}</p>
                        </div>
                        <div>
                            <button class="edit-location-btn" data-id="${loc.id}" style="background: none; border: none; color: #ff5e00; margin-right: 8px; cursor: pointer;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-location-btn" data-id="${loc.id}" style="background: none; border: none; color: #ef4444; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        locationsHtml += '<button id="add-location-btn" style="width: 100%; padding: 12px; background: #ff5e00; color: white; border: none; border-radius: 12px; margin-top: 10px;">+ Add New Location</button></div>';
        
        Swal.fire({
            title: 'Saved Locations',
            html: locationsHtml,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close',
            didOpen: () => {
                const addBtn = document.getElementById('add-location-btn');
                if (addBtn) {
                    addBtn.addEventListener('click', () => {
                        Swal.close();
                        Swal.fire({
                            title: 'Add Location',
                            html: `
                                <input type="text" id="location-name" class="swal2-input" placeholder="Location Name (e.g., Home, Work)">
                                <input type="text" id="location-address" class="swal2-input" placeholder="Address">
                            `,
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Save Location'
                        });
                    });
                }
            }
        });
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const data = await api.notifications.list();
            const notifs = data.notifications || data.data?.notifications || [];
            
            if (notifs.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                notifs.forEach((notif: any) => {
                    html += `
                        <div style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p><strong>${notif.title || 'Notification'}</strong></p>
                            <p style="font-size: 13px; color: #666;">${notif.message || ''}</p>
                            <p style="font-size: 11px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';
                
                Swal.fire({
                    title: `Notifications (${notifs.length})`,
                    html: html,
                    icon: 'info',
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close'
                });
            } else {
                Swal.fire({ title: 'Notifications', text: 'No new notifications', icon: 'info', confirmButtonColor: '#ff5e00' });
            }
        } catch (error) {
            Swal.fire({ title: 'Notifications', text: 'No new notifications', icon: 'info', confirmButtonColor: '#ff5e00' });
        }
    };

    // Support
    const support = () => {
        Swal.fire({
            title: 'Support',
            html: `
                <div class="support-options" style="text-align: left;">
                    <div class="support-item" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.location.href='mailto:support@speedly.com'">
                        <i class="fas fa-envelope" style="color: #ff5e00; width: 30px;"></i> Email Support
                    </div>
                    <div class="support-item" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.open('https://speedly.com/faq', '_blank')">
                        <i class="fas fa-question-circle" style="color: #ff5e00; width: 30px;"></i> FAQ
                    </div>
                    <div class="support-item" style="padding: 12px; cursor: pointer;" onclick="window.open('https://speedly.com/terms', '_blank')">
                        <i class="fas fa-file-contract" style="color: #ff5e00; width: 30px;"></i> Terms & Conditions
                    </div>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close'
        });
    };

    // Logout
    const logout = () => {
        Swal.fire({
            title: 'Log Out',
            text: 'Are you sure you want to log out?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.auth.logout();
                } catch {
                    // Ignore API errors — clear locally regardless
                } finally {
                    setToken(null);
                    window.location.href = '/home';
                }
            }
        });
    };

    // Delete account
    const deleteAccount = () => {
        Swal.fire({
            title: 'Delete Account',
            html: `
                <p class="mb-4 text-gray-600">This action is permanent and cannot be undone.</p>
                <input type="text" id="delete-confirm" class="swal2-input" placeholder='Type "DELETE" to confirm'>
            `,
            showCancelButton: true,
            confirmButtonText: 'Delete Account',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const confirmText = (document.getElementById('delete-confirm') as HTMLInputElement)?.value;
                if (confirmText !== 'DELETE') {
                    Swal.showValidationMessage('Please type "DELETE" to confirm');
                    return false;
                }
                return true;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                try {
                    await api.auth.deleteAccount();
                    Swal.close();
                    Swal.fire({
                        icon: 'success',
                        title: 'Account Deleted',
                        text: 'Your account has been deleted successfully',
                        confirmButtonColor: '#ff5e00'
                    }).then(() => {
                        setToken(null);
                        window.location.href = '/home';
                    });
                } catch (error: any) {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Failed to delete account',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            }
        });
    };

    const userInitial = userData?.full_name?.charAt(0)?.toUpperCase() || 'U';
    const userTier = userData?.user_tier || 'Standard';

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    return (
        <>
            <style>{`
                /* Force full width - no white space */
                .mobile-settings-container {
                    width: 100vw !important;
                    max-width: 100vw !important;
                    min-width: 100vw !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    overflow-x: hidden !important;
                }
                
                .mobile-settings-view {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    padding-bottom: 80px !important;
                    min-height: 100vh !important;
                    width: 100% !important;
                    background: #f8f9fa !important;
                }
                
                /* Remove all side margins and paddings from all child elements */
                .mobile-settings-container * {
                    max-width: 100vw !important;
                }
                
                /* Ensure body and html have no margins */
                html, body, #app, .app-container, main {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    background: #f8f9fa !important;
                }
                
                /* Profile section - full width */
                .mobile-profile-section {
                    margin: 0 !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                    padding: 24px 20px !important;
                }
                
                /* Settings sections - full width */
                .mobile-settings-sections {
                    width: 100% !important;
                    padding: 0 !important;
                }
                
                /* Settings items - full width */
                .mobile-settings-item,
                .mobile-toggle-item,
                .mobile-dark-mode-toggle {
                    margin: 0 !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-top: 1px solid #f0f0f0 !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                    margin-bottom: -1px !important;
                }
                
                .settings-section {
                    width: 100% !important;
                    margin-bottom: 0 !important;
                }
                
                .mobile-section-header {
                    padding: 16px 20px !important;
                    background: #f8f9fa !important;
                }
                
                /* Card containers - full width with proper spacing */
                .settings-section {
                    background: white !important;
                    margin-bottom: 12px !important;
                }
                
                /* Action buttons - full width with padding */
                .mobile-action-buttons {
                    padding: 20px !important;
                    width: 100% !important;
                }
                
                /* Language options - adjust for full width */
                .mobile-language-options {
                    padding: 0 20px 16px 20px !important;
                }
                
                /* Fix for iOS Safari viewport */
                @supports (-webkit-touch-callout: none) {
                    .mobile-settings-view {
                        height: -webkit-fill-available !important;
                    }
                }
            `}</style>
            
            <div className="mobile-settings-container">
                <div className="mobile-settings-view">
                    {/* Header */}
                    <div className="mobile-settings-header">
                        <div>
                            <h1>Settings</h1>
                            <p>Manage your account preferences</p>
                        </div>
                        <button className="mobile-settings-notification-btn" onClick={checkNotifications}>
                            <i className="fas fa-bell"></i>
                            {notificationCount > 0 && <span className="mobile-notification-badge font-roboto-number">{notificationCount}</span>}
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="mobile-profile-section">
                        <div className="mobile-profile-avatar">
                            {userInitial}
                            <button className="edit-btn" onClick={editProfile}>
                                <i className="fas fa-camera"></i>
                            </button>
                        </div>
                        <div className="mobile-profile-name">{userData?.full_name || 'Client'}</div>
                        <div className="mobile-profile-email">{userData?.email || 'client@example.com'}</div>
                        <div className="mobile-profile-tier">
                            <i className="fas fa-crown"></i> {userTier} Tier
                        </div>
                    </div>

                    {/* Settings Sections */}
                    <div className="mobile-settings-sections">
                        {/* Account Settings */}
                        <div className="settings-section">
                            <div className="mobile-section-header">
                                <i className="fas fa-user-circle"></i>
                                <h2>Account Settings</h2>
                            </div>
                            
                            <div className="mobile-settings-item" onClick={editProfile}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-user"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Personal Information</h3>
                                        <p>Name, email, phone</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={changePassword}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-lock"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Login & Security</h3>
                                        <p>Password, security</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={managePaymentMethods}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-credit-card"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Payment Methods</h3>
                                        <p>0 saved methods</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={ridePreferences}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-cog"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Ride Preferences</h3>
                                        <p>Vehicle type, language</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={manageSavedLocations}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-map-marker-alt"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Saved Locations</h3>
                                        <p>{savedLocations.length} saved places</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="settings-section">
                            <div className="mobile-section-header">
                                <i className="fas fa-sliders-h"></i>
                                <h2>Preferences</h2>
                            </div>
                            
                            <div className="mobile-dark-mode-toggle">
                                <div className="mobile-dark-mode-info">
                                    <h3>Dark Mode</h3>
                                    <p>Switch between light and dark theme</p>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={darkMode} 
                                        onChange={(e) => toggleDarkMode(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="mobile-section-header" style={{ marginTop: 8 }}>
                                <i className="fas fa-globe"></i>
                                <h2>Language</h2>
                            </div>
                            <div className="mobile-language-options">
                                <button 
                                    className={`mobile-lang-btn ${language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    English
                                </button>
                                <button 
                                    className={`mobile-lang-btn ${language === 'es' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('es')}
                                >
                                    Español
                                </button>
                                <button 
                                    className={`mobile-lang-btn ${language === 'fr' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('fr')}
                                >
                                    Français
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="settings-section">
                            <div className="mobile-section-header">
                                <i className="fas fa-bell"></i>
                                <h2>Notifications</h2>
                            </div>
                            
                            <div className="mobile-toggle-item">
                                <label className="toggle-label">
                                    <i className="fas fa-envelope"></i>
                                    <span>Email Notifications</span>
                                </label>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="mobile-toggle-item">
                                <label className="toggle-label">
                                    <i className="fas fa-bell"></i>
                                    <span>Push Notifications</span>
                                </label>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="mobile-toggle-item">
                                <label className="toggle-label">
                                    <i className="fas fa-sms"></i>
                                    <span>SMS Alerts</span>
                                </label>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="settings-section">
                            <div className="mobile-section-header">
                                <i className="fas fa-question-circle"></i>
                                <h2>Support</h2>
                            </div>
                            
                            <div className="mobile-settings-item" onClick={support}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-headset"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Help Center</h3>
                                        <p>FAQs, support, contact us</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'About Speedly',
                                    html: `
                                        <div style="text-align: center;">
                                            <img src="/main-assets/logo-no-background.png" alt="Speedly" style="max-width: 120px; margin-bottom: 20px;">
                                            <h3 style="font-size: 20px; font-weight: bold;">Speedly</h3>
                                            <p>Version 2.5.1</p>
                                            <p class="text-gray-500 mt-2">© 2026 Speedly. All rights reserved.</p>
                                        </div>
                                    `,
                                    confirmButtonColor: '#ff5e00'
                                });
                            }}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-info-circle"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>About Speedly</h3>
                                        <p>Version 2.5.1 • Ride-hailing app</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>

                            <div className="mobile-settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Legal',
                                    html: `
                                        <div class="legal-options" style="text-align: left;">
                                            <div class="legal-item" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.open('https://speedly.com/privacy', '_blank')">
                                                📋 Privacy Policy
                                            </div>
                                            <div class="legal-item" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;" onclick="window.open('https://speedly.com/terms', '_blank')">
                                                📄 Terms of Service
                                            </div>
                                            <div class="legal-item" style="padding: 12px; cursor: pointer;" onclick="window.open('https://speedly.com/cookies', '_blank')">
                                                🍪 Cookie Policy
                                            </div>
                                        </div>
                                    `,
                                    confirmButtonColor: '#ff5e00',
                                    didOpen: () => {
                                        document.querySelectorAll('.legal-item').forEach(item => {
                                            item.addEventListener('click', () => Swal.close());
                                        });
                                    }
                                });
                            }}>
                                <div className="mobile-item-info">
                                    <div className="mobile-item-icon"><i className="fas fa-gavel"></i></div>
                                    <div className="mobile-item-details">
                                        <h3>Legal</h3>
                                        <p>Privacy, terms, cookies</p>
                                    </div>
                                </div>
                                <div className="mobile-item-action"><i className="fas fa-chevron-right"></i></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mobile-action-buttons">
                            <button className="mobile-logout-btn" onClick={logout}>
                                <i className="fas fa-sign-out-alt"></i> Log Out
                            </button>
                            <button className="mobile-delete-account-btn" onClick={deleteAccount}>
                                <i className="fas fa-trash-alt"></i> Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation — outside scrollable view so fixed-position works */}
                <ClientNavMobile />
            </div>
        </>
    );
};

export default ClientSettingsMobile;