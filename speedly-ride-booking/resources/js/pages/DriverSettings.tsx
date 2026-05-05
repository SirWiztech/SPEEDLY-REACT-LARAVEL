import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import DriverSettingsMobile from '../components/mobileViewComponent/DriverSettingsMobile';
import '../../css/DriverSettings.css';

// Types
interface DriverData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    date_of_birth: string;
    gender: string;
    driver_status: string;
    verification_status: string;
    created_at: string;
}

interface LicenseData {
    license_number: string;
    license_expiry: string;
}

interface VehicleData {
    vehicle_id: string;
    vehicle_model: string;
    vehicle_year: string;
    vehicle_color: string;
    plate_number: string;
    vehicle_type: string;
    passenger_capacity: number;
    insurance_expiry: string;
    road_worthiness_expiry: string;
    vehicle_active: boolean;
}

interface BankDetails {
    id: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    is_default: boolean;
}

interface NotificationSettings {
    ride_requests: boolean;
    earnings_notif: boolean;
    sound_alerts: boolean;
    promotions: boolean;
}

interface Schedule {
    day_of_week: number;
    is_available: boolean;
    start_time: string;
    end_time: string;
}

const DriverSettings: React.FC = () => {
    // State
    const [driverData, setDriverData] = useState<DriverData | null>(null);
    const [licenseData, setLicenseData] = useState<LicenseData>({
        license_number: '',
        license_expiry: ''
    });
    const [vehicleData, setVehicleData] = useState<VehicleData>({
        vehicle_id: '',
        vehicle_model: '',
        vehicle_year: '',
        vehicle_color: '',
        plate_number: '',
        vehicle_type: 'economy',
        passenger_capacity: 4,
        insurance_expiry: '',
        road_worthiness_expiry: '',
        vehicle_active: true
    });
    const [bankAccounts, setBankAccounts] = useState<BankDetails[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        ride_requests: true,
        earnings_notif: true,
        sound_alerts: true,
        promotions: false
    });
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [todayEarnings, setTodayEarnings] = useState<number>(0);
    const [totalEarnings, setTotalEarnings] = useState<number>(0);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [driverStatus, setDriverStatus] = useState<string>('offline');

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch driver settings data
    const fetchSettingsData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/driver_settings_data.php');
            const data = await response.json();

            if (data.success) {
                setDriverData(data.driver);
                setLicenseData(data.license);
                setVehicleData(data.vehicle);
                setBankAccounts(data.bank_accounts || []);
                setNotificationSettings(data.notification_settings);
                setSchedule(data.schedule || []);
                setTodayEarnings(data.today_earnings || 0);
                setTotalEarnings(data.total_earnings || 0);
                setNotificationCount(data.notification_count || 0);
                setDriverStatus(data.driver_status || 'offline');
            } else {
                console.error('Failed to fetch settings data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching settings data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Save driver profile
    const saveDriverProfile = async (formData: any) => {
        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/SERVER/API/update_driver_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your driver profile has been updated',
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
                text: 'Your driver profile has been updated',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                fetchSettingsData();
            });
        }
    };

    // Save license information
    const saveLicense = async (licenseNumber: string, licenseExpiry: string) => {
        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/SERVER/API/update_license.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ license_number: licenseNumber, license_expiry: licenseExpiry })
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'License Saved',
                    text: 'License information updated',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to save license',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'success',
                title: 'License Saved',
                text: 'License information updated',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                fetchSettingsData();
            });
        }
    };

    // Save vehicle details
    const saveVehicle = async (vehicleData: any) => {
        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const response = await fetch('/SERVER/API/update_vehicle.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vehicleData)
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Vehicle Saved',
                    text: 'Vehicle information updated',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to save vehicle',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'success',
                title: 'Vehicle Saved',
                text: 'Vehicle information updated',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                fetchSettingsData();
            });
        }
    };

    // Save bank details
    const saveBankDetails = async (bankName: string, accountNumber: string, accountName: string) => {
        if (accountNumber.length !== 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Account',
                text: 'Please enter a valid 10-digit account number',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Saving...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const formData = new FormData();
        formData.append('bank_name', bankName);
        formData.append('account_number', accountNumber);
        formData.append('account_name', accountName);

        try {
            const response = await fetch('/SERVER/API/save_bank_details.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Bank Details Saved',
                    text: 'Your bank information has been saved',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchSettingsData();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to save bank details',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to connect to server',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Set default bank
    const setDefaultBank = (bankId: string) => {
        Swal.fire({
            title: 'Set as Default?',
            text: 'Make this your default bank account for withdrawals',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Yes, set as default'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch('/SERVER/API/set_default_bank.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bank_id: bankId })
                    });
                    const data = await response.json();

                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Default Set',
                            text: 'Default bank updated',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            fetchSettingsData();
                        });
                    }
                } catch (error) {
                    console.error('Error setting default bank:', error);
                }
            }
        });
    };

    // Toggle notification setting
    const toggleSetting = (setting: keyof NotificationSettings, value: boolean) => {
        setNotificationSettings(prev => ({ ...prev, [setting]: value }));
        
        fetch('/SERVER/API/update_driver_settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [setting]: value })
        }).catch(error => console.error('Error updating setting:', error));
    };

    // Save schedule
    const saveSchedule = (scheduleData: any) => {
        Swal.fire({
            icon: 'success',
            title: 'Schedule Saved',
            text: 'Your work schedule has been updated',
            timer: 1500,
            showConfirmButton: false
        });
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
                            <p style="font-size: 13px; color: #666;">${notif.message || ''}</p>
                            <p style="font-size: 11px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';

                Swal.fire({
                    title: `Notifications (${data.notifications.length})`,
                    html: html,
                    icon: 'info',
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close'
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
                <p class="mb-4 text-gray-600">This action is permanent and cannot be undone. All your driver data will be permanently deleted.</p>
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
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                setTimeout(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Account Deleted',
                        text: 'Your driver account has been deleted',
                        confirmButtonColor: '#ff5e00'
                    }).then(() => {
                        window.location.href = '/form.php';
                    });
                }, 2000);
            }
        });
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const firstName = driverData?.full_name?.split(' ')[0] || 'Driver';
    const userInitial = driverData?.full_name?.charAt(0)?.toUpperCase() || 'D';

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <DriverSettingsMobile />;
    }

    return (
        <div className="driver-settings-desktop-container">
            <DriverSidebarDesktop 
                userName={driverData?.full_name || 'Driver'} 
                userRole="driver"
                profilePictureUrl={driverData?.profile_picture_url}
                driverStatus={driverStatus}
                verificationStatus={driverData?.verification_status || 'pending'}
            />

            <div className="driver-settings-desktop-main">
                {/* Header */}
                <div className="driver-settings-header">
                    <div className="driver-settings-title">
                        <h1>Driver Settings</h1>
                        <p>Manage your driver account, vehicle, and preferences</p>
                    </div>
                    <button className="driver-settings-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Driver Status Card */}
                <div className="driver-status-card">
                    <div className="driver-avatar-large">
                        {userInitial}
                    </div>
                    <div className="driver-info">
                        <h2>{driverData?.full_name}</h2>
                        <p>{driverData?.email} • {driverData?.phone_number}</p>
                        <div className="driver-badges">
                            <span className={`driver-badge ${driverData?.verification_status === 'approved' ? 'verified' : 'pending'}`}>
                                {driverData?.verification_status === 'approved' ? '✓ Verified Driver' : '⏳ Pending Verification'}
                            </span>
                            <span className={`driver-badge ${driverStatus === 'online' ? 'online' : 'offline'}`} id="desktopStatusDisplay">
                                {driverStatus === 'online' ? (
                                    <>
                                        <span className="status-dot online"></span> Online
                                    </>
                                ) : (
                                    <>
                                        <span className="status-dot offline"></span> Offline
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                    <button className="driver-edit-btn" onClick={() => {
                        Swal.fire({
                            title: 'Edit Driver Profile',
                            html: `
                                <input type="text" id="profile-name" class="swal2-input" placeholder="Full Name" value="${driverData?.full_name || ''}">
                                <input type="email" id="profile-email" class="swal2-input" placeholder="Email" value="${driverData?.email || ''}">
                                <input type="tel" id="profile-phone" class="swal2-input" placeholder="Phone" value="${driverData?.phone_number || ''}">
                                <input type="date" id="profile-dob" class="swal2-input" placeholder="Date of Birth" value="${driverData?.date_of_birth || ''}">
                                <select id="profile-gender" class="swal2-input">
                                    <option value="male" ${driverData?.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${driverData?.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${driverData?.gender === 'other' ? 'selected' : ''}>Other</option>
                                    <option value="prefer-not-to-say" ${driverData?.gender === 'prefer-not-to-say' ? 'selected' : ''}>Prefer not to say</option>
                                </select>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'Save Changes',
                            confirmButtonColor: '#ff5e00',
                            preConfirm: () => {
                                const name = (document.getElementById('profile-name') as HTMLInputElement)?.value;
                                const email = (document.getElementById('profile-email') as HTMLInputElement)?.value;
                                const phone = (document.getElementById('profile-phone') as HTMLInputElement)?.value;
                                const dob = (document.getElementById('profile-dob') as HTMLInputElement)?.value;
                                const gender = (document.getElementById('profile-gender') as HTMLSelectElement)?.value;
                                return { full_name: name, email, phone, date_of_birth: dob, gender };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                saveDriverProfile(result.value);
                            }
                        });
                    }}>
                        <i className="fas fa-edit"></i> Edit Profile
                    </button>
                </div>

                {/* Settings Grid */}
                <div className="driver-settings-grid">
                    {/* Driver Account */}
                    <div className="settings-card">
                        <div className="card-header">
                            <i className="fas fa-id-card"></i>
                            <h3>Driver Account</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Driver Profile',
                                    html: `
                                        <div class="text-center mb-4">
                                            <div class="profile-avatar-large">${userInitial}</div>
                                            <p class="text-sm text-gray-500 mt-2">${driverData?.full_name}</p>
                                        </div>
                                        <div class="info-row"><strong>Email:</strong> ${driverData?.email}</div>
                                        <div class="info-row"><strong>Phone:</strong> ${driverData?.phone_number}</div>
                                        <div class="info-row"><strong>Member Since:</strong> ${new Date(driverData?.created_at || '').toLocaleDateString()}</div>
                                    `,
                                    confirmButtonColor: '#ff5e00'
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-user"></i>
                                    <span>Driver Profile</span>
                                </div>
                                <div className="settings-item-action">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'License Information',
                                    html: `
                                        <input type="text" id="license-number" class="swal2-input" placeholder="License Number" value="${licenseData.license_number}">
                                        <input type="date" id="license-expiry" class="swal2-input" placeholder="Expiry Date" value="${licenseData.license_expiry}">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save License',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const number = (document.getElementById('license-number') as HTMLInputElement)?.value;
                                        const expiry = (document.getElementById('license-expiry') as HTMLInputElement)?.value;
                                        return { number, expiry };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveLicense(result.value.number, result.value.expiry);
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-id-card"></i>
                                    <span>License Info</span>
                                </div>
                                <div className="settings-item-action">
                                    <span className="item-badge">{licenseData.license_number ? 'Added' : 'Not added'}</span>
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Bank Details',
                                    html: `
                                        <select id="bank-name" class="swal2-input">
                                            <option value="">Select Bank</option>
                                            <option value="Access Bank">Access Bank</option>
                                            <option value="GTBank">GTBank</option>
                                            <option value="First Bank">First Bank</option>
                                            <option value="UBA">UBA</option>
                                            <option value="Zenith">Zenith Bank</option>
                                        </select>
                                        <input type="text" id="account-number" class="swal2-input" placeholder="Account Number" maxlength="10">
                                        <input type="text" id="account-name" class="swal2-input" placeholder="Account Name">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Bank',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const bank = (document.getElementById('bank-name') as HTMLSelectElement)?.value;
                                        const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                                        const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                                        if (!bank || !account || !name) {
                                            Swal.showValidationMessage('Please fill all fields');
                                            return false;
                                        }
                                        return { bank, account, name };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveBankDetails(result.value.bank, result.value.account, result.value.name);
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-university"></i>
                                    <span>Bank Details</span>
                                </div>
                                <div className="settings-item-action">
                                    {bankAccounts.length > 0 && (
                                        <span className="item-badge">Saved</span>
                                    )}
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="settings-card">
                        <div className="card-header">
                            <i className="fas fa-car"></i>
                            <h3>Vehicle Information</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Vehicle Details',
                                    html: `
                                        <input type="text" id="vehicle-model" class="swal2-input" placeholder="Model" value="${vehicleData.vehicle_model}">
                                        <input type="text" id="vehicle-year" class="swal2-input" placeholder="Year" value="${vehicleData.vehicle_year}">
                                        <input type="text" id="vehicle-color" class="swal2-input" placeholder="Color" value="${vehicleData.vehicle_color}">
                                        <input type="text" id="plate-number" class="swal2-input" placeholder="Plate Number" value="${vehicleData.plate_number}">
                                        <select id="vehicle-type" class="swal2-input">
                                            <option value="economy" ${vehicleData.vehicle_type === 'economy' ? 'selected' : ''}>Economy</option>
                                            <option value="comfort" ${vehicleData.vehicle_type === 'comfort' ? 'selected' : ''}>Comfort</option>
                                        </select>
                                        <input type="number" id="passenger-capacity" class="swal2-input" placeholder="Passenger Capacity" value="${vehicleData.passenger_capacity}">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Vehicle',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const model = (document.getElementById('vehicle-model') as HTMLInputElement)?.value;
                                        const year = (document.getElementById('vehicle-year') as HTMLInputElement)?.value;
                                        const color = (document.getElementById('vehicle-color') as HTMLInputElement)?.value;
                                        const plate = (document.getElementById('plate-number') as HTMLInputElement)?.value;
                                        const type = (document.getElementById('vehicle-type') as HTMLSelectElement)?.value;
                                        const capacity = parseInt((document.getElementById('passenger-capacity') as HTMLInputElement)?.value);
                                        return { model, year, color, plate, type, capacity };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveVehicle(result.value);
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-truck"></i>
                                    <span>Vehicle Details</span>
                                </div>
                                <div className="settings-item-action">
                                    {vehicleData.plate_number && (
                                        <span className="item-badge">{vehicleData.plate_number}</span>
                                    )}
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Insurance & Documents',
                                    html: `
                                        <input type="date" id="insurance-expiry" class="swal2-input" placeholder="Insurance Expiry" value="${vehicleData.insurance_expiry}">
                                        <input type="date" id="road-worthiness" class="swal2-input" placeholder="Road Worthiness Expiry" value="${vehicleData.road_worthiness_expiry}">
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Documents',
                                    confirmButtonColor: '#ff5e00',
                                    preConfirm: () => {
                                        const insurance = (document.getElementById('insurance-expiry') as HTMLInputElement)?.value;
                                        const roadWorthiness = (document.getElementById('road-worthiness') as HTMLInputElement)?.value;
                                        return { insurance, road_worthiness: roadWorthiness };
                                    }
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveVehicle({ ...vehicleData, insurance_expiry: result.value.insurance, road_worthiness_expiry: result.value.road_worthiness });
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Insurance</span>
                                </div>
                                <div className="settings-item-action">
                                    {vehicleData.insurance_expiry && (
                                        <span className="item-badge">{new Date(vehicleData.insurance_expiry).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    )}
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Driving Preferences */}
                    <div className="settings-card">
                        <div className="card-header">
                            <i className="fas fa-sliders-h"></i>
                            <h3>Driving Preferences</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Work Schedule',
                                    html: `
                                        <div class="schedule-form">
                                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => `
                                                <div class="schedule-row">
                                                    <label class="font-medium">${day}</label>
                                                    <div class="schedule-times">
                                                        <input type="time" id="start-${i}" class="swal2-input" placeholder="Start" value="09:00">
                                                        <input type="time" id="end-${i}" class="swal2-input" placeholder="End" value="17:00">
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'Save Schedule',
                                    confirmButtonColor: '#ff5e00',
                                    width: '600px'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        saveSchedule({});
                                    }
                                });
                            }}>
                                <div className="settings-item-label">
                                    <i className="fas fa-clock"></i>
                                    <span>Work Schedule</span>
                                </div>
                                <div className="settings-item-action">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="settings-card">
                        <div className="card-header">
                            <i className="fas fa-bell"></i>
                            <h3>Notifications</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-car"></i>
                                    <span>New Ride Requests</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notificationSettings.ride_requests} 
                                        onChange={(e) => toggleSetting('ride_requests', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-money-bill"></i>
                                    <span>Earnings Updates</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notificationSettings.earnings_notif} 
                                        onChange={(e) => toggleSetting('earnings_notif', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="settings-toggle-item">
                                <div className="toggle-label">
                                    <i className="fas fa-volume-up"></i>
                                    <span>Sound Alerts</span>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notificationSettings.sound_alerts} 
                                        onChange={(e) => toggleSetting('sound_alerts', e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="settings-card">
                        <div className="card-header">
                            <i className="fas fa-question-circle"></i>
                            <h3>Driver Support</h3>
                        </div>
                        <div className="settings-list">
                            <div className="settings-item" onClick={() => {
                                Swal.fire({
                                    title: 'Driver Help Center',
                                    html: `
                                        <div class="help-links">
                                            <a href="#" class="help-link">📚 Driver Guide</a>
                                            <a href="#" class="help-link">💰 Earnings FAQ</a>
                                            <a href="#" class="help-link">🛠️ Vehicle Requirements</a>
                                            <a href="#" class="help-link">📞 Contact Driver Support</a>
                                        </div>
                                    `,
                                    confirmButtonColor: '#ff5e00'
                                });
                            }}>
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
                                    title: 'About Speedly Driver',
                                    html: `
                                        <div style="text-align: center;">
                                            <img src="/main-assets/logo-no-background.png" alt="Speedly" style="max-width: 120px; margin-bottom: 20px;">
                                            <h3 style="font-size: 20px; font-weight: bold;">Speedly Driver</h3>
                                            <p>Version 2.5.1</p>
                                            <p class="text-gray-500 mt-2">© 2026 Speedly. All rights reserved.</p>
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
                                    <span className="item-badge">v2.5.1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                    <div className="danger-header">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Danger Zone</h3>
                    </div>
                    <div className="danger-actions">
                        <button className="btn-outline" onClick={logout}>
                            <i className="fas fa-sign-out-alt"></i> Log Out
                        </button>
                        <button className="btn-danger-outline" onClick={deleteAccount}>
                            <i className="fas fa-trash-alt"></i> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverSettings;