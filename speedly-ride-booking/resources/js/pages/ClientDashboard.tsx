import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/ClientSidebarDesktop';
import Swal from 'sweetalert2';
import '../../css/ClientDashboard.css';
import ClientDashboardMobile from '../components/mobileViewComponent/ClientDashboardMobile';
import { useMobile } from '../hooks/useMobile';


// Types
interface UserData {
    id: string;
    fullname: string;
    profile_picture_url: string | null;
    is_verified: boolean;
    membership_tier: 'basic' | 'premium' | 'gold';
    created_at: string;
}

interface WalletData {
    balance: number;
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

interface PaymentStatus {
    success: boolean;
    amount?: number;
    newBalance?: number;
    failed?: boolean;
}

const ClientDashboard: React.FC = () => {
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
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>('');

    const notificationIntervalRef = useRef<number | null>(null);
    const isMobile = useMobile();

    // Get status color
    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            'completed': '#4CAF50',
            'pending': '#FF9800',
            'accepted': '#2196F3',
            'driver_assigned': '#2196F3',
            'driver_arrived': '#9C27B0',
            'ongoing': '#FF5722',
            'cancelled_by_client': '#F44336',
            'cancelled_by_driver': '#F44336',
            'cancelled_by_admin': '#F44336'
        };
        return colors[status] || '#9E9E9E';
    };

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
                        setPaymentStatus({
                            success: true,
                            amount: data.amount,
                            newBalance: data.new_balance
                        });

                        // Show success notification
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

                        // Refresh dashboard data
                        fetchDashboardData();
                        // Remove payment params from URL
                        window.history.replaceState({}, '', window.location.pathname);
                    } else if (data.status === 'failed') {
                        setPaymentStatus({ success: false, failed: true });
                        Swal.fire({
                            icon: 'error',
                            title: 'Deposit Failed',
                            text: 'Your payment could not be processed. Please try again.',
                            confirmButtonColor: '#ff5e00'
                        });
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                })
                .catch(error => console.error('Error verifying payment:', error));
        }
    }, [fetchDashboardData]);

    // Check for new notifications (just update badge, no popup)
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

        // Check if we've already shown notifications this session
        if (!sessionStorage.getItem('notifications_checked')) {
            sessionStorage.setItem('notifications_checked', 'true');
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

        // Show loading
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
                displayRideDetails(data.ride);
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

    // Display ride details in modal
    const displayRideDetails = (ride: any) => {
        const rideDate = ride.formatted_date || formatDate(ride.created_at);
        const rideTime = ride.formatted_time || formatTime(ride.created_at);
        const statusColor = getStatusColor(ride.status);
        const canRate = ride.status === 'completed' && !ride.user_rating;

        let html = `
      <div style="text-align: left; max-height: 70vh; overflow-y: auto; padding: 10px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 18px; font-weight: bold;">Ride Details</span>
            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              ${getStatusDisplay(ride.status)}
            </span>
          </div>
          <p><strong>Ride #:</strong> ${ride.ride_number || ride.id}</p>
          <p><strong>Date:</strong> ${rideDate} at ${rideTime}</p>
          <p><strong>From:</strong> ${ride.pickup_address || 'N/A'}</p>
          <p><strong>To:</strong> ${ride.destination_address || 'N/A'}</p>
          <p><strong>Distance:</strong> ${ride.distance_km ? ride.distance_km.toFixed(1) + ' km' : 'N/A'}</p>
          <p><strong>Fare:</strong> <span style="color: #4CAF50; font-weight: bold;">${formatCurrency(ride.total_fare)}</span></p>
    `;

        if (ride.platform_commission) {
            html += `<p><strong>Platform Fee:</strong> ${formatCurrency(ride.platform_commission)}</p>`;
        }

        html += `<p><strong>Payment Status:</strong> <span style="color: ${ride.payment_status === 'paid' ? '#4CAF50' : '#FF9800'};">${ride.payment_status ? ride.payment_status.toUpperCase() : 'PENDING'}</span></p>`;
        html += `</div>`;

        // Driver info if available
        if (ride.driver_name) {
            html += `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
          <h4 style="margin-bottom: 10px; color: #2E7D32;">Driver Information</h4>
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
            <div style="width: 50px; height: 50px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
              ${ride.driver_name ? ride.driver_name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <p style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${ride.driver_name}</p>
              <p style="color: #666; margin-bottom: 3px;">${ride.vehicle_display || 'Vehicle not specified'}</p>
              ${ride.driver_phone ? `<p style="color: #666; font-size: 14px; margin-top: 5px;"><i class="fas fa-phone" style="margin-right: 5px;"></i> ${ride.driver_phone}</p>` : ''}
            </div>
          </div>
        </div>
      `;
        } else {
            html += `
        <div style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin-bottom: 15px; text-align: center;">
          <p style="color: #666;">No driver assigned yet</p>
          <p style="font-size: 13px; color: #999;">Waiting for a driver to accept your ride</p>
        </div>
      `;
        }

        // Rating section if ride is completed and not rated
        if (canRate) {
            html += `
        <div style="background: #fff3e0; padding: 15px; border-radius: 10px;">
          <h4 style="margin-bottom: 15px; color: #E65100;">Rate Your Driver</h4>
          <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 15px; font-size: 30px;" id="ratingStars">
            <i class="fas fa-star" data-rating="1" style="color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
            <i class="fas fa-star" data-rating="2" style="color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
            <i class="fas fa-star" data-rating="3" style="color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
            <i class="fas fa-star" data-rating="4" style="color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
            <i class="fas fa-star" data-rating="5" style="color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
          </div>
          <textarea id="reviewText" placeholder="Share your experience with this driver (optional)" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; font-family: inherit;" rows="3"></textarea>
          <button onclick="window.submitRatingFromModal('${ride.id}')" style="background: #ff5e00; color: white; border: none; padding: 12px 20px; border-radius: 8px; width: 100%; font-weight: bold; font-size: 16px; cursor: pointer;">
            <i class="fas fa-star"></i> Submit Rating
          </button>
        </div>
      `;
        } else if (ride.user_rating) {
            html += `
        <div style="background: #e8f5e9; padding: 15px; border-radius: 10px;">
          <h4 style="margin-bottom: 10px; color: #2E7D32;">Your Rating</h4>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <div style="color: #FFD700; font-size: 24px;">
              ${'★'.repeat(ride.user_rating)}${'☆'.repeat(5 - ride.user_rating)}
            </div>
            <span style="font-weight: bold;">${ride.user_rating}/5</span>
          </div>
          ${ride.user_review ? `<p style="background: white; padding: 10px; border-radius: 8px;"><strong>Your review:</strong> ${ride.user_review}</p>` : ''}
        </div>
      `;
        }

        // Action buttons for active rides
        if (['pending', 'accepted', 'driver_assigned', 'driver_arrived', 'ongoing'].includes(ride.status)) {
            html += `
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          ${ride.driver_phone ? `
            <a href="tel:${ride.driver_phone}" style="flex: 1; background: #4CAF50; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;">
              <i class="fas fa-phone"></i> Call Driver
            </a>
          ` : ''}
          ${ride.pickup_latitude && ride.pickup_longitude ? `
            <a href="https://www.google.com/maps/dir/?api=1&destination=${ride.pickup_latitude},${ride.pickup_longitude}" target="_blank" style="flex: 1; background: #2196F3; color: white; text-decoration: none; padding: 12px; border-radius: 8px; text-align: center; font-weight: 600;">
              <i class="fas fa-map-marked-alt"></i> Track
            </a>
          ` : ''}
          <button onclick="window.cancelRideFromModal('${ride.id}')" style="flex: 1; background: #f44336; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      `;
        }

        html += `</div>`;

        Swal.fire({
            title: 'Ride Details',
            html: html,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close',
            width: '600px',
            didOpen: () => {
                if (canRate) {
                    let selectedRatingValue = 0;
                    const stars = document.querySelectorAll('#ratingStars i');

                    const highlightStars = (rating: number) => {
                        stars.forEach((star, index) => {
                            if (index < rating) {
                                (star as HTMLElement).style.color = '#FFD700';
                            } else {
                                (star as HTMLElement).style.color = '#ddd';
                            }
                        });
                    };

                    stars.forEach(star => {
                        star.addEventListener('mouseenter', () => {
                            const rating = parseInt(star.getAttribute('data-rating') || '0');
                            highlightStars(rating);
                        });

                        star.addEventListener('mouseleave', () => {
                            highlightStars(selectedRatingValue);
                        });

                        star.addEventListener('click', () => {
                            selectedRatingValue = parseInt(star.getAttribute('data-rating') || '0');
                            highlightStars(selectedRatingValue);
                            setSelectedRating(selectedRatingValue);
                        });
                    });
                }
            }
        });
    };

    // Submit rating
    const submitRating = async (rideId: string, rating: number, review: string) => {
        if (rating === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Rating Required',
                text: 'Please select a rating before submitting',
                confirmButtonColor: '#ff5e00'
            });
            return false;
        }

        Swal.fire({
            title: 'Submitting rating...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const formData = new FormData();
            formData.append('ride_id', rideId);
            formData.append('rating', rating.toString());
            formData.append('review', review);

            const response = await fetch('/SERVER/API/rate_driver.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            Swal.close();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thank You!',
                    text: 'Your rating has been submitted successfully',
                    confirmButtonColor: '#ff5e00'
                }).then(() => {
                    fetchDashboardData();
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to submit rating',
                    confirmButtonColor: '#ff5e00'
                });
                return false;
            }
        } catch (error) {
            Swal.close();
            console.error('Error submitting rating:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to connect to server. Please try again.',
                confirmButtonColor: '#ff5e00'
            });
            return false;
        }
    };

    // Cancel ride
    const cancelRide = async (rideId: string) => {
        const result = await Swal.fire({
            title: 'Cancel Ride?',
            text: 'Are you sure you want to cancel this ride?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f44336',
            confirmButtonText: 'Yes, Cancel',
            cancelButtonText: 'No, Keep It'
        });

        if (result.isConfirmed) {
            Swal.fire({
                title: 'Processing...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch('/SERVER/API/cancel_ride.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ride_id: rideId,
                        reason: 'Cancelled by client'
                    })
                });
                const data = await response.json();

                Swal.close();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Cancelled',
                        text: 'Your ride has been cancelled',
                        confirmButtonColor: '#ff5e00'
                    }).then(() => {
                        fetchDashboardData();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message || 'Failed to cancel ride',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            } catch (error) {
                Swal.close();
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to cancel ride',
                    confirmButtonColor: '#ff5e00'
                });
            }
        }
    };

    // Show coming soon
    const showComingSoon = (feature: string) => {
        Swal.fire({
            icon: 'info',
            title: 'Coming Soon!',
            text: `${feature} feature will be available in the next update.`,
            confirmButtonColor: '#ff5e00'
        });
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
                    denyButtonText: 'Clear All',
                    width: '600px'
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
                html: `
          <div style="text-align: left;">
            <p>💰 <strong>Balance Update:</strong> Your wallet balance is updated</p>
            <p>🏆 <strong>Reward:</strong> You've earned a ride reward!</p>
            <p>📢 <strong>Promo:</strong> 20% off your next ride</p>
          </div>
        `,
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Global functions for modal
    useEffect(() => {
        (window as any).submitRatingFromModal = (rideId: string) => {
            const rating = selectedRating;
            const review = (document.getElementById('reviewText') as HTMLTextAreaElement)?.value || '';
            submitRating(rideId, rating, review);
        };

        (window as any).cancelRideFromModal = (rideId: string) => {
            cancelRide(rideId);
        };

        return () => {
            delete (window as any).submitRatingFromModal;
            delete (window as any).cancelRideFromModal;
        };
    }, [selectedRating]);

    const tierColors: Record<string, string> = {
        basic: '#6c757d',
        premium: '#ff5e00',
        gold: '#ffd700'
    };

    const tierColor = userData?.membership_tier ? tierColors[userData.membership_tier] : '#6c757d';

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    // Render mobile view on mobile devices ONLY
    if (isMobile) {
        return <ClientDashboardMobile />;
    }

    // Render desktop view for non-mobile devices
    return (
        <div className="dashboard-container">
            {/* DESKTOP VIEW ONLY */}
            <div className="desktop-view">
                <ClientSidebarDesktop
                    userName={userData?.fullname || 'User'}
                    profilePictureUrl={userData?.profile_picture_url}
                />

                {/* Main Content */}
                <div className="desktop-main">
                    {/* Header */}
                    <div className="desktop-header">
                        <div className="desktop-title">
                            <h1>Welcome back, {userData?.fullname?.split(' ')[0] || 'Guest'}!</h1>
                            <p className="text-gray-600">Ready for your next ride?</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="wallet-info bg-gray-100 px-4 py-2 rounded-xl">
                                <span className="text-sm text-gray-600">Wallet Balance</span>
                                <span className="text-xl font-bold text-[#ff5e00] ml-2">{formatCurrency(walletBalance)}</span>
                            </div>
                            <button className="notification-btn bg-gray-100 p-3 rounded-xl relative hover:bg-gray-200 transition" onClick={checkNotifications}>
                                <i className="fas fa-bell text-gray-700 text-xl"></i>
                                {notificationCount > 0 && (
                                    <span className="notification-badge notification-pulse">{notificationCount}</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-6 mt-6">
                        <div className="desktop-card bg-gradient-to-br from-[#ff5e00] to-[#ff8c3a] text-white">
                            <h3 className="text-lg font-medium opacity-90">Active Rides</h3>
                            <div className="text-4xl font-bold mt-2">{rideStats.active_count}</div>
                            <div className="mt-4 text-sm opacity-75">
                                <i className="fas fa-arrow-up"></i> +{Math.abs(rideStats.monthly_change)} from last month
                            </div>
                        </div>

                        <div className="desktop-card">
                            <h3 className="text-lg font-medium text-gray-600">Completed Rides</h3>
                            <div className="text-4xl font-bold mt-2">{rideStats.completed_count}</div>
                            <div className="mt-4 text-sm text-gray-500">
                                Member since {userData?.created_at ? formatDate(userData.created_at) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="desktop-card">
                            <h3 className="text-lg font-medium text-gray-600">Membership</h3>
                            <div className="text-2xl font-bold mt-2 capitalize">{userData?.membership_tier || 'basic'}</div>
                            <div className="mt-4 text-sm text-gray-500">
                                {userData?.membership_tier === 'basic' && 'Earn points to reach Premium'}
                                {userData?.membership_tier === 'premium' && '5% cashback on all rides'}
                                {userData?.membership_tier === 'gold' && '10% cashback + priority support'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-4 gap-4">
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => router.visit('/book-ride')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-car"></i></div>
                                <span className="font-medium">Book a Ride</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => router.visit('/ride-history')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-history"></i></div>
                                <span className="font-medium">Ride History</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => router.visit('/wallet')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-wallet"></i></div>
                                <span className="font-medium">Wallet</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => router.visit('/settings')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-cog"></i></div>
                                <span className="font-medium">Settings</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => router.visit('/location')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-map-marked-alt"></i></div>
                                <span className="font-medium">Saved Locations</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => showComingSoon('Promotions')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-tags"></i></div>
                                <span className="font-medium">Promotions</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => showComingSoon('Safety')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-shield-alt"></i></div>
                                <span className="font-medium">Safety Center</span>
                            </button>
                            <button className="desktop-action-btn bg-gray-50 hover:bg-gray-100 p-6 rounded-xl transition flex flex-col items-center gap-3" onClick={() => showComingSoon('Support')}>
                                <div className="text-3xl text-[#ff5e00]"><i className="fas fa-headset"></i></div>
                                <span className="font-medium">Support</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Rides Table */}
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Recent Rides</h2>
                            <button className="text-[#ff5e00] font-medium hover:underline" onClick={() => router.visit('/ride-history')}>View All →</button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date & Time</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Pickup</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Destination</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Driver</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Fare</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {recentRides.length > 0 ? (
                                        recentRides.map((ride) => {
                                            const hasNotification = ride.notification_type !== null;
                                            const date = ride.formatted_date || formatDate(ride.created_at);
                                            const time = ride.formatted_time || formatTime(ride.created_at);

                                            return (
                                                <tr key={ride.id} className={`hover:bg-gray-50 cursor-pointer ${hasNotification ? 'bg-orange-50' : ''}`} onClick={() => viewRideDetails(ride.id)}>
                                                    <td className="px-6 py-4 text-sm">{date} • {time}</td>
                                                    <td className="px-6 py-4 text-sm">{ride.pickup_address?.substring(0, 30) || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm">{ride.destination_address?.substring(0, 30) || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm">{ride.driver_name || 'Pending'}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{formatCurrency(ride.total_fare)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 text-xs rounded-full" style={{
                                                            background: ride.status === 'completed' ? '#E8F5E9' : '#FFF3E0',
                                                            color: ride.status === 'completed' ? '#2E7D32' : '#E65100'
                                                        }}>
                                                            {getStatusDisplay(ride.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button className="text-[#ff5e00] hover:underline text-sm" onClick={(e) => { e.stopPropagation(); viewRideDetails(ride.id); }}>
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                <i className="fas fa-car-side text-4xl mb-2 opacity-50"></i>
                                                <p>No rides yet</p>
                                                <button className="mt-4 bg-[#ff5e00] text-white px-6 py-2 rounded-xl text-sm font-medium" onClick={() => router.visit('/book-ride')}>
                                                    Book Your First Ride
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Promo Banner */}
                    <div className="mt-8 bg-gradient-to-r from-[#ff5e00] to-[#ff8c3a] rounded-xl p-6 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">🚀 20% OFF Your Next Ride</h3>
                                <p className="opacity-90 mt-1">Use code: SPEEDLY20 • Valid for new users</p>
                            </div>
                            <button className="bg-white text-[#ff5e00] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition" onClick={() => showComingSoon('Promo Details')}>
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;