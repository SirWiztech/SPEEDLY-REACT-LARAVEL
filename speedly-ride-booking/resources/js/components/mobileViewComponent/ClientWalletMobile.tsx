import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/ClientWallet.css';

interface WalletData {
    balance: number;
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
}

export default function ClientWalletMobile() {
    const loading = usePreloader(1500);
    const [showTopUp, setShowTopUp] = useState(false);

    const { data: wallet, isLoading } = useQuery<WalletData>({
        queryKey: ['client-wallet-mobile'],
        queryFn: () => fetch('/api/client/wallet').then(res => res.json()),
    });

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Wallet - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>My Wallet</h1>
                </div>

                <div className="wallet-balance-card">
                    <h3>Available Balance</h3>
                    <div className="balance-amount">${(wallet?.balance || 0).toFixed(2)}</div>
                    <button 
                        className="btn-premium"
                        onClick={() => setShowTopUp(true)}
                    >
                        Top Up Wallet
                    </button>
                </div>

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

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
