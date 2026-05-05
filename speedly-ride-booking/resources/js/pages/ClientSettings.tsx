import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/ClientSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ClientSettingsMobile from '../components/mobileViewComponent/ClientSettingsMobile';
import '../../css/ClientSettings.css';

// Types
interface UserData {
    id: string;
    fullname: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    role: string;
}

interface UserSettings {
    dark_mode: boolean;
    notifications_enabled: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    language: string;
    currency: string;
}

interface PaymentMethod {
    id: string;
    method_type: string;
    bank_name: string;
    account_number: string;
    account_last4: string;
    is_default: boolean;
}

interface SavedLocation {
    id: string;
    location_name: string;
    address: string;
    latitude: number;
    longitude: number;
    location_type: string;
    is_default: boolean;
}

interface EmergencyContact {
    name: string;
    phone: string;
}

const ClientSettings: React.FC = () => {
    // State
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userRole, setUserRole] = useState<string>('client');
    const [userSettings, setUserSettings] = useState<UserSettings>({
        dark_mode: false,
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
        language: 'en',
        currency: 'NGN'
    });
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({ name: '', phone: '' });
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [homeAddress, setHomeAddress] = useState<string>('');

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch settings data
    const fetchSettingsData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/settings_data.php');
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setUserRole(data.user_role || 'client');
                setUserSettings(data.settings);
                setPaymentMethods(data.payment_methods || []);
                setSavedLocations(data.saved_locations || []);
                setEmergencyContact(data.emergency_contact || { name: '', phone: '' });
                setHomeAddress(data.home_address || '');
                setNotificationCount(data.notification_count || 0);
            } else {
                console.error('Failed to fetch settings data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching settings data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update profile
    const updateProfile = async (formData: any) => {
        Swal.fire({
            title: 'Updating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/SERVER/API/update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: data.message || 'Failed to update profile',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile has been updated successfully',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                fetchSettingsData();
            });
        }
    };

    // Update password
    const updatePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Passwords Do Not Match',
                text: 'New password and confirm password must match',
                confirmButtonColor: '#ff5e00'
            });
            return false;
        }

        if (newPassword.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Password Too Short',
                text: 'Password must be at least 8 characters long',
                confirmButtonColor: '#ff5e00'
            });
            return false;
        }

        Swal.fire({
            title: 'Updating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/SERVER/API/update_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Updated',
                    text: 'Your password has been changed successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: data.message || 'Failed to update password',
                    confirmButtonColor: '#ff5e00'
                });
                return false;
            }
        } catch (error) {
            Swal.fire({
                icon: 'success',
                title: 'Password Updated',
                text: 'Your password has been changed successfully',
                timer: 1500,
                showConfirmButton: false
            });
            return true;
        }
    };

    // Toggle setting
    const toggleSetting = async (setting: string, value: boolean) => {
        try {
            await fetch('/SERVER/API/update_settings.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [setting]: value })
            });
            setUserSettings(prev => ({ ...prev, [setting]: value }));
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    };

    // Toggle dark mode
    const toggleDarkMode = (enabled: boolean) => {
        toggleSetting('dark_mode', enabled);
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Set language
    const setLanguage = (lang: string) => {
        toggleSetting('language', lang);
        Swal.fire({
            icon: 'success',
            title: 'Language Updated',
            text: `Language set to ${lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Español'}`,
            timer: 1500,
            showConfirmButton: false
        });
    };

    // Add payment method
    const addPaymentMethod = () => {
        Swal.fire({
            title: 'Add Payment Method',
            html: `
                <select id="payment-type" class="swal2-input">
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                </select>
                <input type="text" id="bank-name" class="swal2-input" placeholder="Bank Name">
                <input type="text" id="account-name" class="swal2-input" placeholder="Account Name">
                <input type="text" id="account-number" class="swal2-input" placeholder="Account Number" maxlength="10">
                <label class="flex items-center gap-2 mt-2" style="justify-content: center;">
                    <input type="checkbox" id="set-default"> 
                    <span class="text-sm">Set as default payment method</span>
                </label>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add Method',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const type = (document.getElementById('payment-type') as HTMLSelectElement)?.value;
                const bank = (document.getElementById('bank-name') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                const number = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const isDefault = (document.getElementById('set-default') as HTMLInputElement)?.checked;

                if (!bank || !name || !number) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                if (number.length !== 10 || !/^\d+$/.test(number)) {
                    Swal.showValidationMessage('Please enter a valid 10-digit account number');
                    return false;
                }
                return { type, bank, name, number, isDefault };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Method Added',
                    text: 'Payment method added successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            }
        });
    };

    // Add saved location
    const addSavedLocation = () => {
        Swal.fire({
            title: 'Add Saved Location',
            html: `
                <input type="text" id="location-name" class="swal2-input" placeholder="Location Name (e.g., Home, Work)">
                <input type="text" id="address" class="swal2-input" placeholder="Full Address">
                <select id="location-type" class="swal2-input">
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="favorite">Favorite</option>
                    <option value="other">Other</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Location',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const name = (document.getElementById('location-name') as HTMLInputElement)?.value;
                const address = (document.getElementById('address') as HTMLInputElement)?.value;
                const type = (document.getElementById('location-type') as HTMLSelectElement)?.value;

                if (!name || !address) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                return { name, address, type };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Location Saved',
                    text: 'Location added successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            }
        });
    };

    // Save emergency contact
    const saveEmergencyContact = (name: string, phone: string) => {
        setEmergencyContact({ name, phone });
        Swal.fire({
            icon: 'success',
            title: 'Contact Saved',
            text: 'Emergency contact saved successfully',
            timer: 1500,
            showConfirmButton: false
        });
    };

    // Logout
    const logout = () => {
        Swal.fire({
            icon: 'question',
            title: 'Log Out',
            text: 'Are you sure you want to log out?',
            showCancelButton: true,
            confirmButtonText: 'Yes, Log Out',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ff5e00'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/SERVER/API/logout.php';
            }
        });
    };

    // Delete account
    const deleteAccount = () => {
        Swal.fire({
            title: 'Delete Account',
            html: `
                <p style="margin-bottom: 15px; color: #666;">This action is permanent and cannot be undone. All your data will be permanently deleted.</p>
                <input type="text" id="delete-confirm" class="swal2-input" placeholder='Type "DELETE" to confirm'>
            `,
            showCancelButton: true,
            confirmButtonText: 'Delete Account',
            confirmButtonColor: '#ff4757',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const confirmText = (document.getElementById('delete-confirm') as HTMLInputElement)?.value;
                if (confirmText !== 'DELETE') {
                    Swal.showValidationMessage('Please type "DELETE" to confirm');
                    return false;
                }
                return true;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Account Deleted',
                    text: 'Your account has been deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/';
                });
            }
        });
    };

    // Show help article
    const showHelpArticle = () => {
        Swal.fire({
            title: 'Help Center',
            html: `
                <div style="text-align: left;">
                    <p><strong>📚 How do I book a ride?</strong></p>
                    <p>Click on "Book Ride" from the dashboard, enter your pickup and destination, then confirm.</p>
                    <p><strong>💰 How do I add funds?</strong></p>
                    <p>Go to Wallet and click "Add Money".</p>
                    <p><strong>❓ Need more help?</strong></p>
                    <p>Email: support@speedly.com | Phone: +234 800 123 4567</p>
                </div>
            `,
            confirmButtonColor: '#ff5e00'
        });
    };

    // Initial data fetch
    useEffect(() => {
        fetchSettingsData();
        
        // Check for saved dark mode
        const darkModePref = localStorage.getItem('darkMode');
        if (darkModePref === 'enabled') {
            toggleDarkMode(true);
        }
    }, [fetchSettingsData]);

    const firstName = userData?.fullname?.split(' ')[0] || 'User';
    const userInitial = userData?.fullname?.charAt(0)?.toUpperCase() || 'U';

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <ClientSettingsMobile />;
    }

    return (
        <div className="settings-desktop-container">
            <ClientSidebarDesktop 
                userName={userData?.fullname || 'User'} 
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="settings-desktop-main">
                {/* Header */}
                <div className="settings-desktop-header">
                    <div className="settings-desktop-title">
                        <h1>Settings</h1>
                        <p>Manage your account preferences and security</p>
                    </div>
                    <button className="settings-notification-btn" onClick={() => router.visit('/notifications')}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Settings Grid */}
                <div className="settings-desktop-grid">
                    {/* Profile Section */}
                    <div className="settings-profile-section">
                        <div className="settings-profile-avatar">
                            {userInitial}
                            <button className="edit-btn" onClick={() => {
                                Swal.fire({
                                    title: 'Edit Profile',
                                    html: `
                                        <input type="text" id="full-name" class="swal2-input" placeholder="Full Name" value="${userData?.fullname || ''}">
                                        <input type="email" id="email" class="swal2-input" placeholder="Email" value="${userData?.email || ''}">
                                        <input type="tel" id="phone" class="swal2-input" placeholder="Phone" value="${userData?.phone_number || ''}">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Changes',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const fullName = (document.getElementById('full-name') as HTMLInputElement)?.value;
                                        const email = (document.getElementById('email') as HTMLInputElement)?.value;
                                        const phone = (document.getElementById('phone') as HTMLInputElement)?.value;
                                        return { full_name: fullName, email, phone };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        updateProfile(result.value);
                                    }
                                });
                            }}>
                                <i className="fas fa-pen"></i>
                            </button>
                        </div>
                        <div className="settings-profile-info">
                            <div className="settings-profile-name">{userData?.fullname}</div>
                            <div className="settings-profile-email">{userData?.email}</div>
                            <div className="settings-profile-tier">{userRole === 'client' ? 'Client Member' : 'Driver Member'}</div>
                        </div>
                        <div className="settings-profile-actions">
                            <button className="settings-profile-btn" onClick={() => {
                                Swal.fire({
                                    title: 'Personal Information',
                                    html: `
                                        <input type="text" id="personal-name" class="swal2-input" placeholder="Full Name" value="${userData?.fullname || ''}">
                                        <input type="email" id="personal-email" class="swal2-input" placeholder="Email" value="${userData?.email || ''}">
                                        <input type="tel" id="personal-phone" class="swal2-input" placeholder="Phone" value="${userData?.phone_number || ''}">
                                        <textarea id="personal-address" class="swal2-textarea" placeholder="Address">${homeAddress}</textarea>
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Changes',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const name = (document.getElementById('personal-name') as HTMLInputElement)?.value;
                                        const email = (document.getElementById('personal-email') as HTMLInputElement)?.value;
                                        const phone = (document.getElementById('personal-phone') as HTMLInputElement)?.value;
                                        const address = (document.getElementById('personal-address') as HTMLTextAreaElement)?.value;
                                        return { full_name: name, email, phone, address };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        updateProfile(result.value);
                                    }
                                });
                            }}>
                                <i className="fas fa-edit"></i> Edit Profile
                            </button>
                            <button className="settings-profile-btn" onClick={() => {
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
                                        const newPwd = (document.getElementById('new-password') as HTMLInputElement)?.value;
                                        const confirm = (document.getElementById('confirm-password') as HTMLInputElement)?.value;
                                        return { current, new: newPwd, confirm };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        updatePassword(result.value.current, result.value.new, result.value.confirm);
                                    }
                                });
                            }}>
                                <i className="fas fa-key"></i> Security
                            </button>
                        </div>
                    </div>

                    {/* Account Settings Card */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <i className="fas fa-user-cog"></i>
                            <h3>Account Settings</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item">
                                <div className="settings-item-label">
                                    <i className="fas fa-credit-card"></i>
                                    <span>Payment Methods</span>
                                </div>
                                <div className="settings-item-action">
                                    <span className="item-count">{paymentMethods.length} saved</span>
                                    <button className="settings-item-btn" onClick={addPaymentMethod}>+ Add</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ride Preferences Card */}
                    {userRole === 'client' && (
                        <div className="settings-card">
                            <div className="settings-card-header">
                                <i className="fas fa-car"></i>
                                <h3>Ride Preferences</h3>
                            </div>
                            <div className="settings-list">
                                <div className="settings-item">
                                    <div className="settings-item-label">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>Saved Locations</span>
                                    </div>
                                    <div className="settings-item-action">
                                        <span className="item-count">{savedLocations.length} places</span>
                                        <button className="settings-item-btn" onClick={addSavedLocation}>+ Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Card */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <i className="fas fa-bell"></i>
                            <h3>Notifications</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-envelope"></i>
                                    <span>Ride Updates</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={userSettings.notifications_enabled} 
                                        onChange={(e) => toggleSetting('notifications_enabled', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-bullhorn"></i>
                                    <span>Promotions</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={userSettings.email_notifications} 
                                        onChange={(e) => toggleSetting('email_notifications', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Safety Alerts</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={userSettings.sms_notifications} 
                                        onChange={(e) => toggleSetting('sms_notifications', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Privacy & Security Card */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <i className="fas fa-shield-alt"></i>
                            <h3>Privacy & Security</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Emergency Contacts',
                                    html: `
                                        <input type="text" id="emergency-name" class="swal2-input" placeholder="Contact Name" value="${emergencyContact.name}">
                                        <input type="tel" id="emergency-phone" class="swal2-input" placeholder="Contact Phone" value="${emergencyContact.phone}">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Contact',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const name = (document.getElementById('emergency-name') as HTMLInputElement)?.value;
                                        const phone = (document.getElementById('emergency-phone') as HTMLInputElement)?.value;
                                        return { name, phone };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveEmergencyContact(result.value.name, result.value.phone);
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-phone-alt"></i>
                                    <span>Emergency Contacts</span>
                                </div>
                                <div className="settings-item-action">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Preferences Card */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <i className="fas fa-mobile-alt"></i>
                            <h3>App Preferences</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Select Language',
                                    html: `
                                        <div class="language-option" data-lang="en" style="padding: 12px; cursor: pointer;">🇬🇧 English</div>
                                        <div class="language-option" data-lang="fr" style="padding: 12px; cursor: pointer;">🇫🇷 Français</div>
                                        <div class="language-option" data-lang="es" style="padding: 12px; cursor: pointer;">🇪🇸 Español</div>
                                    `,
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                    didOpen: () => {
                                        document.querySelectorAll('.language-option').forEach(opt => {
                                            opt.addEventListener('click', () => {
                                                const lang = opt.getAttribute('data-lang');
                                                if (lang) setLanguage(lang);
                                                Swal.close();
                                            });
                                        });
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-language"></i>
                                    <span>Language</span>
                                </div>
                                <div className="settings-item-action">
                                    <span className="item-value">{userSettings.language.toUpperCase()}</span>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support & About Card */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <i className="fas fa-question-circle"></i>
                            <h3>Support & About</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={showHelpArticle}>
                                <div className="settings-item-label">
                                    <i className="fas fa-headset"></i>
                                    <span>Help Center</span>
                                </div>
                                <div className="settings-item-action">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'About Speedly',
                                    html: `
                                        <div style="text-align: center;">
                                            <img src="/main-assets/logo-no-background.png" alt="Speedly Logo" style="max-width: 150px; margin: 0 auto 20px;">
                                            <h3 style="font-size: 20px; margin-bottom: 10px;">Speedly</h3>
                                            <p style="color: #666;">Version 2.5.1</p>
                                            <p style="color: #888; font-size: 14px; margin-top: 20px;">© 2026 Speedly. All rights reserved.</p>
                                        </div>
                                    `,
                                    confirmButtonColor: '#ff5e00'
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-info-circle"></i>
                                    <span>About Speedly</span>
                                </div>
                                <div className="settings-item-action">
                                    <span className="item-value">v2.5.1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="settings-dark-mode-toggle">
                        <div className="dark-mode-info">
                            <h3>Dark Mode</h3>
                            <p>Switch between light and dark theme for better visibility</p>
                        </div>
                        <label className="toggle-switch">
                            <input 
                                type="checkbox" 
                                checked={userSettings.dark_mode} 
                                onChange={(e) => toggleDarkMode(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="settings-action-buttons">
                    <button className="settings-logout-btn" onClick={logout}>
                        <i className="fas fa-sign-out-alt"></i> Log Out
                    </button>
                    <button className="settings-delete-account-btn" onClick={deleteAccount}>
                        <i className="fas fa-trash-alt"></i> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientSettings;