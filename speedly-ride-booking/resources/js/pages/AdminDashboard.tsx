import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { queryClient } from '../lib/queryClient';
import { api } from '../services/api';
import '../../css/AdminDashboard.css';

interface StatData {
    total_users: number;
    total_clients: number;
    total_drivers: number;
    total_rides: number;
    pending_rides: number;
    active_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    total_revenue: number;
    total_payouts: number;
    pending_withdrawals_amount: number;
    pending_withdrawals_count: number;
    pending_kyc_count: number;
}

interface Withdrawal {
    id: string;
    driver_name: string;
    amount: number;
    status: string;
    created_at: string;
}

interface Driver {
    id: string;
    full_name: string;
    email: string;
    verification_status: string;
    driver_status: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data: stats, isLoading: statsLoading } = useQuery<StatData>({
        queryKey: ['admin-stats'],
        queryFn: () => api.admin.stats().then(res => res.data),
    });

    const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery<Withdrawal[]>({
        queryKey: ['admin-withdrawals'],
        queryFn: () => api.admin.withdrawals().then(res => res.data),
    });

    const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
        queryKey: ['admin-drivers'],
        queryFn: () => api.admin.drivers().then(res => res.data),
    });

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="admin-dashboard">
                <header className="admin-header">
                    <div className="logo">
                        <img src="/main-assets/logo.png" alt="Speedly" />
                        <h1>Admin Dashboard</h1>
                    </div>
                    <div className="admin-actions">
                        <button className="btn-premium">Export Report</button>
                    </div>
                </header>

                <main className="admin-content">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">{stats?.total_users || 0}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🚗</div>
                            <div className="stat-value">{stats?.total_drivers || 0}</div>
                            <div className="stat-label">Total Drivers</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🚀</div>
                            <div className="stat-value">{stats?.active_rides || 0}</div>
                            <div className="stat-label">Active Rides</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-value">{stats?.completed_rides || 0}</div>
                            <div className="stat-label">Completed Rides</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-value">₦{(stats?.total_revenue || 0).toLocaleString()}</div>
                            <div className="stat-label">Total Revenue</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-value">{stats?.pending_withdrawals_count || 0}</div>
                            <div className="stat-label">Pending Withdrawals</div>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        <h2 style={{ padding: '20px', margin: 0 }}>Recent Drivers</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>KYC Status</th>
                                    <th>Driver Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers?.map((driver) => (
                                    <tr key={driver.id}>
                                        <td>{driver.full_name}</td>
                                        <td>{driver.email}</td>
                                        <td>
                                            <span className={`status-badge status-${driver.verification_status}`}>
                                                {driver.verification_status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${driver.driver_status}`}>
                                                {driver.driver_status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn action-btn-edit">Edit</button>
                                            <button className="action-btn action-btn-delete">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </>
    );
}
