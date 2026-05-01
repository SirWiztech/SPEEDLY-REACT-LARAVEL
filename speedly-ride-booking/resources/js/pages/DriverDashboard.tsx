import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';
import '../../css/DriverDashboard.css';

interface Ride {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    fare_amount: number;
    created_at: string;
    client: { full_name: string } | null;
}

interface DashboardStats {
    total_rides: number;
    completed_rides: number;
    total_earnings: number;
    average_rating: number;
    driver_status: string;
}

export default function DriverDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ['driver-stats'],
        queryFn: () => api.driver.stats().then(res => res.data),
    });

    const { data: rides, isLoading: ridesLoading } = useQuery<Ride[]>({
        queryKey: ['driver-recent-rides'],
        queryFn: () => api.driver.rides(5).then(res => res.data),
    });

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Driver Dashboard" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <DriverSidebarDesktop userName="Driver" />
                </div>

                <div className="main-content">
                    <div className="mobile-header">
                        <h1>Dashboard</h1>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{stats?.total_rides || 0}</h3>
                            <p>Total Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>₦{(stats?.total_earnings || 0).toLocaleString()}</h3>
                            <p>Total Earnings</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats?.completed_rides || 0}</h3>
                            <p>Completed Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>{(stats?.average_rating || 0).toFixed(1)} ⭐</h3>
                            <p>Rating</p>
                        </div>
                    </div>

                    <div className="section">
                        <h2>Recent Rides</h2>
                        <div className="rides-list">
                            {rides?.map((ride) => (
                                <div key={ride.id} className="ride-card">
                                    <p><strong>From:</strong> {ride.pickup_location}</p>
                                    <p><strong>To:</strong> {ride.dropoff_location}</p>
                                    <p><strong>Rider:</strong> {ride.client?.full_name || 'N/A'}</p>
                                    <p><strong>Status:</strong> {ride.status}</p>
                                    <p><strong>Fare:</strong> ₦{ride.fare_amount?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
