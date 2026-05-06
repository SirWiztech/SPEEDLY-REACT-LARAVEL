import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import DriverNavMobile from '../../components/navbars/DriverNavMobile';
import Swal from 'sweetalert2';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../../components/preloader/MobilePreloader';
import '../../../css/DriverDashboardMobile.css';

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

// Mock data for development
const MOCK_DATA = {
    success: true,
    driver: {
        id: '1',
        fullname: 'Michael Okafor',
        email: 'michael.o@example.com',
        phone_number: '+234 805 678 9012',
        profile_picture_url: null,
        driver_status: 'offline',
        verification_status: 'approved',
        avg_rating: 4.8,
        total_reviews: 42
    },
    earnings: {
        today_earnings: 12500,
        total_earnings: 425000,
        available_balance: 45800,
        total_withdrawn: 379200
    },
    stats: {
        total_rides: 128,
        completed_rides: 120,
        cancelled_rides: 8,
        today_rides: 3,
        acceptance_rate: 94
    },
    active_ride: null,
    pending_ride: {
        id: 'RIDE001',
        status: 'pending',
        request_type: 'public',
        pickup_address: '123 Main Street, Lagos',
        destination_address: '456 Victoria Island, Lagos',
        total_fare: 8500,
        driver_payout: 6800,
        platform_commission: 1700,
        distance_km: 12.5,
        created_at: '2024-01-15 14:30:00',
        client_name: 'Sarah Johnson',
        client_phone: '+234 802 345 6789',
        client_photo: null,
        pickup_latitude: 6.5244,
        pickup_longitude: 3.3792,
        formatted_date: 'Jan 15, 2024',
        formatted_time: '2:30 PM'
    },
    recent_rides: [
        {
            id: 'RIDE002',
            pickup_address: 'Ikeja City Mall',
            destination_address: 'Maryland, Lagos',
            total_fare: 5500,
            driver_payout: 4400,
            platform_commission: 1100,
            created_at: '2024-01-14 10:15:00',
            client_name: 'Chioma Okafor',
            formatted_time: '10:15 AM'
        },
        {
            id: 'RIDE003',
            pickup_address: 'Lekki Phase 1',
            destination_address: 'Ajah, Lagos',
            total_fare: 12000,
            driver_payout: 9600,
            platform_commission: 2400,
            created_at: '2024-01-13 18:45:00',
            client_name: 'David Adeyemi',
            formatted_time: '6:45 PM'
        }
    ],
    notification_count: 2
};

