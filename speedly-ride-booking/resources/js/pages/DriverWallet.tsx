import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/DriverWallet.css';

interface WalletData {
    balance: number;
    pending_balance: number;
    total_earnings: number;
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
}

export default function DriverWallet() {
    const loading = usePreloader(1000);
    const isMobile = useMobile();
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const { data: wallet, isLoading } = useQuery<WalletData>({
        queryKey: ['driver-wallet'],
        queryFn: () => fetch('/api/driver/wallet').then(res => res.json()),
    });

    const withdrawMutation = useMutation({
        mutationFn: (amount: string) => 
            fetch('/api/driver/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            }).then(res => res.json()),
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
                        <div className="balance-amount">${(wallet?.balance || 0).toFixed(2)}</div>
                        <p className="pending-balance">
                            Pending: ${(wallet?.pending_balance || 0).toFixed(2)}
                        </p>
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
                            {wallet?.transactions.map((tx) => (
                                <div key={tx.id} className="transaction-item">
                                    <div className="tx-icon">
                                        {tx.type === 'credit' ? '↗️' : '↘️'}
                                    </div>
                                    <div className="tx-details">
                                        <p className="tx-desc">{tx.description}</p>
                                        <p className="tx-date">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`tx-amount ${tx.type}`}>
                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
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
