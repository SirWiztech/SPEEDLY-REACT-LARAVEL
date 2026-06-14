import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import ClientNavMobile from '../../components/navbars/ClientNavMobile';
import Swal from 'sweetalert2';
import api from '../../services/api';
import '../../../css/ClientWalletMobile.css';

// Types based on your backend response
interface Transaction {
    id: string;
    transaction_type: string;
    amount: number;
    formatted_amount: string;
    status: string;
    created_at: string;
    date: string;
    reference: string | null;
    description: string | null;
    balance_before: number;
    balance_after: number;
    ride_number: string | null;
    display_id: string;
    is_credit: boolean;
    type_display: string;
}

interface WalletData {
    balance: number;
    currency: string;
    ride_count: number;
    recent_transactions: Transaction[];
    user: {
        full_name: string;
        email: string;
        phone_number: string;
        profile_picture_url: string | null;
    };
    notification_count: number;
    payment_methods: any[];
}

const ClientWalletMobile: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [rideCount, setRideCount] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch wallet data
    const fetchWalletData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Call the wallet endpoint
            const response = await api.client.wallet();
            
            console.log('Wallet API Response:', response);
            
            if (response.success && response.data) {
                const data: WalletData = response.data;
                
                // Set balance
                setWalletBalance(data.balance || 0);
                setRideCount(data.ride_count || 0);
                setNotificationCount(data.notification_count || 0);
                
                // Set user data
                if (data.user) {
                    setUserData(data.user);
                }
                
                // Set transactions
                if (data.recent_transactions && Array.isArray(data.recent_transactions)) {
                    setTransactions(data.recent_transactions);
                }
            } else {
                console.error('Wallet data error:', response);
                // Show error to user
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Failed to load wallet data',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Unable to connect to server. Please check your internet connection.',
                confirmButtonColor: '#ff5e00'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Add funds to wallet
    const addFunds = () => {
        Swal.fire({
            title: 'Add Funds to Wallet',
            html: `
                <input type="number" id="amount" class="swal2-input" placeholder="Enter amount" min="100" step="100">
                <div style="margin-top: 10px; text-align: left; font-size: 13px; color: #666;">
                    <p><i class="fas fa-info-circle" style="color: #ff5e00;"></i> Minimum deposit: ₦100</p>
                    <p><i class="fas fa-credit-card" style="color: #ff5e00;"></i> Secured by KoraPay</p>
                    <p><i class="fas fa-clock" style="color: #ff5e00;"></i> Funds added instantly</p>
                </div>
            `,
            confirmButtonText: 'Proceed to Payment',
            confirmButtonColor: '#ff5e00',
            showCancelButton: true,
            preConfirm: () => {
                const amountInput = document.getElementById('amount') as HTMLInputElement;
                const amount = amountInput?.value;
                if (!amount || parseFloat(amount) < 100) {
                    Swal.showValidationMessage('Please enter a valid amount (minimum ₦100)');
                    return false;
                }
                return { amount: parseFloat(amount) };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                processPayment(result.value.amount);
            }
        });
    };

    // Process payment
    const processPayment = async (amount: number) => {
        let name = userData?.full_name || '';
        let email = userData?.email || '';
        
        if (!email) {
            try { const me = await api.auth.me(); if (me.success && me.data) { email = me.data.email || ''; name = me.data.full_name || me.data.fullname || ''; } } catch {}
        }
        
        if (!email) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Account Error', 
                text: 'User profile not loaded. Please refresh and try again.', 
                confirmButtonColor: '#ff5e00' 
            });
            return;
        }
        
        Swal.fire({
            title: 'Processing...',
            text: 'Initializing payment gateway',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const res = await api.payment.initiate({ amount, email, name });
            Swal.close();

            const checkoutUrl = res.data?.payment_url || res.data?.checkout_url || res.checkout_url;
            const reference = res.data?.reference || res.reference;

            if (res.success && checkoutUrl) {
                sessionStorage.setItem('payment_reference', reference || '');
                window.location.href = checkoutUrl;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Failed',
                    text: res.message || 'Unable to initialize payment',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.close();
            const msg = error instanceof Error ? error.message : 'Unable to connect to payment gateway';
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: msg,
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Request withdrawal (for clients)
    const requestWithdrawal = () => {
        if (walletBalance < 100) {
            Swal.fire({
                icon: 'warning',
                title: 'Insufficient Balance',
                text: 'Minimum withdrawal amount is ₦100',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Request Withdrawal',
            html: `
                <p style="margin-bottom: 15px;">Available Balance: <strong style="color: #ff5e00;">₦${walletBalance.toLocaleString()}</strong></p>
                <input type="number" id="withdraw-amount" class="swal2-input" placeholder="Amount" min="100" max="${walletBalance}" step="100">
                <select id="bank-name" class="swal2-input">
                    <option value="">Select Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank of Nigeria">First Bank</option>
                    <option value="United Bank for Africa (UBA)">UBA</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="OPay">OPay</option>
                    <option value="PalmPay">PalmPay</option>
                    <option value="Moniepoint">Moniepoint</option>
                </select>
                <input type="text" id="account-number" class="swal2-input" placeholder="Account Number" maxlength="10">
                <input type="text" id="account-name" class="swal2-input" placeholder="Account Name">
                <div style="margin-top: 10px; font-size: 12px; color: #666; text-align: left;">
                    <p><i class="fas fa-clock"></i> Withdrawal requests are processed within 24-48 hours after admin approval</p>
                    <p><i class="fas fa-shield-alt"></i> Funds will be deducted from your wallet upon approval</p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            confirmButtonColor: '#ff5e00',
            preConfirm: () => {
                const amount = parseFloat((document.getElementById('withdraw-amount') as HTMLInputElement)?.value);
                const bank = (document.getElementById('bank-name') as HTMLSelectElement)?.value;
                const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;

                if (!amount || amount < 100) {
                    Swal.showValidationMessage('Minimum withdrawal is ₦100');
                    return false;
                }
                if (amount > walletBalance) {
                    Swal.showValidationMessage('Insufficient balance');
                    return false;
                }
                if (!bank) {
                    Swal.showValidationMessage('Please select a bank');
                    return false;
                }
                if (!account || account.length !== 10 || !/^\d+$/.test(account)) {
                    Swal.showValidationMessage('Valid 10-digit account number required');
                    return false;
                }
                if (!name || name.trim().length < 3) {
                    Swal.showValidationMessage('Please enter valid account name');
                    return false;
                }
                return { amount, bank, account, name };
            }
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                Swal.fire({ 
                    title: 'Submitting...', 
                    text: 'Processing your withdrawal request', 
                    allowOutsideClick: false, 
                    didOpen: () => Swal.showLoading() 
                });
                
                try {
                    const res = await api.client.withdraw({
                        amount: result.value.amount,
                        bank_name: result.value.bank,
                        account_number: result.value.account,
                        account_name: result.value.name,
                    });
                    
                    Swal.close();
                    
                    if (res.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Withdrawal Request Submitted!',
                            html: `
                                <div style="text-align: left;">
                                    <p><strong>Amount:</strong> ₦${result.value.amount.toLocaleString()}</p>
                                    <p><strong>Bank:</strong> ${result.value.bank}</p>
                                    <p><strong>Account:</strong> ${result.value.account}</p>
                                    <p><strong>Account Name:</strong> ${result.value.name}</p>
                                    <hr style="margin: 15px 0;">
                                    <p style="color: #666; font-size: 12px;">Your withdrawal request has been submitted for admin approval. You will be notified once processed.</p>
                                </div>
                            `,
                            confirmButtonColor: '#ff5e00'
                        }).then(() => fetchWalletData());
                    } else {
                        Swal.fire({ 
                            icon: 'error', 
                            title: 'Withdrawal Failed', 
                            text: res.message || 'Something went wrong', 
                            confirmButtonColor: '#ff5e00' 
                        });
                    }
                } catch (err: any) {
                    Swal.close();
                    Swal.fire({ 
                        icon: 'error', 
                        title: 'Error', 
                        text: err?.message || 'Failed to submit withdrawal', 
                        confirmButtonColor: '#ff5e00' 
                    });
                }
            }
        });
    };

    // Check payment status for pending transactions
    const checkPaymentStatus = async (reference: string) => {
        Swal.fire({ 
            title: 'Checking...', 
            text: 'Please wait', 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading() 
        });
        
        try {
            const data = await api.payment.verify(reference);
            Swal.close();
            
            if (data.data?.status === 'success' || data.status === 'success') {
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Payment Confirmed!', 
                    text: 'Your wallet has been credited.', 
                    confirmButtonColor: '#ff5e00' 
                }).then(() => fetchWalletData());
            } else if (data.data?.status === 'failed') {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Payment Failed', 
                    text: 'Please try again.', 
                    confirmButtonColor: '#ff5e00' 
                });
            } else {
                Swal.fire({ 
                    icon: 'info', 
                    title: 'Still Processing', 
                    text: 'Please check back later.', 
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Unable to check payment status.', 
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // View transaction details
    const viewTransaction = (transaction: Transaction) => {
        const amountPrefix = transaction.is_credit ? '+' : '-';
        const amountColor = transaction.is_credit ? '#4CAF50' : '#f44336';
        const isPending = transaction.status === 'pending' || transaction.status === 'processing';

        Swal.fire({
            title: 'Transaction Details',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span style="font-weight: bold;">Transaction Details</span>
                            <span style="background: ${transaction.status === 'completed' ? '#4CAF50' : '#FF9800'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px;">
                                ${transaction.status.toUpperCase()}
                            </span>
                        </div>
                        <div style="text-align: center; margin-bottom: 15px;">
                            <span style="font-size: 28px; font-weight: bold; color: ${amountColor}; font-family: monospace;">${amountPrefix}${transaction.formatted_amount}</span>
                        </div>
                        <table style="width: 100%; font-size: 13px;">
                            <tr><td style="padding: 8px 0; color: #666;">Type</td><td style="text-align: right; text-transform: capitalize;">${transaction.type_display}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="text-align: right;">${transaction.date}</td></tr>
                            <tr><td style="padding: 8px 0; color: #666;">Balance After</td><td style="text-align: right; color: #ff5e00; font-family: monospace;">₦${transaction.balance_after.toLocaleString()}</td></tr>
                            ${transaction.reference ? `<tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="text-align: right; font-size: 11px;">${transaction.reference}</td></tr>` : ''}
                            ${transaction.description ? `<tr><td style="padding: 8px 0; color: #666;">Description</td><td style="text-align: right; font-size: 11px;">${transaction.description}</td></tr>` : ''}
                        </table>
                        ${isPending && transaction.reference ? `
                        <div style="margin-top: 12px;">
                            <button onclick="window.checkPaymentStatusMobile('${transaction.reference}')" style="width: 100%; padding: 10px; background: #ff5e00; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                                <i class="fas fa-sync-alt"></i> Check Payment Status
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close',
            width: '450px'
        });
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const data = await api.notifications.list();
            const notifs = data.data?.data || data.data?.notifications || [];
            
            if (notifs.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                notifs.forEach((notif: any) => {
                    html += `
                        <div style="padding: 12px; border-bottom: 1px solid #eee;">
                            <strong>${notif.title}</strong>
                            <p style="margin: 5px 0 0; font-size: 12px; color: #666;">${notif.message}</p>
                            <p style="margin: 5px 0 0; font-size: 10px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';
                
                Swal.fire({ 
                    icon: 'info', 
                    title: `Notifications (${notifs.length})`, 
                    html: html, 
                    confirmButtonColor: '#ff5e00' 
                });
            } else {
                Swal.fire({ 
                    icon: 'info', 
                    title: 'Notifications', 
                    text: 'No new notifications', 
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'info', 
                title: 'Notifications', 
                text: 'Unable to load notifications', 
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Format currency helper
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
    };

    // Get user display name
    const getUserDisplayName = () => {
        if (userData?.full_name) {
            return userData.full_name.split(' ')[0];
        }
        return 'Guest';
    };

    useEffect(() => {
        fetchWalletData();
        
        // Check for payment status from URL params (after redirect from payment gateway)
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment_status');
        const reference = urlParams.get('reference');

        if (paymentStatus === 'completed' && reference) {
            Swal.fire({
                icon: 'success',
                title: 'Deposit Successful!',
                text: 'Your wallet has been credited.',
                confirmButtonColor: '#ff5e00'
            }).then(() => {
                fetchWalletData();
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        } else if (paymentStatus === 'pending' && reference) {
            checkPaymentStatus(reference);
        }
        
        (window as any).checkPaymentStatusMobile = (ref: string) => checkPaymentStatus(ref);
        return () => { delete (window as any).checkPaymentStatusMobile; };
    }, [fetchWalletData]);

    // Show loading state
    if (loading) {
        return (
            <div className="mobile-wallet-container">
                <div className="mobile-wallet-view" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '40px', color: '#ff5e00' }}></i>
                        <p style={{ marginTop: '16px', color: '#666' }}>Loading wallet...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-wallet-container">
            <div className="mobile-wallet-view">
                {/* Header */}
                <div className="mobile-wallet-header">
                    <div className="mobile-wallet-user-info">
                        <h1>Welcome back, {getUserDisplayName()}!</h1>
                        <p>Manage your funds and transactions</p>
                    </div>
                    <button className="mobile-wallet-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="mobile-notification-badge font-roboto-number">{notificationCount}</span>}
                    </button>
                </div>

                {/* Balance Card */}
                <div className="mobile-wallet-balance-card">
                    <div className="mobile-balance-header">
                        <h2>Total Balance</h2>
                        {rideCount > 10 && (
                            <div className="mobile-reward-badge">
                                <i className="fas fa-gift"></i> {rideCount} Rides
                            </div>
                        )}
                    </div>
                    <div className="mobile-balance-amount">{formatCurrency(walletBalance)}</div>
                    <div className="mobile-balance-change">
                        <i className="fas fa-arrow-up"></i>
                        <span>Available balance</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mobile-wallet-section">
                    <h3>Quick Actions</h3>
                    <div className="mobile-quick-actions-grid">
                        <button className="mobile-action-btn" onClick={addFunds}>
                            <div className="mobile-action-icon add-wallet"><i className="fas fa-wallet"></i></div>
                            <span>Add Funds</span>
                        </button>
                        <button className="mobile-action-btn" onClick={requestWithdrawal}>
                            <div className="mobile-action-icon withdraw"><i className="fas fa-money-check-alt"></i></div>
                            <span>Withdraw</span>
                        </button>
                        <button className="mobile-action-btn" onClick={() => router.visit('/clientridehistory')}>
                            <div className="mobile-action-icon history"><i className="fas fa-history"></i></div>
                            <span>History</span>
                        </button>
                        <button className="mobile-action-btn" onClick={() => router.visit('/clientsupport')}>
                            <div className="mobile-action-icon support"><i className="fas fa-headset"></i></div>
                            <span>Support</span>
                        </button>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mobile-wallet-section">
                    <div className="mobile-section-header">
                        <h3>Recent Transactions</h3>
                        <button className="mobile-see-all" onClick={() => router.visit('/clientridehistory')}>See All</button>
                    </div>
                    <div className="mobile-transactions-list">
                        {transactions.length > 0 ? (
                            transactions.slice(0, 5).map((transaction) => (
                                <div key={transaction.id} className="mobile-transaction-item" onClick={() => viewTransaction(transaction)}>
                                    <div className={`mobile-transaction-icon ${transaction.is_credit ? 'credit' : 'debit'}`}>
                                        <i className={`fas fa-${transaction.is_credit ? 'plus' : 'minus'}`}></i>
                                    </div>
                                    <div className="mobile-transaction-details">
                                        <h4>{transaction.type_display}</h4>
                                        <p>{transaction.date}</p>
                                        {(transaction.status === 'pending' || transaction.status === 'processing') && (
                                            <span style={{ color: '#FF9800', fontSize: '10px', fontWeight: 600 }}>PENDING</span>
                                        )}
                                    </div>
                                    <div className={`mobile-transaction-amount ${transaction.is_credit ? 'positive' : 'negative'}`}>
                                        {transaction.is_credit ? '+' : '-'}{transaction.formatted_amount}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="mobile-empty-state">
                                <i className="fas fa-receipt" style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}></i>
                                <p>No transactions yet</p>
                                <p style={{ fontSize: '12px', color: '#999' }}>Your transactions will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Book Ride Button */}
                <button className="mobile-book-ride-btn" onClick={() => router.visit('/clientbookride')}>
                    <i className="fas fa-car"></i>
                    <span>Book a Ride Now</span>
                </button>

                {/* Bottom Navigation */}
                <ClientNavMobile />
            </div>
        </div>
    );
};

export default ClientWalletMobile;