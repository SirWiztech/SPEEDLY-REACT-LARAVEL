import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import DriverBookHistoryMobile from '../components/mobileViewComponent/DriverBookHistoryMobile';
import '../../css/DriverBookHistory.css';

// Types
interface RideStats {
    total_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    declined_count: number;
    total_fare_amount: number;
    total_earnings: number;
    total_commission: number;
    avg_fare: number;
}

interface Ride {
    id: string;
    ride_number: string;
    status: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    driver_payout: number;
    platform_commission: number;
    created_at: string;
    formatted_date: string;
    formatted_time: string;
    client_name: string;
    client_photo: string | null;
    was_declined: boolean;
    declined_at: string | null;
}

interface DeclinedRide {
    id: string;
    ride_number: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    created_at: string;
    formatted_date: string;
    formatted_time: string;
    client_name: string;
    client_photo: string | null;
    declined_at: string;
    auto_decline: boolean;
    response_time_seconds: number;
}

// Mock data for development
const MOCK_DATA = {
    success: true,
    user: {
        id: '1',
        fullname: 'John Driver',
        email: 'john@example.com',
        profile_picture_url: null
    },
    stats: {
        total_rides: 45,
        completed_rides: 38,
        cancelled_rides: 5,
        declined_count: 2,
        total_fare_amount: 285000,
        total_earnings: 228000,
        total_commission: 57000,
        avg_fare: 6333
    },
    notification_count: 3,
    accepted_rides: [
        {
            id: 'RIDE001',
            ride_number: 'SPD-2024-001',
            status: 'completed',
            pickup_address: '123 Main Street, Lagos',
            destination_address: '456 Victoria Island, Lagos',
            total_fare: 8500,
            driver_payout: 6800,
            platform_commission: 1700,
            created_at: '2024-01-15 14:30:00',
            formatted_date: 'Jan 15, 2024',
            formatted_time: '2:30 PM',
            client_name: 'Sarah Johnson',
            client_photo: null,
            was_declined: false,
            declined_at: null
        },
        {
            id: 'RIDE002',
            ride_number: 'SPD-2024-002',
            status: 'pending',
            pickup_address: '789 Lekki Phase 1',
            destination_address: 'Ajah, Lagos',
            total_fare: 5500,
            driver_payout: 4400,
            platform_commission: 1100,
            created_at: '2024-01-16 14:20:00',
            formatted_date: 'Jan 16, 2024',
            formatted_time: '2:20 PM',
            client_name: 'Michael Adebayo',
            client_photo: null,
            was_declined: false,
            declined_at: null
        }
    ],
    declined_rides: [
        {
            id: 'RIDE003',
            ride_number: 'SPD-2024-003',
            pickup_address: 'Ikeja City Mall',
            destination_address: 'Maryland, Lagos',
            total_fare: 4200,
            created_at: '2024-01-14 09:15:00',
            formatted_date: 'Jan 14, 2024',
            formatted_time: '9:15 AM',
            client_name: 'Chioma Okafor',
            client_photo: null,
            declined_at: '2024-01-14 09:15:30',
            auto_decline: false,
            response_time_seconds: 30
        }
    ]
};

