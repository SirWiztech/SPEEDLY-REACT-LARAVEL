import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import DriverSidebarDesktop from '../components/navbars/DriverSidebarDesktop';
import Swal from 'sweetalert2';
import api from '../services/api';
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
    month_earnings: number;
    pending_withdrawals: number;
}

const DriverWallet: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [stats, setStats] = useState<WalletStats>({
        wallet_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
        today_earnings: 0,
        week_earnings: 0,
        month_earnings: 0,
        pending_withdrawals: 0
    });
    const [recentRides, setRecentRides] = useState<RideEarning[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch wallet data
    const fetchWalletData = useCallback(async () => {
        setLoading(true);
        setApiError(null);

        const results = await Promise.allSettled([
            api.driver.wallet(),
            api.driver.transactions(),
            api.driver.profile()
        ]);

        const [walletResult, txResult, profileResult] = results;

        if (walletResult.status === 'fulfilled') {
            const walletData = walletResult.value;
            const w = walletData.data || walletData;
            if (w.stats) setStats(w.stats);
            if (w.user) setUserData(w.user);
            if (w.notification_count !== undefined) setNotificationCount(w.notification_count);
        } else {
            setApiError('Network error. Unable to load wallet data.');
        }

        if (txResult.status === 'fulfilled') {
            const txData = txResult.value;
            const t = txData.data || txData;
            if (t.recent_rides) setRecentRides(t.recent_rides);
            if (t.withdrawals) setWithdrawals(t.withdrawals);
        }

        if (profileResult.status === 'fulfilled') {
            const profileData = profileResult.value;
            const user = profileData.data?.user || profileData.user || profileData.data;
            if (user) setUserData(user);
        }

        setLoading(false);
    }, []);

    // Withdraw funds
    const withdrawFunds = () => {
        if (stats.wallet_balance < 100) {
            Swal.fire({
                title: 'Insufficient Balance',
                html: `Minimum withdrawal amount is <strong>₦100</strong><br>Your current balance is <strong>₦${stats.wallet_balance.toLocaleString()}</strong>`,
                icon: 'warning',
                confirmButtonColor: '#ff5e00',
                confirmButtonText: 'Got it'
            });
            return;
        }

        Swal.fire({
            title: '<span style="font-family: Syne">Withdraw Funds</span>',
            html: `
                <div style="text-align: left; padding: 8px 0;">
                    <div style="background: linear-gradient(135deg, #ff5e00, #ff8c3a); padding: 16px; border-radius: 16px; color: white; margin-bottom: 20px; text-align: center;">
                        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">Available Balance</p>
                        <p style="font-size: 28px; font-weight: 700;">₦${stats.wallet_balance.toLocaleString()}</p>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #333;">Amount to Withdraw</label>
                        <input type="number" id="withdraw-amount" class="swal2-input" placeholder="Enter amount" min="100" max="${stats.wallet_balance}" step="100" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0; font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #333;">Select Bank</label>
                        <select id="bank-name" class="swal2-input" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0;">
                            <option value="">Choose a bank</option>
                            <option value="Access Bank" data-code="044">Access Bank</option>
                            <option value="GTBank" data-code="058">GTBank</option>
                            <option value="First Bank of Nigeria" data-code="011">First Bank</option>
                            <option value="United Bank for Africa (UBA)" data-code="033">UBA</option>
                            <option value="Zenith Bank" data-code="057">Zenith Bank</option>
                            <option value="Fidelity Bank" data-code="070">Fidelity Bank</option>
                            <option value="Union Bank of Nigeria" data-code="032">Union Bank</option>
                            <option value="Sterling Bank" data-code="232">Sterling Bank</option>
                            <option value="EcoBank" data-code="050">EcoBank</option>
                            <option value="Polaris Bank" data-code="076">Polaris Bank</option>
                            <option value="Stanbic IBTC" data-code="221">Stanbic IBTC</option>
                            <option value="Opay" data-code="999992">Opay</option>
                            <option value="PalmPay" data-code="999991">PalmPay</option>
                            <option value="Moniepoint" data-code="50515">Moniepoint</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #333;">Account Number</label>
                        <input type="text" id="account-number" class="swal2-input" placeholder="10-digit account number" maxlength="10" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0;">
                    </div>
                    
                    <div style="margin-bottom: 8px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #333;">Account Name</label>
                        <input type="text" id="account-name" class="swal2-input" placeholder="Account holder name" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0;">
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #333;">Password</label>
                        <input type="password" id="withdraw-password" class="swal2-input" placeholder="Enter your password" style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e0e0e0;">
                    </div>
                    
                    <div style="margin-top: 16px; padding: 12px; background: #fff8e6; border-radius: 12px; font-size: 12px; color: #856404;">
                        <i class="fas fa-info-circle"></i> Funds will be sent to your bank account immediately
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-hand-holding-usd"></i> Withdraw',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#ff5e00',
            cancelButtonColor: '#6c757d',
            preConfirm: () => {
                const amount = parseFloat((document.getElementById('withdraw-amount') as HTMLInputElement)?.value);
                const bankSelect = document.getElementById('bank-name') as HTMLSelectElement;
                const bank = bankSelect?.value;
                const bankCode = bankSelect?.selectedOptions?.[0]?.getAttribute('data-code') || '';
                const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                const password = (document.getElementById('withdraw-password') as HTMLInputElement)?.value;
                
                if (!amount || isNaN(amount) || amount < 100) {
                    Swal.showValidationMessage('Minimum withdrawal amount is ₦100');
                    return false;
                }
                if (amount > stats.wallet_balance) {
                    Swal.showValidationMessage(`Insufficient balance. Maximum withdrawal is ₦${stats.wallet_balance.toLocaleString()}`);
                    return false;
                }
                if (!password) {
                    Swal.showValidationMessage('Please enter your password');
                    return false;
                }
                if (!bank) {
                    Swal.showValidationMessage('Please select your bank');
                    return false;
                }
                if (!account || account.length !== 10 || !/^\d+$/.test(account)) {
                    Swal.showValidationMessage('Please enter a valid 10-digit account number');
                    return false;
                }
                if (!name || name.trim().length < 3) {
                    Swal.showValidationMessage('Please enter the account holder name');
                    return false;
                }
                return { amount, bank, bankCode, account, name: name.trim(), password };
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                Swal.fire({
                    title: 'Processing Withdrawal',
                    html: 'Please wait while we process your payout...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                try {
                    const v = result.value;
                    const data = await api.driver.requestWithdrawal({
                        amount: v.amount,
                        password: v.password,
                        bank_name: v.bank,
                        bank_code: v.bankCode,
                        account_number: v.account,
                        account_name: v.name,
                    });

                    if (data.success) {
                        Swal.fire({
                            title: 'Withdrawal Successful!',
                            html: `
                                <div style="text-align: left;">
                                    <div style="background: #d1fae5; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
                                        <p style="font-size: 12px; color: #065f46; margin-bottom: 4px;">Amount Sent</p>
                                        <p style="font-size: 24px; font-weight: 700; color: #065f46;">₦${v.amount.toLocaleString()}</p>
                                    </div>
                                    <div style="margin-bottom: 12px;">
                                        <p style="font-size: 12px; color: #666;">Bank: <strong>${v.bank}</strong></p>
                                        <p style="font-size: 12px; color: #666;">Account: <strong>${v.account}</strong></p>
                                        <p style="font-size: 12px; color: #666;">Name: <strong>${v.name}</strong></p>
                                    </div>
                                    <div style="background: #d1fae5; padding: 12px; border-radius: 12px;">
                                        <p style="font-size: 12px; color: #065f46;"><i class="fas fa-check-circle"></i> Funds sent to your bank account</p>
                                    </div>
                                </div>
                            `,
                            icon: 'success',
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Done'
                        }).then(() => {
                            fetchWalletData();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Withdrawal Failed',
                            text: data.message || 'Failed to process withdrawal.',
                            confirmButtonColor: '#ff5e00'
                        });
                    }
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Connection Error',
                        text: 'Network error. Please check your connection and try again.',
                        confirmButtonColor: '#ff5e00'
                    });
                }
            }
        });
    };

    // Quick add funds
    const addFunds = () => {
        Swal.fire({
            title: 'Add Funds',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 16px;">Choose amount to add to wallet:</p>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                        <button type="button" class="amount-option" data-amount="5000">₦5,000</button>
                        <button type="button" class="amount-option" data-amount="10000">₦10,000</button>
                        <button type="button" class="amount-option" data-amount="25000">₦25,000</button>
                        <button type="button" class="amount-option" data-amount="50000">₦50,000</button>
                    </div>
                    <div>
                        <label>Custom Amount</label>
                        <input type="number" id="custom-amount" class="swal2-input" placeholder="Enter amount" style="width: 100%;">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Proceed to Payment',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const customAmount = (document.getElementById('custom-amount') as HTMLInputElement)?.value;
                const selectedAmount = document.querySelector('.amount-option.selected')?.getAttribute('data-amount');
                const amount = customAmount ? parseFloat(customAmount) : (selectedAmount ? parseFloat(selectedAmount) : null);
                
                if (!amount || amount < 100) {
                    Swal.showValidationMessage('Please select or enter a valid amount (minimum ₦100)');
                    return false;
                }
                return { amount };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing Payment',
                    html: 'Redirecting to payment gateway...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                try {
                    const data = await api.payment.initiate({
                        amount: result.value.amount,
                        email: userData?.email || '',
                        name: userData?.fullname || userData?.full_name || 'Driver',
                    });

                    if (data.success && data.data?.checkout_url) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Redirecting...',
                            text: 'You will be redirected to the payment page.',
                            confirmButtonColor: '#ff5e00',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            window.location.href = data.data.checkout_url;
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Initiation Failed',
                            text: data.message || 'Failed to initiate payment.',
                            confirmButtonColor: '#ff5e00'
                        });
                    }
                } catch (error) {
                    const msg = error instanceof Error ? error.message : 'Network error. Please try again.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Failed',
                        text: msg,
                        confirmButtonColor: '#ff5e00'
                    });
                }
            }
        });
        
        setTimeout(() => {
            document.querySelectorAll('.amount-option').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }, 100);
    };

    // View all transactions
    const viewAllTransactions = () => {
        router.visit('/driverbookhistory');
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const response = await api.notifications.list();
            const payload = response.data || response;
            const notifications = payload.data || [];

            if (notifications.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                notifications.forEach((notif: any) => {
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
                    title: `Notifications (${notifications.length})`,
                    html: html,
                    icon: 'info',
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'Close'
                });
            } else {
                Swal.fire({
                    title: 'No Notifications',
                    text: 'You have no new notifications',
                    icon: 'info',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'No Notifications',
                text: 'You have no new notifications',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const userInitial = (userData?.fullname || userData?.full_name)?.charAt(0)?.toUpperCase() || 'D';

    const getWithdrawalStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="status-badge-pending"><i className="fas fa-clock"></i> Pending</span>;
            case 'approved':
                return <span className="status-badge-approved"><i className="fas fa-check-circle"></i> Approved</span>;
            case 'paid':
                return <span className="status-badge-paid"><i className="fas fa-check-double"></i> Paid</span>;
            case 'rejected':
                return <span className="status-badge-rejected"><i className="fas fa-times-circle"></i> Rejected</span>;
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

    // Render mobile view - Imported separate component
    if (isMobile) {
        return <DriverWalletMobile />;
    }

    // Desktop View
    return (
        <div className="driver-wallet-desktop-container">
            <DriverSidebarDesktop 
                userName={userData?.fullname || userData?.full_name || 'Driver'} 
                userRole="driver"
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="driver-wallet-desktop-main">
                {/* Header */}
                <div className="wallet-desktop-header">
                    <div className="wallet-header-title">
                        <h1>Driver Wallet</h1>
                        <p>Manage your earnings and withdrawals</p>
                    </div>
                    <button className="wallet-desktop-notification" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notif-badge-desktop">{notificationCount}</span>}
                    </button>
                </div>

                {/* API Error Alert */}
                {apiError && (
                    <div className="api-alert">
                        <i className="fas fa-info-circle"></i>
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Main Scrollable Content */}
                <div className="wallet-desktop-scroll-content">
                    {/* Hero Balance Card */}
                    <div className="wallet-hero-card">
                        <div className="hero-card-bg"></div>
                        <div className="hero-card-content">
                            <div className="hero-balance-section">
                                <p className="hero-balance-label">Available Balance</p>
                                <p className="hero-balance-amount">{formatCurrency(stats.wallet_balance)}</p>
                                <div className="hero-balance-actions">
                                    <button className="hero-withdraw-btn" onClick={withdrawFunds}>
                                        <i className="fas fa-hand-holding-usd"></i> Withdraw
                                    </button>
                                    <button className="hero-add-btn" onClick={addFunds}>
                                        <i className="fas fa-plus-circle"></i> Add Funds
                                    </button>
                                </div>
                            </div>
                            <div className="hero-stats-section">
                                <div className="hero-stat">
                                    <span className="hero-stat-label">Today's Earnings</span>
                                    <span className="hero-stat-value">{formatCurrency(stats.today_earnings)}</span>
                                </div>
                                <div className="hero-stat">
                                    <span className="hero-stat-label">This Week</span>
                                    <span className="hero-stat-value">{formatCurrency(stats.week_earnings)}</span>
                                </div>
                                <div className="hero-stat">
                                    <span className="hero-stat-label">This Month</span>
                                    <span className="hero-stat-value">{formatCurrency(stats.month_earnings)}</span>
                                </div>
                                <div className="hero-stat">
                                    <span className="hero-stat-label">Total Earned</span>
                                    <span className="hero-stat-value">{formatCurrency(stats.total_earnings)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="wallet-desktop-grid">
                        {/* Recent Earnings */}
                        <div className="wallet-card earnings-card">
                            <div className="card-header-custom">
                                <h3><i className="fas fa-chart-simple"></i> Recent Earnings</h3>
                                <button className="view-all-link" onClick={viewAllTransactions}>
                                    View All <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                            <div className="earnings-list-desktop">
                                {recentRides.length > 0 ? (
                                    recentRides.map((ride, index) => (
                                        <div key={ride.id} className={`earning-row ${index === recentRides.length - 1 ? 'last' : ''}`}>
                                            <div className="earning-icon-wrapper">
                                                <i className="fas fa-taxi"></i>
                                            </div>
                                            <div className="earning-details">
                                                <div className="earning-route">
                                                    <span className="pickup">{ride.pickup_address?.split(',')[0]}</span>
                                                    <i className="fas fa-arrow-right arrow-icon"></i>
                                                    <span className="destination">{ride.destination_address?.split(',')[0]}</span>
                                                </div>
                                                <div className="earning-meta">
                                                    <span><i className="far fa-calendar-alt"></i> {ride.formatted_date}</span>
                                                    <span><i className="far fa-clock"></i> {ride.formatted_time}</span>
                                                    <span><i className="fas fa-user"></i> {ride.client_name}</span>
                                                </div>
                                            </div>
                                            <div className="earning-amount-desktop positive">
                                                +{formatCurrency(ride.driver_payout)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state-desktop">
                                        <i className="fas fa-chart-line"></i>
                                        <p>No recent earnings</p>
                                        <span>Complete rides to see your earnings</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Withdrawal History */}
                        <div className="wallet-card withdrawals-card">
                            <div className="card-header-custom">
                                <h3><i className="fas fa-history"></i> Withdrawal History</h3>
                                <button className="view-all-link" onClick={withdrawFunds}>
                                    New Request <i className="fas fa-plus"></i>
                                </button>
                            </div>
                            <div className="withdrawals-list-desktop">
                                {withdrawals.length > 0 ? (
                                    withdrawals.map((withdrawal) => (
                                        <div key={withdrawal.id} className="withdrawal-row">
                                            <div className="withdrawal-icon">
                                                <i className="fas fa-university"></i>
                                            </div>
                                            <div className="withdrawal-details">
                                                <div className="withdrawal-amount">{formatCurrency(withdrawal.amount)}</div>
                                                <div className="withdrawal-meta">
                                                    <span>{withdrawal.bank_name}</span>
                                                    <span>•</span>
                                                    <span>{withdrawal.formatted_date}</span>
                                                </div>
                                            </div>
                                            <div className="withdrawal-status-badge">
                                                {getWithdrawalStatusBadge(withdrawal.status)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state-desktop">
                                        <i className="fas fa-receipt"></i>
                                        <p>No withdrawal history</p>
                                        <span>Your withdrawal requests will appear here</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Summary stats */}
                            <div className="withdrawal-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Withdrawn</span>
                                    <span className="summary-value">{formatCurrency(stats.total_withdrawn)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Pending</span>
                                    <span className="summary-value pending">{formatCurrency(stats.pending_withdrawals)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips Card */}
                    <div className="wallet-tips-card">
                        <div className="tips-icon">
                            <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className="tips-content">
                            <h4>Quick Tips</h4>
                            <p>Complete more rides to increase your earnings. Withdrawals are processed within 24-48 hours to your registered bank account.</p>
                        </div>
                        <div className="tips-stat">
                            <span className="tips-stat-label">Available Balance</span>
                            <span className="tips-stat-value">₦{(stats.wallet_balance || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverWallet;