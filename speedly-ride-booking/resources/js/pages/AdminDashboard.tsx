import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import MobilePreloader from '../components/preloader/MobilePreloader';
import AdminDashboardMobile from '../components/mobileViewComponent/AdminDashboardMobile';
import '../../css/AdminDashboard.css';

// Types (same as before)
interface DashboardStats {
    total_users: number;
    total_drivers: number;
    active_rides: number;
    completed_rides: number;
    total_revenue: number;
    pending_withdrawals: number;
    pending_count: number;
}

interface User {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    created_at: string;
    is_verified: boolean;
}

interface Driver {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    verification_status: string;
    driver_status: string;
    vehicle_count: number;
}

interface Ride {
    id: string;
    ride_number: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    status: string;
    payment_status: string;
    client_name: string;
    driver_name: string;
}

interface Withdrawal {
    id: string;
    driver_name: string;
    amount: number;
    bank_name: string;
    account_number: string;
    status: string;
    created_at: string;
}

interface KYCDocument {
    id: string;
    full_name: string;
    document_type: string;
    verification_status: string;
    created_at: string;
}

interface Dispute {
    id: string;
    dispute_number: string;
    ride_number: string;
    type: string;
    priority: string;
    status: string;
    message_count: number;
    raised_by: string;
    raised_against: string;
}