const DriverBookHistory: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState<RideStats>({
        total_rides: 0,
        completed_rides: 0,
        cancelled_rides: 0,
        declined_count: 0,
        total_fare_amount: 0,
        total_earnings: 0,
        total_commission: 0,
        avg_fare: 0
    });
    const [acceptedRides, setAcceptedRides] = useState<Ride[]>([]);
    const [declinedRides, setDeclinedRides] = useState<DeclinedRide[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'accepted' | 'declined'>('accepted');
    const [apiError, setApiError] = useState<string | null>(null);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch book history data
    const fetchBookHistory = useCallback(async () => {
        setLoading(true);
        setApiError(null);
        
        try {
            const response = await fetch('/SERVER/API/driver_book_history.php');
            
            if (!response.ok) {
                console.warn('API not available, using mock data');
                const mockData = MOCK_DATA;
                setUserData(mockData.user);
                setStats(mockData.stats);
                setAcceptedRides(mockData.accepted_rides);
                setDeclinedRides(mockData.declined_rides);
                setNotificationCount(mockData.notification_count);
                return;
            }
            
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setStats(data.stats);
                setAcceptedRides(data.accepted_rides || []);
                setDeclinedRides(data.declined_rides || []);
                setNotificationCount(data.notification_count || 0);
            } else {
                console.error('Failed to fetch book history:', data.message);
                const mockData = MOCK_DATA;
                setUserData(mockData.user);
                setStats(mockData.stats);
                setAcceptedRides(mockData.accepted_rides);
                setDeclinedRides(mockData.declined_rides);
                setNotificationCount(mockData.notification_count);
            }
        } catch (error) {
            console.error('Error fetching book history:', error);
            setApiError('Unable to load data. Using demo data.');
            const mockData = MOCK_DATA;
            setUserData(mockData.user);
            setStats(mockData.stats);
            setAcceptedRides(mockData.accepted_rides);
            setDeclinedRides(mockData.declined_rides);
            setNotificationCount(mockData.notification_count);
        } finally {
            setLoading(false);
        }
    }, []);

    // View ride details
    const viewRideDetails = (rideId: string) => {
        router.visit(`/generate-receipt?ride_id=${rideId}`);
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

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const userInitial = userData?.fullname?.charAt(0)?.toUpperCase() || 'D';

    useEffect(() => {
        fetchBookHistory();
    }, [fetchBookHistory]);

    if (loading || preloaderLoading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    // IMPORTANT: Render mobile view for mobile devices FIRST
    if (isMobile) {
        console.log('Rendering Mobile View - Device is mobile');
        return <DriverBookHistoryMobile />;
    }

    // Desktop View (only for desktop)
    console.log('Rendering Desktop View - Device is desktop');
    return (
        <div className="driver-book-history-desktop-container">
            <DriverSidebarDesktop 
                userName={userData?.fullname || 'Driver'} 
                userRole="driver"
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="driver-book-history-desktop-main">
                {/* Header */}
                <div className="driver-book-history-header">
                    <div className="driver-book-history-title">
                        <h1>Book History</h1>
                        <p>View all your rides including declined ones</p>
                    </div>
                    <button className="driver-book-history-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="api-error-message">
                        <i className="fas fa-exclamation-triangle"></i> {apiError}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="driver-book-history-stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Completed</div>
                        <div className="stat-value" style={{ color: '#10b981' }}>{stats.completed_rides}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Cancelled</div>
                        <div className="stat-value" style={{ color: '#ef4444' }}>{stats.cancelled_rides}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Declined</div>
                        <div className="stat-value" style={{ color: '#6b7280' }}>{stats.declined_count}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Fares</div>
                        <div className="stat-value">{formatCurrency(stats.total_fare_amount)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">You Earned</div>
                        <div className="stat-value" style={{ color: '#ff5e00' }}>{formatCurrency(stats.total_earnings)}</div>
                        <div className="stat-subtext">After 20% commission</div>
                    </div>
                </div>

                {/* Commission Summary Card */}
                <div className="commission-summary-card">
                    <div className="commission-left">
                        <div className="commission-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <div>
                            <h3>Earnings Breakdown</h3>
                            <p>Platform commission: 20% on all completed rides</p>
                        </div>
                    </div>
                    <div className="commission-stats">
                        <div className="commission-stat">
                            <div className="stat-label">Total Fares</div>
                            <div className="stat-value">{formatCurrency(stats.total_fare_amount)}</div>
                        </div>
                        <div className="commission-stat">
                            <div className="stat-label">Commission (20%)</div>
                            <div className="stat-value" style={{ color: '#fbbf24' }}>-{formatCurrency(stats.total_fare_amount * 0.2)}</div>
                        </div>
                        <div className="commission-stat">
                            <div className="stat-label">Your Earnings</div>
                            <div className="stat-value">{formatCurrency(stats.total_earnings)}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="driver-book-history-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accepted')}
                    >
                        Accepted Rides ({acceptedRides.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'declined' ? 'active' : ''}`}
                        onClick={() => setActiveTab('declined')}
                    >
                        Declined Rides ({declinedRides.length})
                    </button>
                </div>

                {/* Accepted Rides Table */}
                {activeTab === 'accepted' && (
                    <div className="rides-table-container">
                        <div className="table-header">
                            <h2>Accepted Rides</h2>
                        </div>
                        <div className="table-wrapper">
                            <table className="rides-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Ride Details</th>
                                        <th>Client</th>
                                        <th>Total Fare</th>
                                        <th>Commission (20%)</th>
                                        <th>Your Earnings</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acceptedRides.length > 0 ? (
                                        acceptedRides.map((ride) => (
                                            <tr key={ride.id} className="ride-row" onClick={() => viewRideDetails(ride.id)}>
                                                <td>
                                                    <div className="ride-date">{ride.formatted_date}</div>
                                                    <div className="ride-time">{ride.formatted_time}</div>
                                                </td>
                                                <td>
                                                    <div className="ride-location">{ride.pickup_address?.substring(0, 35)}</div>
                                                    <div className="ride-destination">→ {ride.destination_address?.substring(0, 35)}</div>
                                                </td>
                                                <td>
                                                    <div className="client-info">
                                                        <div className="client-avatar">
                                                            {ride.client_name?.charAt(0)?.toUpperCase() || 'C'}
                                                        </div>
                                                        <div>
                                                            <div className="client-name">{ride.client_name}</div>
                                                            <div className="client-id">#{ride.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fare-cell">{formatCurrency(ride.total_fare)}</td>
                                                <td className="commission-cell">-{formatCurrency(ride.platform_commission)}</td>
                                                <td className="earnings-cell">
                                                    {ride.status === 'completed' ? (
                                                        <span style={{ color: '#10b981', fontWeight: '600' }}>+{formatCurrency(ride.driver_payout)}</span>
                                                    ) : ride.status === 'pending' || ride.status === 'accepted' ? (
                                                        <span style={{ color: '#f59e0b' }}>{formatCurrency(ride.driver_payout)} (pending)</span>
                                                    ) : (
                                                        <span style={{ color: '#6b7280' }}>{formatCurrency(ride.driver_payout)}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {ride.status === 'completed' && <span className="status-badge completed">Completed</span>}
                                                    {ride.status === 'pending' && <span className="status-badge pending">Pending</span>}
                                                    {ride.status === 'accepted' && <span className="status-badge accepted">Accepted</span>}
                                                    {ride.status === 'cancelled_by_client' && <span className="status-badge cancelled">Cancelled by Client</span>}
                                                    {ride.status === 'cancelled_by_driver' && <span className="status-badge cancelled">Cancelled by You</span>}
                                                </td>
                                                <td>
                                                    <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); viewRideDetails(ride.id); }}>
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="empty-state">
                                                <i className="fas fa-history"></i>
                                                <p>No accepted rides yet</p>
                                                <span className="empty-subtext">Rides you accept will appear here</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Declined Rides Table */}
                {activeTab === 'declined' && (
                    <div className="rides-table-container">
                        <div className="table-header">
                            <h2>Declined Rides</h2>
                        </div>
                        <div className="table-wrapper">
                            <table className="rides-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Ride Details</th>
                                        <th>Client</th>
                                        <th>Fare</th>
                                        <th>Declined At</th>
                                        <th>Type</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {declinedRides.length > 0 ? (
                                        declinedRides.map((ride) => (
                                            <tr key={ride.id} className="ride-row declined" onClick={() => viewRideDetails(ride.id)}>
                                                <td>
                                                    <div className="ride-date">{ride.formatted_date}</div>
                                                    <div className="ride-time">{ride.formatted_time}</div>
                                                </td>
                                                <td>
                                                    <div className="ride-location">{ride.pickup_address?.substring(0, 35)}</div>
                                                    <div className="ride-destination">→ {ride.destination_address?.substring(0, 35)}</div>
                                                </td>
                                                <td>
                                                    <div className="client-info">
                                                        <div className="client-avatar" style={{ background: '#9ca3af' }}>
                                                            {ride.client_name?.charAt(0)?.toUpperCase() || 'C'}
                                                        </div>
                                                        <div>
                                                            <div className="client-name">{ride.client_name}</div>
                                                            <div className="client-id">#{ride.id.substring(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fare-cell">{formatCurrency(ride.total_fare)}</td>
                                                <td>
                                                    <div className="declined-time">{new Date(ride.declined_at).toLocaleTimeString()}</div>
                                                    {ride.response_time_seconds > 0 && (
                                                        <div className="response-time">{ride.response_time_seconds}s response</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {ride.auto_decline ? (
                                                        <span className="declined-badge auto">Auto-declined</span>
                                                    ) : (
                                                        <span className="declined-badge manual">Manual</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button className="view-details-btn secondary" onClick={(e) => { e.stopPropagation(); viewRideDetails(ride.id); }}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="empty-state">
                                                <i className="fas fa-times-circle"></i>
                                                <p>No declined rides</p>
                                                <span className="empty-subtext">Rides you decline will appear here</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverBookHistory;