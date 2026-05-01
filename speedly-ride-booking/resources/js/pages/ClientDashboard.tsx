import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';
import '../../css/ClientDashboard.css';

interface Ride {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    status: 'completed' | 'accepted' | 'pending' | 'cancelled' | 'in_progress';
    created_at: string;
    fare_amount: number;
}

interface DashboardStats {
    total_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    total_spent: number;
}

export default function ClientDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1500);
    const isMobile = useMobile();

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ['client-stats'],
        queryFn: () => api.client.stats().then(res => res.data),
    });

    const { data: recentRides, isLoading: ridesLoading } = useQuery<Ride[]>({
        queryKey: ['client-recent-rides'],
        queryFn: () => api.client.rides(5).then(res => res.data),
    });

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Client Dashboard" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <ClientSidebarDesktop userName="User" />
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
                            <h3>{stats?.completed_rides || 0}</h3>
                            <p>Completed Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats?.cancelled_rides || 0}</h3>
                            <p>Cancelled Rides</p>
                        </div>
                        <div className="stat-card">
                            <h3>₦{(stats?.total_spent || 0).toLocaleString()}</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>

                    <div className="section">
                        <h2>Recent Rides</h2>
                        <div className="rides-list">
                            {recentRides?.map((ride) => (
                                <div key={ride.id} className="ride-card">
                                    <p><strong>From:</strong> {ride.pickup_location}</p>
                                    <p><strong>To:</strong> {ride.dropoff_location}</p>
                                    <p><strong>Status:</strong> {ride.status}</p>
                                    <p><strong>Fare:</strong> ₦{ride.fare_amount?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="quick-actions">
                        <a href="/client/book-ride" className="action-btn primary">Book a Ride</a>
                        <a href="/client/wallet" className="action-btn">Top Up Wallet</a>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
