import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import DriverNavMobile from '../../components/navbars/DriverNavMobile';
import Swal from 'sweetalert2';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../../components/preloader/MobilePreloader';
import '../../../css/DriverBookHistoryMobile.css';

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

const DriverBookHistoryMobile: React.FC = () => {
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

    const preloaderLoading = usePreloader(1000);

    // Fetch book history data
    const fetchBookHistory = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/driver_book_history.php');
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setStats(data.stats);
                setAcceptedRides(data.accepted_rides || []);
                setDeclinedRides(data.declined_rides || []);
                setNotificationCount(data.notification_count || 0);
            } else {
                console.error('Failed to fetch book history:', data.message);
            }
        } catch (error) {
            console.error('Error fetching book history:', error);
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

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const firstName = userData?.fullname?.split(' ')[0] || 'Driver';

    useEffect(() => {
        fetchBookHistory();
    }, [fetchBookHistory]);

    if (loading || preloaderLoading) {
        return <MobilePreloader />;
    }

    return (
        <div className="mobile-driver-book-history-container">
            <div className="mobile-driver-book-history-view">
                {/* Header */}
                <div className="mobile-driver-book-history-header">
                    <div className="mobile-driver-book-history-user-info">
                        <h1>Book History</h1>
                        <p>Welcome, {firstName}</p>
                    </div>
                    <button className="mobile-driver-book-history-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="mobile-notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="mobile-stats-grid">
                    <div className="mobile-stat-card">
                        <div className="stat-label">Completed</div>
                        <div className="stat-value text-green-600">{stats.completed_rides}</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-label">Cancelled</div>
                        <div className="stat-value text-red-600">{stats.cancelled_rides}</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-label">Declined</div>
                        <div className="stat-value text-gray-600">{stats.declined_count}</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-label">You Earned</div>
                        <div className="stat-value text-[#ff5e00]">{formatCurrency(stats.total_earnings)}</div>
                        <div className="stat-subtext">After 20% commission</div>
                    </div>
                </div>

                {/* Commission Summary */}
                <div className="mobile-commission-summary">
                    <div className="commission-header">
                        <i className="fas fa-percent"></i>
                        <div>
                            <div className="commission-label">Total Fares</div>
                            <div className="commission-value">{formatCurrency(stats.total_fare_amount)}</div>
                        </div>
                    </div>
                    <div className="commission-divider"></div>
                    <div className="commission-header">
                        <i className="fas fa-chart-line"></i>
                        <div>
                            <div className="commission-label">Platform Commission (20%)</div>
                            <div className="commission-value text-yellow-300">-{formatCurrency(stats.total_fare_amount * 0.2)}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mobile-tabs">
                    <button 
                        className={`mobile-tab ${activeTab === 'accepted' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accepted')}
                    >
                        Accepted Rides
                    </button>
                    <button 
                        className={`mobile-tab ${activeTab === 'declined' ? 'active' : ''}`}
                        onClick={() => setActiveTab('declined')}
                    >
                        Declined Rides
                    </button>
                </div>

                {/* Accepted Rides List */}
                {activeTab === 'accepted' && (
                    <div className="mobile-rides-list">
                        <h2 className="list-title">Your Accepted Rides</h2>
                        {acceptedRides.length > 0 ? (
                            acceptedRides.map((ride) => (
                                <div key={ride.id} className="mobile-ride-card" onClick={() => viewRideDetails(ride.id)}>
                                    <div className="ride-header">
                                        <div className="ride-date">{ride.formatted_date}</div>
                                        <div className="ride-time">{ride.formatted_time}</div>
                                    </div>
                                    <div className="ride-location-info">
                                        <div className="pickup">{ride.pickup_address?.substring(0, 35)}</div>
                                        <div className="destination">→ {ride.destination_address?.substring(0, 35)}</div>
                                    </div>
                                    <div className="ride-meta">
                                        <div className="client">
                                            <div className="client-avatar">{ride.client_name?.charAt(0)?.toUpperCase() || 'C'}</div>
                                            <div className="client-name">{ride.client_name}</div>
                                        </div>
                                        <div className="ride-fare">
                                            <div className="fare-total">Total: {formatCurrency(ride.total_fare)}</div>
                                            <div className="fare-commission">Commission: -{formatCurrency(ride.platform_commission)}</div>
                                            <div className="fare-earnings">
                                                {ride.status === 'completed' ? (
                                                    <>You earned: <span className="earnings-positive">+{formatCurrency(ride.driver_payout)}</span></>
                                                ) : ride.status === 'pending' || ride.status === 'accepted' ? (
                                                    <>You earn: <span className="earnings-pending">{formatCurrency(ride.driver_payout)} (pending)</span></>
                                                ) : (
                                                    <>You earn: <span className="earnings-neutral">{formatCurrency(ride.driver_payout)}</span></>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ride-footer">
                                        <div className="ride-status">
                                            {ride.status === 'completed' && <span className="status completed">Completed</span>}
                                            {ride.status === 'pending' && <span className="status pending">Pending</span>}
                                            {ride.status === 'accepted' && <span className="status accepted">Accepted</span>}
                                            {ride.status === 'cancelled_by_client' && <span className="status cancelled">Cancelled by Client</span>}
                                            {ride.status === 'cancelled_by_driver' && <span className="status cancelled">Cancelled by You</span>}
                                            {ride.status.includes('cancelled') && !ride.status.includes('by') && <span className="status cancelled">Cancelled</span>}
                                        </div>
                                        <button className="details-btn" onClick={(e) => { e.stopPropagation(); viewRideDetails(ride.id); }}>
                                            Details <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="mobile-empty-state">
                                <i className="fas fa-history"></i>
                                <p>No accepted rides yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Declined Rides List */}
                {activeTab === 'declined' && (
                    <div className="mobile-rides-list">
                        <h2 className="list-title">Rides You Declined</h2>
                        {declinedRides.length > 0 ? (
                            declinedRides.map((ride) => (
                                <div key={ride.id} className="mobile-ride-card declined-card" onClick={() => viewRideDetails(ride.id)}>
                                    <div className="ride-header">
                                        <div className="ride-date">{ride.formatted_date}</div>
                                        <div className="ride-time">{ride.formatted_time}</div>
                                    </div>
                                    <div className="ride-location-info">
                                        <div className="pickup">{ride.pickup_address?.substring(0, 35)}</div>
                                        <div className="destination">→ {ride.destination_address?.substring(0, 35)}</div>
                                    </div>
                                    <div className="ride-meta">
                                        <div className="client">
                                            <div className="client-avatar declined">{ride.client_name?.charAt(0)?.toUpperCase() || 'C'}</div>
                                            <div className="client-name">{ride.client_name}</div>
                                        </div>
                                        <div className="ride-fare">
                                            <div className="fare-total">Fare: {formatCurrency(ride.total_fare)}</div>
                                        </div>
                                    </div>
                                    <div className="ride-footer">
                                        <div className="ride-status">
                                            <span className="status declined">
                                                {ride.auto_decline ? 'Auto-declined' : 'Manually declined'}
                                                {ride.response_time_seconds > 0 && ` • ${ride.response_time_seconds}s response`}
                                            </span>
                                        </div>
                                        <button className="details-btn" onClick={(e) => { e.stopPropagation(); viewRideDetails(ride.id); }}>
                                            View <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="mobile-empty-state">
                                <i className="fas fa-times-circle"></i>
                                <p>No declined rides</p>
                                <span className="empty-subtext">Rides you decline will appear here</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Navigation */}
                <DriverNavMobile />
            </div>
        </div>
    );
};

export default DriverBookHistoryMobile;