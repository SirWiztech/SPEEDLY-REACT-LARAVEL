import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';
import '../../css/DriverWallet.css';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    category: string;
    description: string;
    created_at: string;
}

interface WalletData {
    balance: number;
    currency: string;
    pending_withdrawals?: number;
    recent_transactions: Transaction[];
}

export default function DriverWallet() {
    const loading = usePreloader(1000);
    const isMobile = useMobile();
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const { data: wallet, isLoading } = useQuery<WalletData>({
        queryKey: ['driver-wallet'],
        queryFn: () => api.driver.wallet().then(res => res.data),
    });

    const withdrawMutation = useMutation({
        mutationFn: (amount: string) => api.driver.requestWithdrawal({ amount: parseFloat(amount) }),
    });

    const handleWithdraw = () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
        withdrawMutation.mutate(withdrawAmount);
        setShowWithdraw(false);
        setWithdrawAmount('');
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Driver Wallet" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <DriverSidebarDesktop userName="Driver" />
                </div>

                <div className="main-content">
                    <div className="mobile-header">
                        <h1>My Wallet</h1>
                    </div>

                    <div className="wallet-balance-card">
                        <h3>Available Balance</h3>
                        <div className="balance-amount">₦{(wallet?.balance || 0).toLocaleString()}</div>
                        {wallet?.pending_withdrawals && wallet.pending_withdrawals > 0 && (
                            <p className="pending-balance">
                                Pending Withdrawals: ₦{wallet.pending_withdrawals.toLocaleString()}
                            </p>
                        )}
                        <button 
                            className="btn-premium"
                            onClick={() => setShowWithdraw(true)}
                        >
                            Withdraw Funds
                        </button>
                    </div>

                    {showWithdraw && (
                        <div className="withdraw-modal">
                            <h3>Withdraw Funds</h3>
                            <div className="form-group">
                                <label>Amount</label>
                                <input 
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="btn-premium"
                                    onClick={handleWithdraw}
                                    disabled={withdrawMutation.isPending}
                                >
                                    {withdrawMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setShowWithdraw(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="transactions-section">
                        <h2>Recent Transactions</h2>
                        <div className="transactions-list">
                            {wallet?.recent_transactions.map((tx) => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="tx-icon">
                                        {tx.type === 'credit' ? '↗️' : '↘️'}
                                    </div>
                                    <div className="tx-details">
                                        <p className="tx-desc">{tx.description || tx.category}</p>
                                        <p className="tx-date">{new Date(tx.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
