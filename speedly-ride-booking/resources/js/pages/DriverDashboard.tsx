import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/DriverDashboard.css';

interface Ride {
    id: string;
    pickup: string;
    destination: string;
    status: 'pending' | 'accepted' | 'ongoing' | 'completed';
    fare: number;
    rider_name: string;
}

interface DashboardStats {
    totalRides: number;
    todayEarnings: number;
    activeRides: number;
    rating: number;
    completedRides: number;
    totalEarnings: number;
}

export default function DriverDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ['driver-stats'],
        queryFn: () => fetch('/api/driver/stats').then(res => res.json()),
    });

    const { data: rides, isLoading: ridesLoading } = useQuery<Ride[]>({
        queryKey: ['driver-recent-rides'],
        queryFn: () => fetch('/api/driver/rides?limit=5').then(res => res.json()),
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
                            <h3>{stats?.totalRides || 0}</h3>
                            <p>Total Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>${(stats?.todayEarnings || 0).toFixed(2)}</h3>
                            <p>Today's Earnings</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats?.activeRides || 0}</h3>
                            <p>Active Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>{(stats?.rating || 0).toFixed(1)} ⭐</h3>
                            <p>Rating</p>
                        </div>
                    </div>

                    <div className="section">
                        <h2>Recent Rides</h2>
                        <div className="rides-list">
                            {rides?.map((ride) => (
                                <div key={ride.id} className="ride-card">
                                    <p><strong>From:</strong> {ride.pickup}</p>
                                    <p><strong>To:</strong> {ride.destination}</p>
                                    <p><strong>Rider:</strong> {ride.rider_name}</p>
                                    <p><strong>Status:</strong> {ride.status}</p>
                                    <p><strong>Fare:</strong> ${ride.fare.toFixed(2)}</p>
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