const AdminDashboard: React.FC = () => {
    const [activePage, setActivePage] = useState<string>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [stats, setStats] = useState<DashboardStats>({
        total_users: 0,
        total_drivers: 0,
        active_rides: 0,
        completed_rides: 0,
        total_revenue: 0,
        pending_withdrawals: 0,
        pending_count: 0
    });
    const [users, setUsers] = useState<User[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [rides, setRides] = useState<Ride[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [adminName, setAdminName] = useState<string>('Admin');
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [timeLeft, setTimeLeft] = useState<number>(1800);
    const [revenueData, setRevenueData] = useState<number[]>([]);
    const [revenueLabels, setRevenueLabels] = useState<string[]>([]);
    
    let chartInstance: Chart | null = null;
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Toggle sidebar on mobile
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.querySelector('.mobile-sidebar');
                const menuBtn = document.querySelector('.menu-toggle');
                if (sidebar && !sidebar.contains(e.target as Node) && menuBtn && !menuBtn.contains(e.target as Node)) {
                    setSidebarOpen(false);
                }
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobile, sidebarOpen]);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/admin_dashboard_data.php');
            const data = await response.json();
            
            if (data.success) {
                setStats(data.stats);
                setUsers(data.users || []);
                setDrivers(data.drivers || []);
                setRides(data.rides || []);
                setWithdrawals(data.withdrawals || []);
                setKycDocuments(data.kyc_documents || []);
                setDisputes(data.disputes || []);
                setNotificationCount(data.notification_count || 0);
                setAdminName(data.admin_name || 'Admin');
                setRevenueData(data.revenue_data || []);
                setRevenueLabels(data.revenue_labels || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize chart
    const initChart = useCallback(async () => {
        const canvas = document.getElementById('revenueChart') as HTMLCanvasElement;
        if (!canvas || !revenueData.length) return;
        
        try {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);
            
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: revenueLabels,
                        datasets: [{
                            label: 'Revenue (₦)',
                            data: revenueData,
                            borderColor: '#ff4500',
                            backgroundColor: 'rgba(255, 69, 0, 0.08)',
                            borderWidth: 2.5,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#ff4500',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '₦' + context.parsed.y.toLocaleString();
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                                ticks: {
                                    callback: function(value) {
                                        return '₦' + (typeof value === 'number' ? value.toLocaleString() : value);
                                    }
                                }
                            },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Chart.js not available. Charts disabled.', error);
        }
    }, [revenueData, revenueLabels]);

    // Session timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    // Fetch data on mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Initialize chart when data loads
    useEffect(() => {
        if (!loading && revenueData.length) {
            initChart();
        }
    }, [loading, revenueData, initChart]);

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ff4500',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/SERVER/API/admin-logout.php').then(() => {
                    router.visit('/admin-login');
                });
            }
        });
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getStatusBadgeClass = (status: string) => {
        switch(status) {
            case 'pending': return 'status-badge pending';
            case 'approved': return 'status-badge approved';
            case 'paid': return 'status-badge paid';
            case 'rejected': return 'status-badge rejected';
            case 'active': return 'status-badge active';
            case 'suspended': return 'status-badge suspended';
            case 'completed': return 'status-badge completed';
            case 'ongoing': return 'status-badge ongoing';
            default: return 'status-badge';
        }
    };

    // SHOW PRELOADER FIRST - This is critical
    if (preloaderLoading) {
        if (isMobile) {
            return <MobilePreloader />;
        }
        return <DesktopPreloader />;
    }

    // SHOW LOADING STATE AFTER PRELOADER
    if (loading) {
        if (isMobile) {
            return <MobilePreloader />;
        }
        return <DesktopPreloader />;
    }

    // Render mobile view after loading is complete
    if (isMobile) {
        return (
            <AdminDashboardMobile
                stats={stats}
                users={users}
                drivers={drivers}
                rides={rides}
                withdrawals={withdrawals}
                kycDocuments={kycDocuments}
                disputes={disputes}
                notificationCount={notificationCount}
                adminName={adminName}
                onLogout={handleLogout}
                formatCurrency={formatCurrency}
                getStatusBadgeClass={getStatusBadgeClass}
            />
        );
    }

    // Desktop navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
        { id: 'users', label: 'Users', icon: 'fa-users' },
        { id: 'drivers', label: 'Drivers', icon: 'fa-id-card' },
        { id: 'rides', label: 'Rides', icon: 'fa-car' },
        { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
        { id: 'wallets', label: 'Wallets', icon: 'fa-wallet' },
        { id: 'kyc', label: 'KYC Approvals', icon: 'fa-file-alt' },
        { id: 'disputes', label: 'Disputes', icon: 'fa-exclamation-triangle' },
        { id: 'reports', label: 'Reports', icon: 'fa-chart-line' },
        { id: 'settings', label: 'Settings', icon: 'fa-cog' },
        { id: 'activity', label: 'Activity Log', icon: 'fa-history' }
    ];

    // Filter functions for desktop
    const filterUsers = (status: string) => setFilterStatus(status);
    const getFilteredUsers = () => {
        if (filterStatus === 'all') return users;
        const isVerified = filterStatus === 'verified';
        return users.filter(user => user.is_verified === isVerified);
    };
    const getFilteredDrivers = () => {
        if (filterStatus === 'all') return drivers;
        return drivers.filter(driver => driver.verification_status === filterStatus);
    };
    const getFilteredRides = () => {
        if (filterStatus === 'all') return rides;
        if (filterStatus === 'ongoing') {
            return rides.filter(ride => ['accepted', 'driver_assigned', 'driver_arrived', 'ongoing'].includes(ride.status));
        }
        return rides.filter(ride => ride.status === filterStatus);
    };
    const getFilteredWithdrawals = () => {
        if (filterStatus === 'all') return withdrawals;
        return withdrawals.filter(w => w.status === filterStatus);
    };
    const getFilteredKYC = () => {
        if (filterStatus === 'all') return kycDocuments;
        return kycDocuments.filter(doc => doc.verification_status === filterStatus);
    };
    const getFilteredDisputes = () => {
        if (filterStatus === 'all') return disputes;
        return disputes.filter(d => d.status === filterStatus);
    };
    const searchUsers = () => {
        if (!searchTerm) return getFilteredUsers();
        return getFilteredUsers().filter(user =>
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <div className="admin-desktop-container">
            {/* Desktop Sidebar - same as before */}
            <div className="admin-sidebar">
                <div className="sidebar-logo">
                    <img src="/main-assets/logo-no-background.png" alt="Speedly" className="logo-image" />
                </div>
                
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => setActivePage(item.id)}
                        >
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                <div className="sidebar-user">
                    <div className="user-avatar">{adminName.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <h4>{adminName}</h4>
                        <p>Super Administrator</p>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            {/* Desktop Main Content */}
            <div className="admin-main">
                <div className="admin-header">
                    <div className="header-title">
                        <h1>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
                        <p>Welcome back, {adminName}! Here's what's happening today.</p>
                    </div>
                    <div className="header-actions">
                        <div className="session-timer">
                            <i className="fas fa-clock"></i>
                            <span>{formatTime()}</span>
                        </div>
                        <button className="notification-btn">
                            <i className="fas fa-bell"></i>
                            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Desktop content - same as before */}
                {activePage === 'dashboard' && (
                    <div className="dashboard-page">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users"><i className="fas fa-users"></i></div>
                                <div className="stat-details">
                                    <h3>Total Users</h3>
                                    <div className="stat-value">{stats.total_users.toLocaleString()}</div>
                                    <div className="stat-change positive">Active</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon drivers"><i className="fas fa-id-card"></i></div>
                                <div className="stat-details">
                                    <h3>Total Drivers</h3>
                                    <div className="stat-value">{stats.total_drivers.toLocaleString()}</div>
                                    <div className="stat-change positive">Registered</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon rides"><i className="fas fa-car"></i></div>
                                <div className="stat-details">
                                    <h3>Active Rides</h3>
                                    <div className="stat-value">{stats.active_rides.toLocaleString()}</div>
                                    <div className="stat-change">Currently on road</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon completed"><i className="fas fa-check-circle"></i></div>
                                <div className="stat-details">
                                    <h3>Completed Rides</h3>
                                    <div className="stat-value">{stats.completed_rides.toLocaleString()}</div>
                                    <div className="stat-change positive">All time</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon revenue"><i className="fas fa-naira-sign"></i></div>
                                <div className="stat-details">
                                    <h3>Total Revenue</h3>
                                    <div className="stat-value">{formatCurrency(stats.total_revenue)}</div>
                                    <div className="stat-change positive">+22% this month</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon pending"><i className="fas fa-clock"></i></div>
                                <div className="stat-details">
                                    <h3>Pending Withdrawals</h3>
                                    <div className="stat-value">{formatCurrency(stats.pending_withdrawals)}</div>
                                    <div className="stat-change negative">{stats.pending_count} requests</div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="card large">
                                <div className="card-header">
                                    <h2>Revenue Overview (Last 7 Days)</h2>
                                </div>
                                <div className="chart-container">
                                    <canvas id="revenueChart"></canvas>
                                </div>
                            </div>
                            
                            <div className="card">
                                <div className="card-header">
                                    <h2>Recent Withdrawals</h2>
                                    <button className="see-all" onClick={() => setActivePage('wallets')}>View All</button>
                                </div>
                                <div className="withdrawal-list">
                                    {withdrawals.slice(0, 5).map(w => (
                                        <div key={w.id} className="withdrawal-item">
                                            <div>
                                                <h4>{w.driver_name}</h4>
                                                <p>Requested: {formatCurrency(w.amount)}</p>
                                            </div>
                                            <span className={getStatusBadgeClass(w.status)}>{w.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="card">
                                <div className="card-header">
                                    <h2>Top Performers</h2>
                                </div>
                                <div className="performer-list">
                                    {drivers.slice(0, 5).map((driver, idx) => (
                                        <div key={driver.id} className="performer-item">
                                            <div className="performer-rank">#{idx + 1}</div>
                                            <div>
                                                <h4>{driver.full_name}</h4>
                                                <p>{driver.vehicle_count} rides</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Page */}
                {activePage === 'users' && (
                    <div className="users-page">
                        <div className="page-header">
                            <h2>User Management</h2>
                            <div className="search-bar">
                                <i className="fas fa-search"></i>
                                <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="filter-tabs">
                                <button className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => filterUsers('all')}>All</button>
                                <button className={`filter-tab ${filterStatus === 'verified' ? 'active' : ''}`} onClick={() => filterUsers('verified')}>Verified</button>
                                <button className={`filter-tab ${filterStatus === 'unverified' ? 'active' : ''}`} onClick={() => filterUsers('unverified')}>Unverified</button>
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {searchUsers().map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id.substring(0, 8)}...</td>
                                            <td>{user.full_name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone_number}</td>
                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td><span className={`status-badge ${user.is_verified ? 'approved' : 'pending'}`}>{user.is_verified ? 'Verified' : 'Unverified'}</span></td>
                                            <td className="actions-cell">
                                                <button className="action-btn" title="View"><i className="fas fa-eye"></i></button>
                                                <button className="action-btn" title="Suspend"><i className="fas fa-ban"></i></button>
                                                <button className="action-btn danger" title="Delete"><i className="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Additional pages... */}
                {['wallets', 'kyc', 'disputes', 'payments', 'reports', 'settings', 'activity'].includes(activePage) && (
                    <div className="coming-soon-page">
                        <div className="coming-soon-card">
                            <i className="fas fa-tools"></i>
                            <h2>Coming Soon</h2>
                            <p>This feature is under development. Please check back later.</p>
                            <button className="btn-premium" onClick={() => setActivePage('dashboard')}>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;