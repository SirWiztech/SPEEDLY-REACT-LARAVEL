import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import '../../../css/AdminDashboardMobile.css';

// Types
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
    raised_against?: string;
}

interface AdminDashboardMobileProps {
    stats: DashboardStats;
    users: User[];
    drivers: Driver[];
    rides: Ride[];
    withdrawals: Withdrawal[];
    kycDocuments: KYCDocument[];
    disputes: Dispute[];
    notificationCount: number;
    adminName: string;
    onLogout: () => void;
    formatCurrency: (amount: number) => string;
    getStatusBadgeClass: (status: string) => string;
}

const AdminDashboardMobile: React.FC<AdminDashboardMobileProps> = ({
    stats,
    users,
    drivers,
    rides,
    withdrawals,
    kycDocuments,
    disputes,
    notificationCount,
    adminName,
    onLogout,
    formatCurrency,
    getStatusBadgeClass
}) => {
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home', color: '#ff4500' },
        { id: 'users', label: 'Users', icon: 'fa-users', color: '#3b82f6' },
        { id: 'drivers', label: 'Drivers', icon: 'fa-id-card', color: '#ff4500' },
        { id: 'rides', label: 'Rides', icon: 'fa-car', color: '#22c55e' },
        { id: 'wallets', label: 'Wallets', icon: 'fa-wallet', color: '#f59e0b' },
        { id: 'kyc', label: 'KYC', icon: 'fa-file-alt', color: '#8b5cf6' },
        { id: 'disputes', label: 'Disputes', icon: 'fa-exclamation-triangle', color: '#ef4444' },
    ];

    const getFilteredUsers = () => {
        if (filterStatus === 'all') return users;
        const isVerified = filterStatus === 'verified';
        return users.filter(user => user.is_verified === isVerified);
    };

    const getFilteredDrivers = () => {
        if (filterStatus === 'all') return drivers;
        return drivers.filter(driver => driver.verification_status === filterStatus);
    };

    const searchUsers = () => {
        if (!searchTerm) return getFilteredUsers();
        return getFilteredUsers().filter(user =>
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const renderDashboard = () => (
        <div className="mobile-dashboard">
            <div className="mobile-stats-grid">
                <div className="mobile-stat-card">
                    <div className="mobile-stat-icon users"><i className="fas fa-users"></i></div>
                    <div className="mobile-stat-info">
                        <h3>Total Users</h3>
                        <p className="stat-value">{stats.total_users.toLocaleString()}</p>
                    </div>
                </div>
                <div className="mobile-stat-card">
                    <div className="mobile-stat-icon drivers"><i className="fas fa-id-card"></i></div>
                    <div className="mobile-stat-info">
                        <h3>Total Drivers</h3>
                        <p className="stat-value">{stats.total_drivers.toLocaleString()}</p>
                    </div>
                </div>
                <div className="mobile-stat-card">
                    <div className="mobile-stat-icon rides"><i className="fas fa-car"></i></div>
                    <div className="mobile-stat-info">
                        <h3>Active Rides</h3>
                        <p className="stat-value">{stats.active_rides.toLocaleString()}</p>
                    </div>
                </div>
                <div className="mobile-stat-card">
                    <div className="mobile-stat-icon revenue"><i className="fas fa-naira-sign"></i></div>
                    <div className="mobile-stat-info">
                        <h3>Total Revenue</h3>
                        <p className="stat-value">{formatCurrency(stats.total_revenue)}</p>
                    </div>
                </div>
            </div>

            <div className="mobile-quick-actions">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <button className="quick-action-btn" onClick={() => setActiveTab('users')}>
                        <i className="fas fa-users"></i>
                        <span>Manage Users</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveTab('drivers')}>
                        <i className="fas fa-id-card"></i>
                        <span>Manage Drivers</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveTab('rides')}>
                        <i className="fas fa-car"></i>
                        <span>View Rides</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => setActiveTab('wallets')}>
                        <i className="fas fa-wallet"></i>
                        <span>Withdrawals</span>
                    </button>
                </div>
            </div>

            <div className="mobile-recent-activity">
                <h3>Recent Withdrawals</h3>
                {withdrawals.slice(0, 3).map(w => (
                    <div key={w.id} className="mobile-activity-item">
                        <div className="activity-info">
                            <p className="activity-title">{w.driver_name}</p>
                            <p className="activity-amount">{formatCurrency(w.amount)}</p>
                        </div>
                        <span className={getStatusBadgeClass(w.status)}>{w.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="mobile-users">
            <div className="mobile-search-bar">
                <i className="fas fa-search"></i>
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
            <div className="mobile-filter-tabs">
                <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
                <button className={`filter-chip ${filterStatus === 'verified' ? 'active' : ''}`} onClick={() => setFilterStatus('verified')}>Verified</button>
                <button className={`filter-chip ${filterStatus === 'unverified' ? 'active' : ''}`} onClick={() => setFilterStatus('unverified')}>Unverified</button>
            </div>
            <div className="mobile-user-list">
                {searchUsers().map(user => (
                    <div key={user.id} className="mobile-user-card">
                        <div className="user-avatar-sm">{user.full_name.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <h4>{user.full_name}</h4>
                            <p>{user.email}</p>
                            <p className="user-phone">{user.phone_number}</p>
                        </div>
                        <span className={`status-badge ${user.is_verified ? 'approved' : 'pending'}`}>
                            {user.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDrivers = () => (
        <div className="mobile-drivers">
            <div className="mobile-filter-tabs">
                <button className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
                <button className={`filter-chip ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Pending</button>
                <button className={`filter-chip ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>Approved</button>
            </div>
            <div className="mobile-driver-list">
                {getFilteredDrivers().map(driver => (
                    <div key={driver.id} className="mobile-driver-card">
                        <div className="driver-avatar">{driver.full_name.charAt(0).toUpperCase()}</div>
                        <div className="driver-info">
                            <h4>{driver.full_name}</h4>
                            <p>{driver.email}</p>
                            <div className="driver-meta">
                                <span className="vehicle-count"><i className="fas fa-car"></i> {driver.vehicle_count} vehicles</span>
                            </div>
                        </div>
                        <div className="driver-status">
                            <span className={getStatusBadgeClass(driver.verification_status)}>{driver.verification_status}</span>
                            <span className={getStatusBadgeClass(driver.driver_status)}>{driver.driver_status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRides = () => (
        <div className="mobile-rides">
            <div className="mobile-ride-list">
                {rides.slice(0, 10).map(ride => (
                    <div key={ride.id} className="mobile-ride-card">
                        <div className="ride-header">
                            <span className="ride-number">#{ride.ride_number}</span>
                            <span className={getStatusBadgeClass(ride.status)}>{ride.status}</span>
                        </div>
                        <div className="ride-details">
                            <p><i className="fas fa-map-marker-alt"></i> {ride.pickup_address?.substring(0, 30)}...</p>
                            <p><i className="fas fa-flag-checkered"></i> {ride.destination_address?.substring(0, 30)}...</p>
                            <div className="ride-participants">
                                <span><i className="fas fa-user"></i> {ride.client_name}</span>
                                <span><i className="fas fa-user-tie"></i> {ride.driver_name || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="ride-footer">
                            <span className="ride-fare">{formatCurrency(ride.total_fare)}</span>
                            <span className={getStatusBadgeClass(ride.payment_status)}>{ride.payment_status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderWallets = () => (
        <div className="mobile-wallets">
            <div className="mobile-withdrawal-list">
                {withdrawals.map(w => (
                    <div key={w.id} className="mobile-withdrawal-card">
                        <div className="withdrawal-info">
                            <h4>{w.driver_name}</h4>
                            <p>{w.bank_name} • ****{w.account_number?.slice(-4)}</p>
                            <p className="withdrawal-date">{new Date(w.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="withdrawal-amount">
                            <p className="amount">{formatCurrency(w.amount)}</p>
                            <span className={getStatusBadgeClass(w.status)}>{w.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderKYC = () => (
        <div className="mobile-kyc">
            <div className="mobile-kyc-list">
                {kycDocuments.map(doc => (
                    <div key={doc.id} className="mobile-kyc-card">
                        <div className="kyc-info">
                            <h4>{doc.full_name}</h4>
                            <p>{doc.document_type.replace('_', ' ')}</p>
                            <p className="kyc-date">Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={getStatusBadgeClass(doc.verification_status)}>{doc.verification_status}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDisputes = () => (
        <div className="mobile-disputes">
            <div className="mobile-dispute-list">
                {disputes.map(dispute => (
                    <div key={dispute.id} className="mobile-dispute-card">
                        <div className="dispute-header">
                            <span className="dispute-number">#{dispute.dispute_number}</span>
                            <span className={`badge badge-${dispute.priority}`}>{dispute.priority}</span>
                        </div>
                        <p className="dispute-type"><i className="fas fa-tag"></i> {dispute.type}</p>
                        <p className="dispute-parties">
                            <span>{dispute.raised_by} vs {dispute.raised_against || 'Unknown'}</span>
                        </p>
                        <div className="dispute-footer">
                            <span className={getStatusBadgeClass(dispute.status)}>{dispute.status}</span>
                            <span className="message-count"><i className="fas fa-comment"></i> {dispute.message_count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="admin-mobile-container">
            {/* Header */}
            <div className="mobile-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>
                <img src="/main-assets/logo-no-background.png" alt="Speedly" className="mobile-logo" />
                <div className="header-right">
                    <button className="mobile-notification-btn">
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                    <button className="mobile-logout-btn" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            {/* Sidebar Drawer */}
            {sidebarOpen && (
                <>
                    <div className="mobile-sidebar-overlay" onClick={toggleSidebar}></div>
                    <div className="mobile-sidebar">
                        <div className="sidebar-header">
                            <img src="/main-assets/logo-no-background.png" alt="Speedly" />
                            <button className="close-sidebar" onClick={toggleSidebar}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="sidebar-user-info">
                            <div className="user-avatar-lg">{adminName.charAt(0).toUpperCase()}</div>
                            <h3>{adminName}</h3>
                            <p>Super Administrator</p>
                        </div>
                        <nav className="mobile-nav">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                >
                                    <i className={`fas ${item.icon}`} style={{ color: item.color }}></i>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                        <button className="mobile-logout-full" onClick={onLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="mobile-main-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'drivers' && renderDrivers()}
                {activeTab === 'rides' && renderRides()}
                {activeTab === 'wallets' && renderWallets()}
                {activeTab === 'kyc' && renderKYC()}
                {activeTab === 'disputes' && renderDisputes()}
            </div>
        </div>
    );
};

export default AdminDashboardMobile;