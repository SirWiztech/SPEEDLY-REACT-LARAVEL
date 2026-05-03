import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import '../../css/ClientWallet.css';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  description: string;
  created_at: string;
  reference?: string;
}

interface WalletData {
  balance: number;
  currency: string;
  recent_transactions: Transaction[];
}

export default function ClientWallet() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();

  const { data: walletData, isLoading: walletLoading } = useQuery<WalletData>({
    queryKey: ['client-wallet'],
    queryFn: () => api.client.wallet().then(res => res.data),
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['client-transactions'],
    queryFn: () => api.client.transactions().then(res => res.data),
  });

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

  const balance = walletData?.balance || 0;
  const txList = transactions || walletData?.recent_transactions || [];

  if (loading || walletLoading) {
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
            <p className="balance-amount">₦{balance.toLocaleString()}</p>
            <div className="wallet-actions">
              <button className="action-btn primary">Deposit</button>
              <button className="action-btn">Withdraw</button>
            </div>
          </div>

          <div className="transactions-section">
            <h2>Recent Transactions</h2>
            <div className="transactions-list">
              {txList.map((tx: Transaction) => (
                <div key={tx.id} className="transaction-card">
                  <div className="tx-info">
                    <p><strong>{tx.category || tx.type}</strong></p>
                    <p>{tx.description}</p>
                    <p>{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className={`tx-amount ${tx.type === 'credit' ? 'positive' : 'negative'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
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
                <p className="balance-amount">₦{balance.toLocaleString()}</p>
                <div className="wallet-actions">
                  <button className="btn-premium">Deposit</button>
                  <button className="btn-secondary">Withdraw</button>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h2>Recent Transactions</h2>
              <div className="transactions-list">
                {txList.map((tx: Transaction) => (
                  <div key={tx.id} className="transaction-card">
                    <div className="tx-info">
                      <p><strong>{tx.category || tx.type}</strong></p>
                      <p>{tx.description}</p>
                      <p>{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className={`tx-amount ${tx.type === 'credit' ? 'positive' : 'negative'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
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
