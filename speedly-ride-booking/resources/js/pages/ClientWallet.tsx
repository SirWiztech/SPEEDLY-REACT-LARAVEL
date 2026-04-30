import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import '../../css/ClientWallet.css';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  formatted_amount?: string;
  display_id?: string;
  type_display?: string;
  is_credit?: boolean;
  reference?: string;
  description?: string;
  balance_before?: number;
  balance_after?: number;
}

export default function ClientWallet() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  const [balance, setBalance] = useState(150.00);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 50, date: '2026-04-30', status: 'completed', formatted_amount: '50.00', type_display: 'Deposit' },
    { id: '2', type: 'ride_payment', amount: -25, date: '2026-04-29', status: 'completed', formatted_amount: '25.00', type_display: 'Ride Payment' }
  ]);

  const { data, setData, post, processing } = useForm({
    deposit_amount: '',
    withdraw_amount: '',
    payment_method: 'card'
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/client/wallet/deposit', {
      preserveScroll: true,
      onSuccess: () => {
        setData('deposit_amount', '');
        alert('Deposit successful!');
      }
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    post('/client/wallet/withdraw', {
      preserveScroll: true,
      onSuccess: () => {
        setData('withdraw_amount', '');
        alert('Withdrawal request submitted!');
      }
    });
  };

  if (loading) {
    return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
  }

  return (
    <>
      <Head title="Wallet" />
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-header">
            <h1>Wallet</h1>
          </div>

          <div className="wallet-balance">
            <h2>Balance</h2>
            <p className="balance-amount">₦{balance.toFixed(2)}</p>
            <div className="wallet-actions">
              <button className="action-btn primary">Deposit</button>
              <button className="action-btn">Withdraw</button>
            </div>
          </div>

          <div className="transactions-section">
            <h2>Recent Transactions</h2>
            <div className="transactions-list">
              {transactions.map(tx => (
                <div key={tx.id} className="transaction-card">
                  <div className="tx-info">
                    <p><strong>{tx.type_display || tx.type}</strong></p>
                    <p>{tx.date}</p>
                  </div>
                  <p className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                    {tx.amount > 0 ? '+' : ''}₦{tx.formatted_amount || tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mobile-nav-container">
            <ClientNavmobile />
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <ClientSidebarDesktop userName="User" />
          <div className="desktop-main">
            <div className="desktop-header">
              <h1>Wallet</h1>
              <p>Manage your wallet and transactions</p>
            </div>

            <div className="cd-card">
              <div className="wallet-balance">
                <h2>Balance</h2>
                <p className="balance-amount">₦{balance.toFixed(2)}</p>
                <div className="wallet-actions">
                  <button className="btn-premium">Deposit</button>
                  <button className="btn-secondary">Withdraw</button>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h2>Recent Transactions</h2>
              <div className="transactions-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-card">
                    <div className="tx-info">
                      <p><strong>{tx.type_display || tx.type}</strong></p>
                      <p>{tx.date}</p>
                    </div>
                    <p className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                      {tx.amount > 0 ? '+' : ''}₦{tx.formatted_amount || tx.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
