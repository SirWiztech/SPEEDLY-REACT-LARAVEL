import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/ClientDashboard.css';

interface Ride {
    id: string;
    pickup: string;
    destination: string;
    status: 'completed' | 'in-progress' | 'pending';
    date: string;
    fare: number;
}

interface DashboardStats {
    totalRides: number;
    walletBalance: number;
    activeRides: number;
    totalSpent: number;
}

export default function ClientDashboardMobile() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1500);

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ['client-stats-mobile'],
        queryFn: () => fetch('/api/client/stats').then(res => res.json()),
    });

    const { data: recentRides, isLoading: ridesLoading } = useQuery<Ride[]>({
        queryKey: ['client-recent-rides-mobile'],
        queryFn: () => fetch('/api/client/rides?limit=5').then(res => res.json()),
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
                        <h3>{stats?.totalRides || 0}</h3>
                        <p>Total Rides</p>
                    </div>
                    <div className="stat-card">
                        <h3>${(stats?.walletBalance || 0).toFixed(2)}</h3>
                        <p>Wallet</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats?.activeRides || 0}</h3>
                        <p>Active</p>
                    </div>
                </div>

                <div className="section">
                    <h2>Recent Rides</h2>
                    <div className="rides-list">
                        {recentRides?.map((ride) => (
                            <div key={ride.id} className="ride-card">
                                <p><strong>From:</strong> {ride.pickup}</p>
                                <p><strong>To:</strong> {ride.destination}</p>
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
