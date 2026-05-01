import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import { api } from '../../services/api';
import '../../../css/ClientDashboard.css';

interface Ride {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    status: string;
    fare_amount: number;
}

interface DashboardStats {
    total_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    total_spent: number;
}

export default function ClientDashboardMobile() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1500);

    const { data: stats } = useQuery<DashboardStats>({
        queryKey: ['client-stats-mobile'],
        queryFn: () => api.client.stats().then(res => res.data),
    });

    const { data: recentRides } = useQuery<Ride[]>({
        queryKey: ['client-recent-rides-mobile'],
        queryFn: () => api.client.rides(5).then(res => res.data),
    });

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Dashboard - Mobile" />
            <div className="mobile-container">
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
                        <p>Completed</p>
                    </div>
                    <div className="stat-card">
                        <h3>₦{(stats?.total_spent || 0).toLocaleString()}</h3>
                        <p>Spent</p>
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
                            </div>
                        ))}
                    </div>
                </div>

                <div className="quick-actions">
                    <a href="/client/book-ride" className="action-btn primary">Book a Ride</a>
                    <a href="/client/wallet" className="action-btn">Top Up</a>
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
