import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import DriverDashboardMobile from '../components/mobileViewComponent/DriverDashboardMobile';
import '../../css/DriverDashboard.css';

// Types
interface DriverData {
    id: string;
    fullname: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    driver_status: string;
    verification_status: string;
    avg_rating: number;
    total_reviews: number;
}

interface Earnings {
    today_earnings: number;
    total_earnings: number;
    available_balance: number;
    total_withdrawn: number;
}

interface RideStats {
    total_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    today_rides: number;
    acceptance_rate: number;
    total_fare_amount: number;
    total_commission: number;
    avg_fare: number;
}

interface Ride {
    id: string;
    status: string;
    request_type: 'private' | 'public';
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    driver_payout: number;
    distance_km: number;
    created_at: string;
    client_name: string;
    client_phone: string;
    client_photo: string | null;
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    formatted_date: string;
    formatted_time: string;
}

interface RecentRide {
    id: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    driver_payout: number;
    platform_commission: number;
    created_at: string;
    client_name: string;
    formatted_time: string;
}

const DriverDashboard: React.FC = () => {
    // State
    const [driverData, setDriverData] = useState<DriverData | null>(null);
    const [earnings, setEarnings] = useState<Earnings>({
        today_earnings: 0,
        total_earnings: 0,
        available_balance: 0,
        total_withdrawn: 0
    });
    const [stats, setStats] = useState<RideStats>({
        total_rides: 0,
        completed_rides: 0,
        cancelled_rides: 0,
        today_rides: 0,
        acceptance_rate: 100,
        total_fare_amount: 0,
        total_commission: 0,
        avg_fare: 0
    });
    const [activeRide, setActiveRide] = useState<Ride | null>(null);
    const [pendingRide, setPendingRide] = useState<Ride | null>(null);
    const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
    const [driverStatus, setDriverStatus] = useState<string>('offline');
    const [verificationStatus, setVerificationStatus] = useState<string>('pending');
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch driver dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/driver_dashboard_data.php');
            const data = await response.json();

            if (data.success) {
                setDriverData(data.driver);
                setEarnings(data.earnings);
                setStats(data.stats);
                setActiveRide(data.active_ride || null);
                setPendingRide(data.pending_ride || null);
                setRecentRides(data.recent_rides || []);
                setDriverStatus(data.driver_status || 'offline');
                setVerificationStatus(data.verification_status || 'pending');
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

    // Toggle driver status
    const toggleDriverStatus = async () => {
        if (verificationStatus !== 'approved') {
            Swal.fire({
                title: 'Verification Required',
                text: 'Please complete KYC verification before going online',
                icon: 'warning',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        const action = newStatus === 'online' ? 'Go Online' : 'Go Offline';

        const result = await Swal.fire({
            title: action,
            text: `Are you sure you want to go ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'online' ? '#10b981' : '#ef4444',
            confirmButtonText: `Yes, go ${newStatus}`,
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/SERVER/API/toggle_driver_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await response.json();

                if (data.success) {
                    setDriverStatus(newStatus);
                    Swal.fire({
                        title: 'Success',
                        text: `You are now ${newStatus}`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchDashboardData();
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Failed to update status',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update status',
                    icon: 'error',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Accept ride
    const acceptRide = async (rideId: string) => {
        const result = await Swal.fire({
            title: 'Accept Ride?',
            text: 'Are you sure you want to accept this ride?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Yes, accept',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/SERVER/API/accept_ride.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ride_id: rideId })
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Success',
                        text: 'Ride accepted successfully!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        fetchDashboardData();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Failed to accept ride',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to accept ride',
                    icon: 'error',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Decline ride
    const declineRide = async (rideId: string) => {
        const result = await Swal.fire({
            title: 'Decline Ride?',
            text: 'Are you sure you want to decline this ride?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, decline',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/SERVER/API/decline_ride.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ride_id: rideId, auto_decline: false })
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Declined',
                        text: data.message || 'Ride declined',
                        icon: 'info',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        fetchDashboardData();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Failed to decline ride',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to decline ride',
                    icon: 'error',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Complete ride
    const completeRide = async (rideId: string, payout: number) => {
        let selectedRating = 0;
        let reviewComment = '';

        const result = await Swal.fire({
            title: 'Complete Ride?',
            html: `
                <p>Have you completed this ride?</p>
                <p class="mt-2 font-bold text-green-600">You will earn: ₦${payout.toLocaleString()}</p>
                <div class="mt-4">
                    <label class="block text-sm text-gray-600 mb-2">Rate the client (optional)</label>
                    <div class="flex justify-center gap-2 text-2xl rating-stars">
                        <i class="far fa-star rating-star" data-rating="1"></i>
                        <i class="far fa-star rating-star" data-rating="2"></i>
                        <i class="far fa-star rating-star" data-rating="3"></i>
                        <i class="far fa-star rating-star" data-rating="4"></i>
                        <i class="far fa-star rating-star" data-rating="5"></i>
                    </div>
                </div>
                <textarea id="review-comment" class="swal2-textarea mt-4" placeholder="Leave a comment (optional)"></textarea>
            `,
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Yes, complete',
            cancelButtonText: 'Cancel',
            didOpen: () => {
                const stars = document.querySelectorAll('.rating-star');
                
                stars.forEach((star) => {
                    star.addEventListener('mouseover', () => {
                        const rating = parseInt(star.getAttribute('data-rating') || '0');
                        stars.forEach((s, idx) => {
                            if (idx < rating) {
                                s.className = 'fas fa-star rating-star text-yellow-400';
                            } else {
                                s.className = 'far fa-star rating-star';
                            }
                        });
                    });
                    
                    star.addEventListener('click', () => {
                        selectedRating = parseInt(star.getAttribute('data-rating') || '0');
                        stars.forEach((s, idx) => {
                            if (idx < selectedRating) {
                                s.className = 'fas fa-star rating-star text-yellow-400';
                            } else {
                                s.className = 'far fa-star rating-star';
                            }
                        });
                    });
                });
                
                const starsContainer = document.querySelector('.rating-stars');
                starsContainer?.addEventListener('mouseleave', () => {
                    stars.forEach((s, idx) => {
                        if (idx < selectedRating) {
                            s.className = 'fas fa-star rating-star text-yellow-400';
                        } else {
                            s.className = 'far fa-star rating-star';
                        }
                    });
                });
            }
        });

        if (result.isConfirmed) {
            reviewComment = (document.getElementById('review-comment') as HTMLTextAreaElement)?.value || '';

            try {
                const response = await fetch('/SERVER/API/complete_ride.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ride_id: rideId,
                        rating: selectedRating > 0 ? selectedRating : null,
                        comment: reviewComment
                    })
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Ride Completed!',
                        html: `
                            <p>Ride completed successfully</p>
                            <p class="mt-2 font-bold text-green-600">Earned: ₦${(data.earnings || payout).toLocaleString()}</p>
                        `,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        fetchDashboardData();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Failed to complete ride',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to complete ride',
                    icon: 'error',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Cancel active ride
    const cancelActiveRide = async (rideId: string) => {
        const result = await Swal.fire({
            title: 'Cancel Ride?',
            text: 'Are you sure you want to cancel this ride? This may affect your acceptance rate.',
            icon: 'warning',
            input: 'select',
            inputOptions: {
                'emergency': 'Emergency',
                'vehicle_issue': 'Vehicle Issue',
                'traffic': 'Heavy Traffic',
                'client_no_show': 'Client Not at Pickup',
                'other': 'Other Reason'
            },
            inputPlaceholder: 'Select a reason',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, cancel ride',
            cancelButtonText: 'No, keep ride',
            preConfirm: (reason) => {
                if (!reason) {
                    Swal.showValidationMessage('Please select a reason');
                    return false;
                }
                return reason;
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('/SERVER/API/cancel_ride.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ride_id: rideId, reason: result.value })
                });
                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        title: 'Cancelled',
                        text: 'Ride cancelled successfully',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        fetchDashboardData();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: data.message || 'Failed to cancel ride',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to cancel ride',
                    icon: 'error',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Withdraw funds
    const withdrawFunds = () => {
        const availableBalance = earnings.available_balance;

        if (availableBalance < 1000) {
            Swal.fire({
                title: 'Insufficient Balance',
                text: 'Minimum withdrawal amount is ₦1,000',
                icon: 'warning',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Withdraw Funds',
            html: `
                <p class="mb-4">Available balance: <strong>₦${availableBalance.toLocaleString()}</strong></p>
                <input type="number" id="withdraw-amount" class="swal2-input" placeholder="Enter amount" min="1000" max="${availableBalance}" step="100">
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
            confirmButtonText: 'Withdraw',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const amount = parseFloat((document.getElementById('withdraw-amount') as HTMLInputElement)?.value);
                const bank = (document.getElementById('bank-name') as HTMLSelectElement)?.value;
                const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;

                if (!amount || amount < 1000) {
                    Swal.showValidationMessage('Minimum withdrawal is ₦1,000');
                    return false;
                }
                if (amount > availableBalance) {
                    Swal.showValidationMessage('Insufficient balance');
                    return false;
                }
                if (!bank) {
                    Swal.showValidationMessage('Please select a bank');
                    return false;
                }
                if (!account || account.length !== 10 || !/^\d+$/.test(account)) {
                    Swal.showValidationMessage('Please enter a valid 10-digit account number');
                    return false;
                }
                if (!name) {
                    Swal.showValidationMessage('Please enter account name');
                    return false;
                }
                return { amount, bank, account, name };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Withdrawal Request Submitted',
                    html: `
                        <p>Amount: <strong>₦${result.value.amount.toLocaleString()}</strong></p>
                        <p>Bank: ${result.value.bank}</p>
                        <p>Account: ${result.value.account} (${result.value.name})</p>
                        <p class="mt-4 text-sm text-gray-500">Your withdrawal will be processed within 24-48 hours.</p>
                    `,
                    icon: 'success',
                    confirmButtonColor: '#ff5e00'
                });
            }
        });
    };

    // Call client
    const callClient = (phone: string) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            Swal.fire({
                title: 'No Phone Number',
                text: 'Client phone number is not available',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Navigate to location
    const navigateTo = (lat: number | null, lng: number | null) => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else {
            Swal.fire({
                title: 'Location Unavailable',
                text: 'Pickup location coordinates are not available',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Show detailed stats
    const showDetailedStats = () => {
        Swal.fire({
            title: 'Detailed Statistics',
            html: `
                <div class="stats-grid">
                    <div class="stat-item"><div class="stat-label">Total Rides</div><div class="stat-value">${stats.total_rides}</div></div>
                    <div class="stat-item"><div class="stat-label">Completed</div><div class="stat-value text-green-600">${stats.completed_rides}</div></div>
                    <div class="stat-item"><div class="stat-label">Cancelled</div><div class="stat-value text-red-600">${stats.cancelled_rides}</div></div>
                    <div class="stat-item"><div class="stat-label">Acceptance Rate</div><div class="stat-value">${stats.acceptance_rate}%</div></div>
                    <div class="stat-item"><div class="stat-label">Total Fare</div><div class="stat-value">₦${stats.total_fare_amount.toLocaleString()}</div></div>
                    <div class="stat-item"><div class="stat-label">Platform Commission</div><div class="stat-value text-red-600">-₦${stats.total_commission.toLocaleString()}</div></div>
                    <div class="stat-item col-span-2"><div class="stat-label">Net Earnings</div><div class="stat-value text-green-600">₦${(stats.total_fare_amount * 0.8).toLocaleString()}</div></div>
                    <div class="stat-item col-span-2"><div class="stat-label">Average Rating</div><div class="stat-value flex items-center justify-center gap-2">${driverData?.avg_rating || 0} ${'★'.repeat(Math.floor(driverData?.avg_rating || 0))}${'☆'.repeat(5 - Math.floor(driverData?.avg_rating || 0))}</div></div>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            width: '600px'
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
                    html: '<p>🔔 No new notifications</p>',
                    icon: 'info',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Notifications',
                html: '<p>🔔 No new notifications</p>',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    // Format date
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData();

        // Set up periodic refresh for ride requests (every 30 seconds)
        const interval = setInterval(() => {
            if (driverStatus === 'online') {
                fetch('/SERVER/API/get_pending_rides.php')
                    .then(res => res.json())
                    .then(data => {
                        if (data.has_new_rides) {
                            Swal.fire({
                                title: 'New Ride Available',
                                text: 'A new ride request has arrived',
                                icon: 'info',
                                timer: 3000,
                                showConfirmButton: false
                            }).then(() => {
                                fetchDashboardData();
                            });
                        }
                    })
                    .catch(err => console.error('Error checking for new rides:', err));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchDashboardData, driverStatus]);

    const firstName = driverData?.fullname?.split(' ')[0] || 'Driver';
    const driverInitial = driverData?.fullname?.charAt(0)?.toUpperCase() || 'D';

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <DriverDashboardMobile />;
    }

    return (
        <div className="driver-desktop-container">
            <DriverSidebarDesktop 
                userName={driverData?.fullname || 'Driver'} 
                userRole="driver"
                profilePictureUrl={driverData?.profile_picture_url}
                driverStatus={driverStatus}
                verificationStatus={verificationStatus}
            />

            <div className="driver-desktop-main">
                {/* Header */}
                <div className="driver-desktop-header">
                    <div className="driver-desktop-title">
                        <h1>Ready to drive, {firstName}!</h1>
                        <div className="driver-status-line">
                            {driverStatus === 'online' ? (
                                <>
                                    <span className="status-dot online"></span>
                                    <span className="status-text online">Online</span>
                                </>
                            ) : (
                                <>
                                    <span className="status-dot offline"></span>
                                    <span className="status-text offline">Offline</span>
                                </>
                            )}
                            • {stats.today_rides} rides today
                        </div>
                    </div>
                    <div className="driver-desktop-actions">
                        <button className="driver-notification-btn" onClick={checkNotifications}>
                            <i className="fas fa-bell"></i>
                            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                        </button>
                        <div className="online-badge">
                            <span className="pulse"></span>
                            <span>{stats.today_rides} rides today</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="driver-stats-grid">
                    {/* Earnings Card */}
                    <div className="driver-card earnings-card">
                        <div className="earnings-header">
                            <div>
                                <h2>Available Balance</h2>
                                <div className="balance-amount">{formatCurrency(earnings.available_balance)}</div>
                                <p className="total-earnings">Total Earnings: {formatCurrency(earnings.total_earnings)}</p>
                            </div>
                            <i className="fas fa-wallet"></i>
                        </div>
                        <div className="today-earnings">
                            <i className="fas fa-arrow-up"></i>
                            <span>+{formatCurrency(earnings.today_earnings)} (today)</span>
                        </div>
                        <button className="withdraw-btn-desktop" onClick={withdrawFunds}>
                            <i className="fas fa-hand-holding-usd"></i> Withdraw funds
                        </button>
                    </div>

                    {/* Status Card */}
                    <div className="driver-card status-card">
                        <h2>Driver Status</h2>
                        <div className="status-display">
                            <div className="status-icon">
                                {driverStatus === 'online' ? (
                                    <i className="fas fa-toggle-on text-green-500"></i>
                                ) : (
                                    <i className="fas fa-toggle-off text-gray-400"></i>
                                )}
                            </div>
                            <div className="status-name">{driverStatus === 'online' ? 'Online' : 'Offline'}</div>
                            <span className={`status-badge ${driverStatus}`}>
                                {driverStatus === 'online' ? '● ONLINE' : '○ OFFLINE'}
                            </span>
                        </div>
                        <button className={`status-toggle-btn ${driverStatus}`} onClick={toggleDriverStatus} disabled={verificationStatus !== 'approved'}>
                            <i className="fas fa-power-off"></i>
                            <span>Go {driverStatus === 'online' ? 'Offline' : 'Online'}</span>
                        </button>
                        {verificationStatus !== 'approved' && (
                            <p className="verification-warning">Complete KYC to go online</p>
                        )}
                    </div>

                    {/* Completed Rides Card */}
                    <div className="driver-card completed-card">
                        <div className="completed-header">
                            <h2>Completed rides</h2>
                            <span className="today-badge">+{stats.today_rides} today</span>
                        </div>
                        <div className="completed-count">{stats.completed_rides}</div>
                        <div className="rating-display">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star ${i < Math.floor(driverData?.avg_rating || 0) ? 'text-yellow-400' : i < Math.ceil(driverData?.avg_rating || 0) && (driverData?.avg_rating || 0) % 1 >= 0.5 ? 'fas fa-star-half-alt text-yellow-400' : 'far fa-star text-yellow-400'}`}></i>
                                ))}
                            </div>
                            <span className="rating-value">{driverData?.avg_rating || 0}</span>
                            <span className="rating-count">({driverData?.total_reviews || 0} reviews)</span>
                        </div>
                        <button className="stats-btn" onClick={showDetailedStats}>
                            <i className="fas fa-chart-pie"></i> View detailed stats
                        </button>
                    </div>

                    {/* Active/Pending Ride */}
                    {activeRide && (
                        <div className="driver-card active-ride-card">
                            <div className="ride-header active">
                                <span><i className="fas fa-check-circle"></i> ACTIVE RIDE IN PROGRESS</span>
                                <span className="live-badge">● Live</span>
                            </div>
                            <div className="ride-content">
                                <div className="ride-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="ride-details">
                                    <h3>{activeRide.pickup_address}</h3>
                                    <div className="ride-info-grid">
                                        <div>
                                            <p className="label">Client</p>
                                            <p className="value"><i className="fas fa-user"></i> {activeRide.client_name}</p>
                                        </div>
                                        <div>
                                            <p className="label">Contact</p>
                                            <p className="value"><i className="fas fa-phone"></i> {activeRide.client_phone}</p>
                                        </div>
                                    </div>
                                    <p className="destination"><i className="fas fa-flag-checkered"></i> To: {activeRide.destination_address}</p>
                                    <div className="ride-meta">
                                        <span><i className="fas fa-money-bill-wave"></i> Fare: {formatCurrency(activeRide.total_fare)}</span>
                                        <span><i className="fas fa-clock"></i> Started: {formatTime(activeRide.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '33%' }}></div>
                            </div>
                            <div className="ride-actions">
                                <button className="action-complete" onClick={() => completeRide(activeRide.id, activeRide.driver_payout)}>
                                    <i className="fas fa-check-circle"></i> Complete Ride
                                </button>
                                <button className="action-cancel" onClick={() => cancelActiveRide(activeRide.id)}>
                                    <i className="fas fa-times-circle"></i> Cancel Ride
                                </button>
                                <button className="action-call" onClick={() => callClient(activeRide.client_phone)}>
                                    <i className="fas fa-phone-alt"></i>
                                </button>
                                <button className="action-navigate" onClick={() => navigateTo(activeRide.pickup_latitude, activeRide.pickup_longitude)}>
                                    <i className="fas fa-map-marked-alt"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {pendingRide && !activeRide && (
                        <div className={`driver-card pending-ride-card ${pendingRide.request_type === 'private' ? 'private' : 'public'}`}>
                            <div className={`ride-header ${pendingRide.request_type === 'private' ? 'private' : 'public'}`}>
                                <span><i className={`fas fa-${pendingRide.request_type === 'private' ? 'user-tag' : 'clock'}`}></i> {pendingRide.request_type === 'private' ? 'PRIVATE RIDE REQUEST' : 'NEW RIDE REQUEST'}</span>
                                <span className="action-badge">Action required</span>
                            </div>
                            <div className="ride-content">
                                <div className="ride-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="ride-details">
                                    <h3>
                                        {pendingRide.pickup_address}
                                        <span className={`ride-type-badge ${pendingRide.request_type}`}>
                                            {pendingRide.request_type.toUpperCase()}
                                        </span>
                                    </h3>
                                    <div className="ride-info-grid">
                                        <div>
                                            <p className="label">Client</p>
                                            <p className="value"><i className="fas fa-user"></i> {pendingRide.client_name}</p>
                                        </div>
                                        <div>
                                            <p className="label">Distance</p>
                                            <p className="value"><i className="fas fa-road"></i> {pendingRide.distance_km} km</p>
                                        </div>
                                    </div>
                                    <p className="destination"><i className="fas fa-flag-checkered"></i> To: {pendingRide.destination_address}</p>
                                    <div className="ride-meta">
                                        <span className="fare">{formatCurrency(pendingRide.total_fare)}</span>
                                        <span>Est. {Math.round((pendingRide.distance_km || 0) / 30 * 60)} min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ride-actions">
                                <button className="action-accept" onClick={() => acceptRide(pendingRide.id)}>
                                    <i className="fas fa-check"></i> Accept Ride
                                </button>
                                <button className="action-decline" onClick={() => declineRide(pendingRide.id)}>
                                    <i className="fas fa-times"></i> Decline
                                </button>
                            </div>
                        </div>
                    )}

                    {!activeRide && !pendingRide && (
                        <div className="driver-card no-ride-card">
                            <div className="no-ride-content">
                                <i className="fas fa-clock"></i>
                                <h3>No Active Rides</h3>
                                <p>Go online to start receiving ride requests</p>
                                {driverStatus !== 'online' && verificationStatus === 'approved' && (
                                    <button className="go-online-btn" onClick={toggleDriverStatus}>
                                        <i className="fas fa-power-off"></i> Go Online Now
                                    </button>
                                )}
                                {verificationStatus !== 'approved' && (
                                    <button className="kyc-btn" disabled>Complete KYC First</button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="driver-card quick-actions-card">
                        <h2>Driver Quick Actions</h2>
                        <div className="quick-actions-grid">
                            <button className="quick-action-btn" onClick={toggleDriverStatus} disabled={verificationStatus !== 'approved'}>
                                <i className="fas fa-power-off"></i>
                                <span>Go {driverStatus === 'online' ? 'Offline' : 'Online'}</span>
                            </button>
                            <button className="quick-action-btn" onClick={withdrawFunds}>
                                <i className="fas fa-hand-holding-usd"></i>
                                <span>Withdraw</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => router.visit('/support')}>
                                <i className="fas fa-headset"></i>
                                <span>Support</span>
                            </button>
                            <button className="quick-action-btn" onClick={showDetailedStats}>
                                <i className="fas fa-chart-bar"></i>
                                <span>My stats</span>
                            </button>
                            <button className="quick-action-btn" onClick={() => router.visit('/driver-settings')}>
                                <i className="fas fa-cog"></i>
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Trips */}
                    <div className="driver-card recent-trips-card">
                        <div className="recent-header">
                            <h2>📋 Recent Trips</h2>
                            <button className="see-all-btn" onClick={() => router.visit('/ride-history')}>See all →</button>
                        </div>
                        <div className="recent-trips-list">
                            {recentRides.length > 0 ? (
                                recentRides.map((ride) => (
                                    <div key={ride.id} className="recent-trip-item" onClick={() => router.visit(`/generate-receipt?ride_id=${ride.id}`)}>
                                        <div className="trip-icon">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <div className="trip-details">
                                            <h4>{ride.pickup_address?.substring(0, 30)} → {ride.destination_address?.substring(0, 25)}</h4>
                                            <p>{ride.formatted_time} • {ride.client_name}</p>
                                            <p className="commission">Commission: {formatCurrency(ride.platform_commission)}</p>
                                        </div>
                                        <div className="trip-amount positive">+{formatCurrency(ride.driver_payout)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-recent">
                                    <i className="fas fa-history"></i>
                                    <p>No recent trips</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Banner */}
                <div className="driver-bottom-banner">
                    <div className="banner-info">
                        <h2>Drive more, earn more 🚀</h2>
                        <p>Complete 10 rides this weekend → ₦8,000 bonus. {stats.today_rides} rides done.</p>
                        <div className="banner-stats">
                            <div><span className="stat-value">₦{stats.today_rides > 0 ? Math.round(earnings.today_earnings / stats.today_rides) : 0}</span><span className="stat-label">avg/ride</span></div>
                            <div><span className="stat-value">{stats.acceptance_rate}%</span><span className="stat-label">acceptance</span></div>
                        </div>
                    </div>
                    <button className="banner-action-btn" onClick={toggleDriverStatus} disabled={verificationStatus !== 'approved'}>
                        <i className="fas fa-car"></i> {driverStatus === 'online' ? 'Go Offline' : 'Find rides'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;