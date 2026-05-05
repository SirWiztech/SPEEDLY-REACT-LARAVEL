import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import DriverWalletMobile from '../components/mobileViewComponent/DriverWalletMobile';
import '../../css/DriverWallet.css';

// Types
interface RideEarning {
    id: string;
    ride_number: string;
    total_fare: number;
    driver_payout: number;
    created_at: string;
    formatted_date: string;
    formatted_time: string;
    pickup_address: string;
    destination_address: string;
    client_name: string;
}

interface Withdrawal {
    id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    created_at: string;
    formatted_date: string;
}

interface WalletStats {
    wallet_balance: number;
    total_earnings: number;
    total_withdrawn: number;
    today_earnings: number;
    week_earnings: number;
}

const DriverWallet: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState<WalletStats>({
        wallet_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
        today_earnings: 0,
        week_earnings: 0
    });
    const [recentRides, setRecentRides] = useState<RideEarning[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch wallet data
    const fetchWalletData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/driver_wallet_data.php');
            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                setStats(data.stats);
                setRecentRides(data.recent_rides || []);
                setWithdrawals(data.withdrawals || []);
                setNotificationCount(data.notification_count || 0);
            } else {
                console.error('Failed to fetch wallet data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Withdraw funds
    const withdrawFunds = () => {
        if (stats.wallet_balance < 1000) {
            Swal.fire({
                title: 'Insufficient Balance',
                text: `Minimum withdrawal amount is ₦1,000. Your current balance is ₦${stats.wallet_balance.toLocaleString()}`,
                icon: 'warning',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Withdraw Funds',
            html: `
                <p class="mb-4">Available balance: <strong>₦${stats.wallet_balance.toLocaleString()}</strong></p>
                <input type="number" id="withdraw-amount" class="swal2-input" placeholder="Enter amount" min="1000" max="${stats.wallet_balance}" step="100">
                <select id="bank-name" class="swal2-input">
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank of Nigeria">First Bank</option>
                    <option value="United Bank for Africa (UBA)">UBA</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Fidelity Bank">Fidelity Bank</option>
                    <option value="Union Bank of Nigeria">Union Bank</option>
                    <option value="Sterling Bank">Sterling Bank</option>
                    <option value="EcoBank">EcoBank</option>
                    <option value="Polaris Bank">Polaris Bank</option>
                    <option value="Stanbic IBTC">Stanbic IBTC</option>
                    <option value="Opay">Opay</option>
                    <option value="PalmPay">PalmPay</option>
                    <option value="Moniepoint">Moniepoint</option>
                </select>
                <input type="text" id="account-number" class="swal2-input" placeholder="Account Number (10 digits)" maxlength="10">
                <input type="text" id="account-name" class="swal2-input" placeholder="Account Name">
            `,
            showCancelButton: true,
            confirmButtonText: 'Withdraw',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const amount = parseFloat((document.getElementById('withdraw-amount') as HTMLInputElement)?.value);
                const bank = (document.getElementById('bank-name') as HTMLSelectElement)?.value;
                const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                
                if (!amount || amount < 1000) {
                    Swal.showValidationMessage('Minimum withdrawal is ₦1,000');
                    return false;
                }
                if (amount > stats.wallet_balance) {
                    Swal.showValidationMessage('Insufficient balance');
                    return false;
                }
                if (!bank) {
                    Swal.showValidationMessage('Please select a bank');
                    return false;
                }
                if (!account || account.length !== 10 || !/^\d+$/.test(account)) {
                    Swal.showValidationMessage('Please enter a valid 10-digit account number');
                    return false;
                }
                if (!name || name.length < 3) {
                    Swal.showValidationMessage('Please enter a valid account name');
                    return false;
                }
                return { amount, bank, account, name };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const formData = new FormData();
                formData.append('amount', result.value.amount.toString());
                formData.append('bank_name', result.value.bank);
                formData.append('account_number', result.value.account);
                formData.append('account_name', result.value.name);
                
                Swal.fire({
                    title: 'Processing...',
                    html: 'Please wait while we submit your withdrawal request.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                
                fetch('/SERVER/API/request_withdrawal.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        Swal.fire({
                            title: 'Success!',
                            html: `
                                <p>Withdrawal request submitted successfully!</p>
                                <p class="mt-2">Amount: <strong>₦${result.value.amount.toLocaleString()}</strong></p>
                                <p>Bank: ${result.value.bank}</p>
                                <p>Account: ${result.value.account}</p>
                                <p class="mt-3 text-sm text-gray-500">Your withdrawal will be processed within 24-48 hours.</p>
                            `,
                            icon: 'success',
                            confirmButtonColor: '#ff5e00'
                        }).then(() => {
                            fetchWalletData();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: data.message || 'Failed to submit withdrawal request',
                            icon: 'error',
                            confirmButtonColor: '#ff5e00'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Network error. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#ff5e00'
                    });
                });
            }
        });
    };

    // View transaction history
    const viewHistory = () => {
        router.visit('/book-history');
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const response = await fetch('/SERVER/API/get_notifications.php');
            const data = await response.json();

            if (data.success && data.notifications && data.notifications.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                data.notifications.forEach((notif: any) => {
                    html += `
                        <div style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p><strong>${notif.title || 'Notification'}</strong></p>
                            <p style="font-size: 13px; color: #666;">${notif.message || ''}</p>
                            <p style="font-size: 11px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';

                Swal.fire({
                    title: `Notifications (${data.notifications.length})`,
                    html: html,
                    icon: 'info',
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close'
                });
            } else {
                Swal.fire({
                    title: 'Notifications',
                    text: 'No new notifications',
                    icon: 'info',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Notifications',
                text: 'No new notifications',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const firstName = userData?.fullname?.split(' ')[0] || 'Driver';
    const userInitial = userData?.fullname?.charAt(0)?.toUpperCase() || 'D';

    const getWithdrawalStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge pending">Pending</span>;
            case 'approved':
                return <span className="status-badge approved">Approved</span>;
            case 'paid':
                return <span className="status-badge paid">Paid</span>;
            case 'rejected':
                return <span className="status-badge rejected">Rejected</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <DriverWalletMobile />;
    }

    return (
        <div className="driver-wallet-desktop-container">
            <DriverSidebarDesktop 
                userName={userData?.fullname || 'Driver'} 
                userRole="driver"
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="driver-wallet-desktop-main">
                {/* Header */}
                <div className="driver-wallet-header">
                    <div className="driver-wallet-title">
                        <h1>Driver Wallet</h1>
                        <p>Manage your earnings and withdrawals</p>
                    </div>
                    <button className="driver-wallet-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Balance Card */}
                <div className="wallet-balance-card">
                    <div className="balance-card-content">
                        <div>
                            <p className="balance-label">Available Balance</p>
                            <p className="balance-amount">{formatCurrency(stats.wallet_balance)}</p>
                            <p className="total-earnings">Total Lifetime Earnings: {formatCurrency(stats.total_earnings)}</p>
                        </div>
                        <div className="balance-icon">
                            <i className="fas fa-wallet"></i>
                        </div>
                    </div>
                    <div className="balance-actions">
                        <button className="withdraw-btn" onClick={withdrawFunds}>
                            <i className="fas fa-hand-holding-usd"></i> Withdraw Funds
                        </button>
                        <button className="history-btn" onClick={viewHistory}>
                            <i className="fas fa-history"></i> Transaction History
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="wallet-stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Today's Earnings</div>
                        <div className="stat-value">{formatCurrency(stats.today_earnings)}</div>
                        <div className={`stat-subtext ${stats.today_earnings > 0 ? 'active' : 'inactive'}`}>
                            {stats.today_earnings > 0 ? '✓ Active today' : 'No rides yet today'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">This Week</div>
                        <div className="stat-value">{formatCurrency(stats.week_earnings)}</div>
                        <div className="stat-subtext">Weekly total</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Earnings</div>
                        <div className="stat-value">{formatCurrency(stats.total_earnings)}</div>
                        <div className="stat-subtext">Lifetime earnings</div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="wallet-two-columns">
                    {/* Recent Ride Earnings */}
                    <div className="recent-earnings-card">
                        <div className="card-header">
                            <h2>Recent Ride Earnings</h2>
                        </div>
                        <div className="card-body earnings-list">
                            {recentRides.length > 0 ? (
                                recentRides.map((ride) => (
                                    <div key={ride.id} className="earning-item">
                                        <div className="earning-info">
                                            <div className="earning-title">Ride #{ride.ride_number?.substring(-8) || ride.id.substring(-8)}</div>
                                            <div className="earning-date">{ride.formatted_date} • {ride.formatted_time}</div>
                                            <div className="earning-location">{ride.pickup_address?.substring(0, 35)}...</div>
                                        </div>
                                        <div className="earning-amount">
                                            <div className="amount-positive">+{formatCurrency(ride.driver_payout)}</div>
                                            <div className="amount-subtext">Fare: {formatCurrency(ride.total_fare)}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-coins"></i>
                                    <p>No earnings yet</p>
                                    <span>Complete rides to see earnings here</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Withdrawal History */}
                    <div className="withdrawal-history-card">
                        <div className="card-header">
                            <h2>Withdrawal History</h2>
                        </div>
                        <div className="card-body withdrawal-list">
                            {withdrawals.length > 0 ? (
                                withdrawals.map((withdrawal) => (
                                    <div key={withdrawal.id} className="withdrawal-item">
                                        <div className="withdrawal-info">
                                            <div className="withdrawal-amount">{formatCurrency(withdrawal.amount)}</div>
                                            <div className="withdrawal-date">{withdrawal.formatted_date}</div>
                                            <div className="withdrawal-bank">{withdrawal.bank_name}</div>
                                        </div>
                                        <div className="withdrawal-status">
                                            {getWithdrawalStatusBadge(withdrawal.status)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <i className="fas fa-history"></i>
                                    <p>No withdrawals yet</p>
                                    <span>Your withdrawal history will appear here</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverWallet;