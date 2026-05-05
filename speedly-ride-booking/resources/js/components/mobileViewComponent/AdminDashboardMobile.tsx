import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../../components/preloader/MobilePreloader';
import '../../../css/AdminDashboardMobile.css';

interface DashboardStats {
    total_users: number;
    total_drivers: number;
    active_rides: number;
    completed_rides: number;
    total_revenue: number;
}

const AdminDashboardMobile: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        total_users: 0,
        total_drivers: 0,
        active_rides: 0,
        completed_rides: 0,
        total_revenue: 0
    });
    const [adminName, setAdminName] = useState<string>('Admin');
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>('dashboard');

    const preloaderLoading = usePreloader(1000);

    // Fetch dashboard data
    const fetchData = async () => {
        try {
            const response = await fetch('/SERVER/API/admin_dashboard_data.php');
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
                setAdminName(data.admin_name || 'Admin');
                setNotificationCount(data.notification_count || 0);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Yes, logout'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/admin-login';
            }
        });
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    useEffect(() => {
        fetchData();
    }, []);

    if (loading || preloaderLoading) {
        return <MobilePreloader />;
    }

    return (
        <div className="mobile-admin-container">
            <div className="mobile-admin-view">
                {/* Header */}
                <div className="mobile-admin-header">
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Welcome, {adminName}</p>
                    </div>
                    <button className="mobile-notification-btn" onClick={() => router.visit('/notifications')}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="mobile-notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="mobile-stats-grid">
                    <div className="mobile-stat-card">
                        <div className="stat-icon users"><i className="fas fa-users"></i></div>
                        <div className="stat-value">{stats.total_users.toLocaleString()}</div>
                        <div className="stat-label">Users</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-icon drivers"><i className="fas fa-id-card"></i></div>
                        <div className="stat-value">{stats.total_drivers.toLocaleString()}</div>
                        <div className="stat-label">Drivers</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-icon rides"><i className="fas fa-car"></i></div>
                        <div className="stat-value">{stats.active_rides}</div>
                        <div className="stat-label">Active Rides</div>
                    </div>
                    <div className="mobile-stat-card">
                        <div className="stat-icon revenue"><i className="fas fa-naira-sign"></i></div>
                        <div className="stat-value">{formatCurrency(stats.total_revenue)}</div>
                        <div className="stat-label">Revenue</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mobile-tabs">
                    <button className={`mobile-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <i className="fas fa-home"></i> Dashboard
                    </button>
                    <button className={`mobile-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <i className="fas fa-users"></i> Users
                    </button>
                    <button className={`mobile-tab ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
                        <i className="fas fa-id-card"></i> Drivers
                    </button>
                    <button className={`mobile-tab ${activeTab === 'rides' ? 'active' : ''}`} onClick={() => setActiveTab('rides')}>
                        <i className="fas fa-car"></i> Rides
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="mobile-dashboard">
                        <div className="mobile-card">
                            <div className="card-header">
                                <h3>Recent Activity</h3>
                            </div>
                            <div className="activity-list">
                                <p className="activity-item">No recent activity</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="mobile-users">
                        <div className="mobile-card">
                            <div className="card-header">
                                <h3>Users</h3>
                                <button className="refresh-btn" onClick={fetchData}><i className="fas fa-sync-alt"></i></button>
                            </div>
                            <div className="users-list">
                                <p className="empty-state">Loading users...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drivers Tab */}
                {activeTab === 'drivers' && (
                    <div className="mobile-drivers">
                        <div className="mobile-card">
                            <div className="card-header">
                                <h3>Drivers</h3>
                                <button className="refresh-btn" onClick={fetchData}><i className="fas fa-sync-alt"></i></button>
                            </div>
                            <div className="drivers-list">
                                <p className="empty-state">Loading drivers...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rides Tab */}
                {activeTab === 'rides' && (
                    <div className="mobile-rides">
                        <div className="mobile-card">
                            <div className="card-header">
                                <h3>Rides</h3>
                                <button className="refresh-btn" onClick={fetchData}><i className="fas fa-sync-alt"></i></button>
                            </div>
                            <div className="rides-list">
                                <p className="empty-state">Loading rides...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button className="mobile-logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default AdminDashboardMobile;