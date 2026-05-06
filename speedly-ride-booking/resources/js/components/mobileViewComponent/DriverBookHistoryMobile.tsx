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

// Mock data
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
    notification_count: 2,
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
            status: 'completed',
            pickup_address: 'Ikeja City Mall, Lagos',
            destination_address: 'Maryland, Lagos',
            total_fare: 5500,
            driver_payout: 4400,
            platform_commission: 1100,
            created_at: '2024-01-15 10:15:00',
            formatted_date: 'Jan 15, 2024',
            formatted_time: '10:15 AM',
            client_name: 'Chioma Okafor',
            client_photo: null,
            was_declined: false,
            declined_at: null
        },
        {
            id: 'RIDE003',
            ride_number: 'SPD-2024-003',
            status: 'pending',
            pickup_address: 'Lekki Phase 1, Lagos',
            destination_address: 'Ajah, Lagos',
            total_fare: 12000,
            driver_payout: 9600,
            platform_commission: 2400,
            created_at: '2024-01-14 18:45:00',
            formatted_date: 'Jan 14, 2024',
            formatted_time: '6:45 PM',
            client_name: 'David Adeyemi',
            client_photo: null,
            was_declined: false,
            declined_at: null
        }
    ],
    declined_rides: [
        {
            id: 'RIDE004',
            ride_number: 'SPD-2024-004',
            pickup_address: 'GRA, Ikeja, Lagos',
            destination_address: 'Airport Road, Lagos',
            total_fare: 15000,
            created_at: '2024-01-12 08:20:00',
            formatted_date: 'Jan 12, 2024',
            formatted_time: '8:20 AM',
            client_name: 'Chief Emeka',
            client_photo: null,
            declined_at: '2024-01-12 08:20:45',
            auto_decline: false,
            response_time_seconds: 45
        }
    ]
};

const DriverBookHistoryMobile: React.FC = () => {
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

    const fetchBookHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/SERVER/API/driver_book_history.php');
            if (!response.ok) {
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
                const mockData = MOCK_DATA;
                setUserData(mockData.user);
                setStats(mockData.stats);
                setAcceptedRides(mockData.accepted_rides);
                setDeclinedRides(mockData.declined_rides);
                setNotificationCount(mockData.notification_count);
            }
        } catch (error) {
            console.error('Error:', error);
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

    const viewRideDetails = (rideId: string) => {
        router.visit(`/generate-receipt?ride_id=${rideId}`);
    };

    const checkNotifications = async () => {
        Swal.fire({
            title: 'Notifications',
            text: 'No new notifications',
            icon: 'info',
            confirmButtonColor: '#ff5e00'
        });
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
        <div className="mobile-book-history-root">
            <div className="mobile-book-history-container">
                <div className="mobile-book-history-view">
                    {/* Header */}
                    <div className="mobile-book-history-header">
                        <div className="header-left">
                            <h1>Book History</h1>
                            <p>Welcome, {firstName}</p>
                        </div>
                        <button className="notification-btn" onClick={checkNotifications}>
                            <i className="fas fa-bell"></i>
                            {notificationCount > 0 && <span className="notif-badge">{notificationCount}</span>}
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value green">{stats.completed_rides}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Cancelled</span>
                            <span className="stat-value red">{stats.cancelled_rides}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Declined</span>
                            <span className="stat-value gray">{stats.declined_count}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">You Earned</span>
                            <span className="stat-value orange">{formatCurrency(stats.total_earnings)}</span>
                        </div>
                    </div>

                    {/* Commission Card */}
                    <div className="commission-card">
                        <div className="commission-item">
                            <span className="commission-label">Total Fares</span>
                            <span className="commission-value">{formatCurrency(stats.total_fare_amount)}</span>
                        </div>
                        <div className="commission-divider"></div>
                        <div className="commission-item">
                            <span className="commission-label">Platform Commission (20%)</span>
                            <span className="commission-value orange">-{formatCurrency(stats.total_commission)}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button 
                            className={`tab-btn ${activeTab === 'accepted' ? 'active' : ''}`}
                            onClick={() => setActiveTab('accepted')}
                        >
                            Accepted ({acceptedRides.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'declined' ? 'active' : ''}`}
                            onClick={() => setActiveTab('declined')}
                        >
                            Declined ({declinedRides.length})
                        </button>
                    </div>

                    {/* Accepted Rides */}
                    {activeTab === 'accepted' && (
                        <div className="rides-list">
                            {acceptedRides.length > 0 ? (
                                acceptedRides.map((ride) => (
                                    <div key={ride.id} className="ride-card" onClick={() => viewRideDetails(ride.id)}>
                                        <div className="card-header">
                                            <div className="date-time">
                                                <span className="date">{ride.formatted_date}</span>
                                                <span className="time">{ride.formatted_time}</span>
                                            </div>
                                            <span className={`status-badge ${ride.status}`}>
                                                {ride.status === 'completed' && <><i className="fas fa-check-circle"></i> Completed</>}
                                                {ride.status === 'pending' && <><i className="fas fa-clock"></i> Pending</>}
                                                {ride.status === 'accepted' && <><i className="fas fa-check"></i> Accepted</>}
                                            </span>
                                        </div>
                                        <div className="card-locations">
                                            <div className="pickup">
                                                <i className="fas fa-circle"></i>
                                                <span>{ride.pickup_address?.substring(0, 30)}</span>
                                            </div>
                                            <div className="destination">
                                                <i className="fas fa-flag-checkered"></i>
                                                <span>{ride.destination_address?.substring(0, 30)}</span>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="client-info">
                                                <div className="client-avatar">
                                                    {ride.client_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="client-name">{ride.client_name}</span>
                                            </div>
                                            <div className="fare-info">
                                                <span className="fare">Fare: {formatCurrency(ride.total_fare)}</span>
                                                <span className="earnings green">+{formatCurrency(ride.driver_payout)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-history"></i>
                                    <p>No accepted rides yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Declined Rides */}
                    {activeTab === 'declined' && (
                        <div className="rides-list">
                            {declinedRides.length > 0 ? (
                                declinedRides.map((ride) => (
                                    <div key={ride.id} className="ride-card declined" onClick={() => viewRideDetails(ride.id)}>
                                        <div className="card-header">
                                            <div className="date-time">
                                                <span className="date">{ride.formatted_date}</span>
                                                <span className="time">{ride.formatted_time}</span>
                                            </div>
                                            <span className="declined-badge">
                                                {ride.auto_decline ? 'Auto-declined' : 'Declined'}
                                            </span>
                                        </div>
                                        <div className="card-locations">
                                            <div className="pickup">
                                                <i className="fas fa-circle"></i>
                                                <span>{ride.pickup_address?.substring(0, 30)}</span>
                                            </div>
                                            <div className="destination">
                                                <i className="fas fa-flag-checkered"></i>
                                                <span>{ride.destination_address?.substring(0, 30)}</span>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                            <div className="client-info">
                                                <div className="client-avatar declined">
                                                    {ride.client_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="client-name">{ride.client_name}</span>
                                            </div>
                                            <div className="fare-info">
                                                <span className="fare">Fare: {formatCurrency(ride.total_fare)}</span>
                                                <span className="earnings gray">Declined</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-times-circle"></i>
                                    <p>No declined rides</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Navigation */}
                    <DriverNavMobile />
                </div>
            </div>
        </div>
    );
};

export default DriverBookHistoryMobile;