const DriverDashboardMobile: React.FC = () => {
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
        acceptance_rate: 100
    });
    const [activeRide, setActiveRide] = useState<Ride | null>(null);
    const [pendingRide, setPendingRide] = useState<Ride | null>(null);
    const [recentRides, setRecentRides] = useState<RecentRide[]>([]);
    const [driverStatus, setDriverStatus] = useState<string>('offline');
    const [verificationStatus, setVerificationStatus] = useState<string>('pending');
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(30);

    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const preloaderLoading = usePreloader(1000);

    // Fetch driver dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setApiError(null);
        
        try {
            const response = await fetch('/SERVER/API/driver_dashboard_data.php');
            
            if (!response.ok) {
                console.warn('API not available, using mock data');
                const mockData = MOCK_DATA;
                setDriverData(mockData.driver);
                setEarnings(mockData.earnings);
                setStats(mockData.stats);
                setActiveRide(mockData.active_ride || null);
                setPendingRide(mockData.pending_ride || null);
                setRecentRides(mockData.recent_rides || []);
                setDriverStatus(mockData.driver.driver_status);
                setVerificationStatus(mockData.driver.verification_status);
                setNotificationCount(mockData.notification_count);
                setApiError('Using demo data');
                return;
            }
            
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
                const mockData = MOCK_DATA;
                setDriverData(mockData.driver);
                setEarnings(mockData.earnings);
                setStats(mockData.stats);
                setActiveRide(mockData.active_ride || null);
                setPendingRide(mockData.pending_ride || null);
                setRecentRides(mockData.recent_rides || []);
                setDriverStatus(mockData.driver.driver_status);
                setVerificationStatus(mockData.driver.verification_status);
                setNotificationCount(mockData.notification_count);
                setApiError('Using demo data');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setApiError('Network error. Using demo data.');
            const mockData = MOCK_DATA;
            setDriverData(mockData.driver);
            setEarnings(mockData.earnings);
            setStats(mockData.stats);
            setActiveRide(mockData.active_ride || null);
            setPendingRide(mockData.pending_ride || null);
            setRecentRides(mockData.recent_rides || []);
            setDriverStatus(mockData.driver.driver_status);
            setVerificationStatus(mockData.driver.verification_status);
            setNotificationCount(mockData.notification_count);
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

        const result = await Swal.fire({
            title: newStatus === 'online' ? 'Go Online' : 'Go Offline',
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
                <p class="mt-2 font-bold text-green-600" style="font-weight: bold; color: #10b981; margin-top: 8px;">You will earn: ₦${payout.toLocaleString()}</p>
                <div class="mt-4" style="margin-top: 16px;">
                    <label class="block text-sm text-gray-600 mb-2" style="display: block; font-size: 13px; color: #666; margin-bottom: 8px;">Rate the client (optional)</label>
                    <div class="flex justify-center gap-2 text-2xl rating-stars" style="display: flex; justify-content: center; gap: 8px; font-size: 24px;">
                        <i class="far fa-star rating-star" data-rating="1"></i>
                        <i class="far fa-star rating-star" data-rating="2"></i>
                        <i class="far fa-star rating-star" data-rating="3"></i>
                        <i class="far fa-star rating-star" data-rating="4"></i>
                        <i class="far fa-star rating-star" data-rating="5"></i>
                    </div>
                </div>
                <textarea id="review-comment" class="swal2-textarea mt-4" placeholder="Leave a comment (optional)" style="margin-top: 16px; width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;"></textarea>
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
                                s.setAttribute('style', 'color: #fbbf24;');
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
                                s.setAttribute('style', 'color: #fbbf24;');
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
                            s.setAttribute('style', 'color: #fbbf24;');
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
                            <p class="mt-2 font-bold text-green-600" style="font-weight: bold; color: #10b981; margin-top: 8px;">Earned: ₦${(data.earnings || payout).toLocaleString()}</p>
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
                <p class="mb-4" style="margin-bottom: 16px;">Available balance: <strong>₦${availableBalance.toLocaleString()}</strong></p>
                <input type="number" id="withdraw-amount" class="swal2-input" placeholder="Enter amount" min="1000" max="${availableBalance}" step="100" style="margin-bottom: 12px;">
                <select id="bank-name" class="swal2-input" style="margin-bottom: 12px;">
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="UBA">UBA</option>
                    <option value="Zenith">Zenith Bank</option>
                </select>
                <input type="text" id="account-number" class="swal2-input" placeholder="Account Number" maxlength="10" style="margin-bottom: 12px;">
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
                        <p class="mt-4 text-sm" style="margin-top: 16px; font-size: 12px; color: #666;">Your withdrawal will be processed within 24-48 hours.</p>
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
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Total Rides</div><div style="font-size: 16px; font-weight: 700;">${stats.total_rides}</div></div>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Completed</div><div style="font-size: 16px; font-weight: 700; color: #10b981;">${stats.completed_rides}</div></div>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Cancelled</div><div style="font-size: 16px; font-weight: 700; color: #ef4444;">${stats.cancelled_rides}</div></div>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Acceptance Rate</div><div style="font-size: 16px; font-weight: 700;">${stats.acceptance_rate}%</div></div>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Total Fare</div><div style="font-size: 16px; font-weight: 700;">₦${earnings.total_earnings.toLocaleString()}</div></div>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 12px; text-align: center;"><div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Avg. Rating</div><div style="font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 4px;">${driverData?.avg_rating || 0} <i class="fas fa-star" style="color: #fbbf24;"></i></div></div>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            width: '450px'
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

    // Start countdown for pending ride
    useEffect(() => {
        if (pendingRide && !activeRide) {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
            
            setCountdown(30);
            
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current);
                        }
                        if (pendingRide) {
                            declineRide(pendingRide.id);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [pendingRide, activeRide]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const firstName = driverData?.fullname?.split(' ')[0] || 'Driver';

    if (loading || preloaderLoading) {
        return <MobilePreloader />;
    }

    return (
        <div className="mobile-driver-dashboard-container">
            <div className="mobile-driver-dashboard-view">
                {/* Header */}
                <div className="mobile-driver-header">
                    <div className="mobile-driver-user-info">
                        <h1>Welcome, {firstName}!</h1>
                        <div className="mobile-driver-status">
                            <span className={`status-text-mobile ${driverStatus === 'online' ? 'online' : 'offline'}`}>
                                {driverStatus === 'online' ? '● Online' : '○ Offline'}
                            </span>
                            <span>• {stats.today_rides} rides today</span>
                        </div>
                    </div>
                    <button className="mobile-driver-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="mobile-notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* API Error Alert */}
                {apiError && (
                    <div className="mobile-api-alert">
                        <i className="fas fa-info-circle"></i>
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Balance Card */}
                <div className="mobile-driver-balance-card">
                    <div className="balance-header">
                        <div>
                            <h2>Available Balance</h2>
                            <div className="balance-amount">{formatCurrency(earnings.available_balance)}</div>
                            <p className="total-earnings">Total Earnings: {formatCurrency(earnings.total_earnings)}</p>
                        </div>
                        <i className="fas fa-wallet"></i>
                    </div>
                    <div className="today-earnings">
                        <i className="fas fa-arrow-up"></i>
                        <span>+{formatCurrency(earnings.today_earnings)} today</span>
                    </div>
                </div>

                {/* Status Toggle Button */}
                <button 
                    className={`mobile-status-toggle-btn ${driverStatus}`} 
                    onClick={toggleDriverStatus} 
                    disabled={verificationStatus !== 'approved'}
                >
                    <i className="fas fa-power-off"></i>
                    <span>Go {driverStatus === 'online' ? 'Offline' : 'Online'}</span>
                </button>
                {verificationStatus !== 'approved' && (
                    <p className="verification-warning">Complete KYC to go online</p>
                )}

                {/* Withdraw Button */}
                <button className="mobile-withdraw-btn" onClick={withdrawFunds}>
                    <i className="fas fa-hand-holding-usd"></i>
                    <span>Withdraw Earnings ({formatCurrency(earnings.available_balance)})</span>
                </button>

                {/* Active Ride or Pending Ride */}
                {activeRide && (
                    <div className="mobile-active-ride-card">
                        <div className="ride-header active">
                            <span><i className="fas fa-check-circle"></i> ACTIVE RIDE</span>
                            <span className="live-badge">● Live</span>
                        </div>
                        <div className="ride-content">
                            <h3>{activeRide.pickup_address}</h3>
                            <div className="ride-info">
                                <p><i className="fas fa-user"></i> {activeRide.client_name}</p>
                                <p><i className="fas fa-phone"></i> {activeRide.client_phone}</p>
                            </div>
                            <p className="destination"><i className="fas fa-flag-checkered"></i> To: {activeRide.destination_address}</p>
                            <div className="ride-meta">
                                <span>Fare: {formatCurrency(activeRide.total_fare)}</span>
                                <span>Started: {activeRide.formatted_time}</span>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '33%' }}></div>
                        </div>
                        <div className="ride-actions">
                            <button className="action-complete" onClick={() => completeRide(activeRide.id, activeRide.driver_payout)}>
                                <i className="fas fa-check-circle"></i> Complete
                            </button>
                            <button className="action-cancel" onClick={() => cancelActiveRide(activeRide.id)}>
                                <i className="fas fa-times-circle"></i> Cancel
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
                    <div className={`mobile-pending-ride-card ${pendingRide.request_type === 'private' ? 'private' : 'public'}`}>
                        <div className={`ride-header ${pendingRide.request_type === 'private' ? 'private' : 'public'}`}>
                            <span><i className={`fas fa-${pendingRide.request_type === 'private' ? 'user-tag' : 'clock'}`}></i> {pendingRide.request_type === 'private' ? 'PRIVATE RIDE' : 'NEW RIDE'}</span>
                            <span className="action-badge">Action required</span>
                        </div>
                        <div className="ride-content">
                            <h3>
                                {pendingRide.pickup_address}
                                <span className={`ride-type-badge ${pendingRide.request_type}`}>
                                    {pendingRide.request_type.toUpperCase()}
                                </span>
                            </h3>
                            <div className="ride-info">
                                <p><i className="fas fa-user"></i> {pendingRide.client_name}</p>
                                <p><i className="fas fa-road"></i> {pendingRide.distance_km} km</p>
                            </div>
                            <p className="destination"><i className="fas fa-flag-checkered"></i> To: {pendingRide.destination_address}</p>
                            <div className="ride-meta">
                                <span className="fare">{formatCurrency(pendingRide.total_fare)}</span>
                                <span>Est. {Math.round((pendingRide.distance_km || 0) / 30 * 60)} min</span>
                            </div>
                        </div>
                        <div className="countdown-timer">
                            <i className="fas fa-hourglass-half"></i> Accept within: <span className="timer-value">{countdown}s</span>
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
                    <div className="mobile-no-ride-card">
                        <i className="fas fa-clock"></i>
                        <h3>No Active Rides</h3>
                        <p>Go online to receive ride requests</p>
                        {driverStatus !== 'online' && verificationStatus === 'approved' && (
                            <button className="go-online-btn" onClick={toggleDriverStatus}>
                                <i className="fas fa-power-off"></i> Go Online
                            </button>
                        )}
                        {verificationStatus !== 'approved' && (
                            <button className="kyc-btn" disabled>Complete KYC First</button>
                        )}
                    </div>
                )}

                {/* Completed Rides Card */}
                <div className="mobile-completed-card">
                    <div className="completed-header">
                        <h2>Completed Rides</h2>
                        <span className="today-badge">+{stats.today_rides} today</span>
                    </div>
                    <div className="completed-count">{stats.completed_rides}</div>
                    <div className="rating-display">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fas fa-star ${i < Math.floor(driverData?.avg_rating || 0) ? 'text-yellow-400' : 'far fa-star text-yellow-400'}`} style={{ color: '#fbbf24' }}></i>
                            ))}
                        </div>
                        <span className="rating-value">{driverData?.avg_rating || 0}</span>
                        <span className="rating-count">({driverData?.total_reviews || 0} reviews)</span>
                    </div>
                    <button className="stats-btn" onClick={showDetailedStats}>
                        <i className="fas fa-chart-line"></i> View Stats
                    </button>
                </div>

                {/* Quick Actions Grid */}
                <div className="mobile-quick-actions">
                    <button className="mobile-action-btn" onClick={toggleDriverStatus} disabled={verificationStatus !== 'approved'}>
                        <div className="action-icon"><i className={`fas fa-toggle-${driverStatus === 'online' ? 'on' : 'off'}`}></i></div>
                        <span>Go {driverStatus === 'online' ? 'Offline' : 'Online'}</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/ride-history')}>
                        <div className="action-icon"><i className="fas fa-calendar-check"></i></div>
                        <span>History</span>
                    </button>
                    <button className="mobile-action-btn" onClick={showDetailedStats}>
                        <div className="action-icon"><i className="fas fa-chart-line"></i></div>
                        <span>Earnings</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/support')}>
                        <div className="action-icon"><i className="fas fa-headset"></i></div>
                        <span>Support</span>
                    </button>
                    <button className="mobile-action-btn" onClick={() => router.visit('/driver-settings')}>
                        <div className="action-icon"><i className="fas fa-cog"></i></div>
                        <span>Settings</span>
                    </button>
                </div>

                {/* Recent Rides */}
                <div className="mobile-recent-section">
                    <div className="section-header">
                        <div className="section-title">🕒 Recent Rides</div>
                        <button className="see-all-btn" onClick={() => router.visit('/ride-history')}>See All</button>
                    </div>
                    <div className="recent-rides-list">
                        {recentRides.length > 0 ? (
                            recentRides.map((ride) => (
                                <div key={ride.id} className="recent-ride-item" onClick={() => router.visit(`/generate-receipt?ride_id=${ride.id}`)}>
                                    <div className="ride-icon success">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div className="ride-details">
                                        <h4>{ride.pickup_address?.substring(0, 25)} → {ride.destination_address?.substring(0, 20)}</h4>
                                        <p>{ride.formatted_time} • {ride.client_name}</p>
                                        <p className="commission">Commission: {formatCurrency(ride.platform_commission)}</p>
                                    </div>
                                    <div className="ride-amount positive">+{formatCurrency(ride.driver_payout)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-recent">
                                <i className="fas fa-history"></i>
                                <p>No recent rides</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <DriverNavMobile />
            </div>
        </div>
    );
};

export default DriverDashboardMobile;