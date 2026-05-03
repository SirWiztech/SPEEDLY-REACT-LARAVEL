import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import ClientNavMobile from '../../components/navbars/ClientNavMobile';
import Swal from 'sweetalert2';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../../components/preloader/MobilePreloader';
import '../../../css/ClientDashboardMobileView.css';

// Types
interface UserData {
    id: string;
    fullname: string;
    profile_picture_url: string | null;
    is_verified: boolean;
    membership_tier: 'basic' | 'premium' | 'gold';
    created_at: string;
}

interface RideStats {
    active_count: number;
    completed_count: number;
    monthly_change: number;
}

interface Ride {
    id: string;
    status: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    created_at: string;
    formatted_date: string;
    formatted_time: string;
    driver_name: string | null;
    driver_photo: string | null;
    vehicle_model: string | null;
    distance_km: number;
    notification_type: string | null;
    notification_message: string | null;
    user_rating: number | null;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    destination_latitude: number | null;
    destination_longitude: number | null;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

const ClientDashboardMobile: React.FC = () => {
    // State
    const [userData, setUserData] = useState<UserData | null>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [rideStats, setRideStats] = useState<RideStats>({
        active_count: 0,
        completed_count: 0,
        monthly_change: 0
    });
    const [recentRides, setRecentRides] = useState<Ride[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRating, setSelectedRating] = useState<number>(0);

    const notificationIntervalRef = useRef<number | null>(null);
    const preloaderLoading = usePreloader(1000);

    // Get status display text
    const getStatusDisplay = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        return `₦${amount.toLocaleString()}`;
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Format time
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/client_dashboard_data.php');
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setWalletBalance(data.wallet_balance);
                setRideStats({
                    active_count: data.active_rides,
                    completed_count: data.completed_rides,
                    monthly_change: data.monthly_change
                });
                setRecentRides(data.recent_rides || []);
                setNotificationCount(data.notification_count || 0);
            } else {
                console.error('Failed to fetch dashboard data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check for payment status from URL params
    const checkPaymentStatus = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatusParam = urlParams.get('payment_status');
        const reference = urlParams.get('reference');

        if (paymentStatusParam === 'completed' && reference) {
            fetch(`/SERVER/API/verify_payment.php?reference=${reference}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deposit Successful! 💰',
                            html: `
                                <div style="text-align: center;">
                                    <p style="font-size: 18px; margin-bottom: 10px;">Your wallet has been credited with</p>
                                    <p style="font-size: 28px; font-weight: bold; color: #ff5e00;">${formatCurrency(data.amount)}</p>
                                    <p style="margin-top: 10px;">New balance: <strong>${formatCurrency(data.new_balance)}</strong></p>
                                </div>
                            `,
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Great!',
                            timer: 5000,
                            timerProgressBar: true
                        });
                        fetchDashboardData();
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                })
                .catch(error => console.error('Error verifying payment:', error));
        }
    }, [fetchDashboardData]);

    // Check for new notifications
    const checkForNewNotifications = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/get_notifications.php');
            const data = await response.json();
            if (data.success && data.count > 0) {
                setNotificationCount(data.count);
            } else if (data.count === 0) {
                setNotificationCount(0);
            }
        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }, []);

    // Start notification checking interval
    useEffect(() => {
        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
        }

        notificationIntervalRef.current = setInterval(checkForNewNotifications, 30000);

        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
            }
        };
    }, [checkForNewNotifications]);

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData();
        checkPaymentStatus();
    }, [fetchDashboardData, checkPaymentStatus]);

    // View ride details
    const viewRideDetails = async (rideId: string) => {
        if (!rideId) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Ride',
                text: 'No ride ID provided',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Loading ride details...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch(`/SERVER/API/get_ride_details.php?ride_id=${encodeURIComponent(rideId)}`);
            const data = await response.json();

            Swal.close();

            if (data.success && data.ride) {
                Swal.fire({
                    title: 'Ride Details',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Ride #:</strong> ${data.ride.ride_number || data.ride.id}</p>
                            <p><strong>From:</strong> ${data.ride.pickup_address || 'N/A'}</p>
                            <p><strong>To:</strong> ${data.ride.destination_address || 'N/A'}</p>
                            <p><strong>Fare:</strong> ${formatCurrency(data.ride.total_fare)}</p>
                            <p><strong>Status:</strong> ${getStatusDisplay(data.ride.status)}</p>
                            ${data.ride.driver_name ? `<p><strong>Driver:</strong> ${data.ride.driver_name}</p>` : ''}
                        </div>
                    `,
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to load ride details',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.close();
            console.error('Error fetching ride details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to load ride details',
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
                data.notifications.forEach((notif: Notification) => {
                    html += `
                        <div style="padding: 10px; border-bottom: 1px solid #eee;">
                            <p><strong>${notif.title}</strong></p>
                            <p>${notif.message}</p>
                            <p style="font-size: 12px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';

                const result = await Swal.fire({
                    icon: 'info',
                    title: `Notifications (${data.notifications.length})`,
                    html: html,
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close',
                    showDenyButton: true,
                    denyButtonColor: '#f44336',
                    denyButtonText: 'Clear All'
                });

                if (result.isDenied) {
                    await fetch('/SERVER/API/clear_all_notifications.php', { method: 'POST' });
                    Swal.fire({ icon: 'success', title: 'Cleared!', text: 'All notifications cleared', confirmButtonColor: '#ff5e00' });
                    setNotificationCount(0);
                } else {
                    await fetch('/SERVER/API/mark_notifications_read.php', { method: 'POST' });
                    setNotificationCount(0);
                }
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Notifications',
                    text: 'No new notifications',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            Swal.fire({
                icon: 'info',
                title: 'Notifications',
                text: 'Unable to load notifications',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    const tierColors: Record<string, string> = {
        basic: '#6c757d',
        premium: '#ff5e00',
        gold: '#ffd700'
    };

    const tierColor = userData?.membership_tier ? tierColors[userData.membership_tier] : '#6c757d';

    if (loading || preloaderLoading) {
        return <MobilePreloader />;
    }

    return (
        <div className="mobile-dashboard-container">
            <div className="mobile-view-wrapper">
                {/* Header */}
                <div className="mobile-header">
                    <div className="mobile-user-info">
                        <h1>Welcome back, {userData?.fullname?.split(' ')[0] || 'Guest'}!</h1>
                        <div className="mobile-flex mobile-items-center mobile-gap-2 mobile-mt-1">
                            <span className="mobile-tier-badge" style={{ backgroundColor: tierColor }}>
                                {userData?.membership_tier ? userData.membership_tier.charAt(0).toUpperCase() + userData.membership_tier.slice(1) : 'Basic'} Member
                            </span>
                            <p className="mobile-text-gray-200">Wallet: {formatCurrency(walletBalance)}</p>
                        </div>
                    </div>
                    <button className="mobile-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && (
                            <span className="mobile-notification-badge mobile-notification-pulse">{notificationCount}</span>
                        )}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="mobile-grid mobile-grid-cols-2 mobile-gap-4 mobile-mx-4 mobile-mt-4">
                    <div className="mobile-balance-section">
                        <h2>Active Rides</h2>
                        <div className="mobile-text-3xl mobile-font-extrabold mobile-mt-2">{rideStats.active_count}</div>
                        <div className="mobile-balance-change">
                            <i className="fas fa-arrow-up"></i>
                            <span className="mobile-font-medium">+{Math.abs(rideStats.monthly_change)} this month</span>
                        </div>
                    </div>

                    <div className="mobile-balance-section mobile-bg-gray-200">
                        <h2>Completed</h2>
                        <div className="mobile-text-3xl mobile-font-extrabold mobile-mt-2">{rideStats.completed_count}</div>
                        <div className="mobile-text-sm mobile-text-gray-600 mobile-mt-2">
                            Member since {userData?.created_at ? formatDate(userData.created_at) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mobile-quick-actions">
                    <button className="mobile-action-btn" onClick={() => router.visit('/book-ride')}>
                        <div className="mobile-action-icon"><i className="fas fa-car"></i></div>
                        <span>Book Ride</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/ride-history')}>
                        <div className="mobile-action-icon"><i className="fas fa-history"></i></div>
                        <span>History</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/wallet')}>
                        <div className="mobile-action-icon"><i className="fas fa-wallet"></i></div>
                        <span>Wallet</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/location')}>
                        <div className="mobile-action-icon"><i className="fas fa-map-marked-alt"></i></div>
                        <span>Locations</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/settings')}>
                        <div className="mobile-action-icon"><i className="fas fa-cog"></i></div>
                        <span>Settings</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/ai-assistant')}>
                        <div className="mobile-action-icon"><i className="fas fa-robot"></i></div>
                        <span>AI Assistant</span>
                    </button>
                </div>

                {/* Recent Rides */}
                <div className="mobile-transactions-section">
                    <div className="mobile-section-header">
                        <div className="mobile-section-title">Recent Rides</div>
                        <button className="mobile-see-all-btn" onClick={() => router.visit('/ride-history')}>See All</button>
                    </div>
                    <div className="mobile-transaction-list">
                        {recentRides.length > 0 ? (
                            recentRides.slice(0, 5).map((ride) => {
                                const pickup = ride.pickup_address || 'Pickup location';
                                const date = ride.formatted_date || formatDate(ride.created_at);
                                const time = ride.formatted_time || formatTime(ride.created_at);

                                return (
                                    <div
                                        key={ride.id}
                                        className="mobile-transaction-item"
                                        onClick={() => viewRideDetails(ride.id)}
                                    >
                                        <div className="mobile-transaction-info">
                                            <div className="mobile-transaction-icon" style={{
                                                background: ride.status === 'completed' ? '#E8F5E9' : '#FFF3E0',
                                                color: ride.status === 'completed' ? '#2E7D32' : '#E65100'
                                            }}>
                                                <i className={`fas fa-${ride.status === 'completed' ? 'check-circle' : 'clock'}`}></i>
                                            </div>
                                            <div className="mobile-transaction-details">
                                                <h4>{pickup.substring(0, 25)}...</h4>
                                                <p>{date} • {time}</p>
                                                {ride.driver_name && (
                                                    <p className="mobile-text-xs mobile-text-gray-500">Driver: {ride.driver_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`mobile-transaction-amount ${ride.status === 'completed' ? 'mobile-positive' : ''}`}>
                                            {formatCurrency(ride.total_fare)}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="mobile-text-center mobile-py-8 mobile-text-gray-500">
                                <i className="fas fa-car-side mobile-text-4xl mobile-mb-2 mobile-opacity-50"></i>
                                <p>No rides yet</p>
                                <p className="mobile-text-sm mobile-mt-2">Book your first ride now!</p>
                                <button className="mobile-mt-4 mobile-bg-[#ff5e00] mobile-text-white mobile-px-6 mobile-py-2 mobile-rounded-xl mobile-text-sm mobile-font-medium" onClick={() => router.visit('/book-ride')}>
                                    Book a Ride
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <ClientNavMobile />
            </div>
        </div>
    );
};

export default ClientDashboardMobile;