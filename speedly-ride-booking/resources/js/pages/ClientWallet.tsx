import React, { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/ClientSidebarDesktop';
import Swal from 'sweetalert2';
import api from '../services/api';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ClientWalletMobile from '../components/mobileViewComponent/ClientWalletMobile';
import '../../css/ClientWallet.css';

// Types
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

interface PaymentMethod {
    id: string;
    method_type: string;
    account_last4: string;
    is_default: boolean;
}

interface WalletStats {
    balance: number;
    ride_count: number;
    notification_count: number;
}

const ClientWallet: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [rideCount, setRideCount] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const isMobile = useMobile();
    const preloaderLoading = usePreloader(0);

    // Fetch wallet data
    const fetchWalletData = useCallback(async () => {
        try {
            const [walletData, txData] = await Promise.all([
                api.client.wallet(),
                api.client.transactions()
            ]);

            if (walletData.success && walletData.data) {
                const w = walletData.data;
                setWalletBalance(w.balance || 0);
                setRideCount(w.ride_count || 0);
                setPaymentMethods(w.payment_methods || []);
                setUserData(w.user || null);
                setNotificationCount(w.notification_count || 0);
            }
            if (txData.success && txData.data) {
                setTransactions(txData.data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
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
                    <p><i class="fas fa-percent" style="color: #ff5e00;"></i> Platform fees are covered by Speedly</p>
                    <p><i class="fas fa-clock" style="color: #ff5e00;"></i> Funds are added instantly after payment</p>
                </div>
            `,
            confirmButtonText: 'Proceed to Payment',
            confirmButtonColor: '#ff5e00',
            showCancelButton: true,
            preConfirm: () => {
                const amount = (document.getElementById('amount') as HTMLInputElement)?.value;
                if (!amount || parseFloat(amount) < 100) {
                    Swal.showValidationMessage('Please enter a valid amount (minimum ₦100)');
                    return false;
                }
                return { amount: parseFloat(amount) };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                processPayment(result.value.amount);
            }
        });
    };

    const processPayment = async (amount: number) => {
        let name = userData?.fullname || userData?.full_name || '';
        let email = userData?.email || '';

        if (!email) {
            try { const me = await api.auth.me(); if (me.success && me.data) { email = me.data.email || ''; name = me.data.full_name || me.data.fullname || ''; } } catch {}
        }

        if (!email) {
            Swal.fire({ icon: 'error', title: 'Account Error', text: 'User profile not loaded. Please refresh.', confirmButtonColor: '#ff5e00' });
            return;
        }
        
        Swal.fire({
            title: 'Processing...',
            text: 'Initializing payment gateway',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
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
                    title: 'Payment Initiation Failed',
                    text: res.message || 'Unable to initialize payment. Please try again.',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.close();
            const msg = error instanceof Error ? error.message : 'Unable to connect to payment gateway. Please try again.';
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: msg,
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    const withdrawFunds = () => {
        if (walletBalance < 100) {
            Swal.fire({
                icon: 'warning',
                title: 'Insufficient Balance',
                text: 'Minimum withdrawal amount is ₦100',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        // Inject inline styles for the withdrawal modal
        const styleEl = document.createElement('style');
        styleEl.textContent = '.withdrawal-container { padding: 0 4px; } .withdrawal-balance { background: linear-gradient(135deg, #ff5e00, #ff8c38); border-radius: 16px; padding: 20px; margin-bottom: 20px; color: white; text-align: center; } .withdrawal-balance .with-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; } .withdrawal-balance .with-amount { font-size: 28px; font-weight: 800; font-family: 'Roboto', sans-serif; } .withdrawal-balance .with-sub { font-size: 12px; opacity: 0.8; margin-top: 4px; } .with-section { margin-bottom: 16px; } .with-section-t { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; } .quick-amounts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; } .quick-amount-btn { background: #f5f5f5; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; } .quick-amount-btn:hover { background: #fff3ea; border-color: #ff5e00; color: #ff5e00; } .with-input { width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; margin-bottom: 8px; } .with-input:focus { border-color: #ff5e00; } .with-input.readonly { background: #f9f9f9; color: #666; } .with-select { width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; background: white; cursor: pointer; box-sizing: border-box; margin-bottom: 8px; } .with-select:focus { border-color: #ff5e00; } .verify-status { font-size: 12px; margin-top: 4px; padding: 6px 10px; border-radius: 8px; display: flex; align-items: center; gap: 6px; } .verify-status.loading { background: #fff8e1; color: #f57f17; } .verify-status.success { background: #e8f5e9; color: #2e7d32; } .verify-status.error { background: #ffebee; color: #c62828; } .with-info { margin-top: 12px; padding: 12px; background: #fff8f0; border-radius: 10px; font-size: 12px; color: #888; text-align: center; } .with-success-card { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 16px; padding: 24px; margin-bottom: 16px; } .with-success-amount { font-size: 32px; font-weight: 800; color: #1b5e20; font-family: 'Roboto', sans-serif; }';
        document.head.appendChild(styleEl);

        Swal.fire({
            title: 'Withdraw Funds',
            html: '<div class="withdrawal-container">' +
                '<div class="withdrawal-balance">' +
                    '<div class="with-label">Available Balance</div>' +
                    '<div class="with-amount">₦' + walletBalance.toLocaleString() + '</div>' +
                    '<div class="with-sub">Minimum withdrawal: ₦100</div>' +
                '</div>' +
                '<div class="with-section">' +
                    '<div class="with-section-t"><i class="fas fa-coins"></i> Amount</div>' +
                    '<div class="quick-amounts">' +
                        '<button type="button" class="quick-amount-btn" data-amount="5000">₦5,000</button>' +
                        '<button type="button" class="quick-amount-btn" data-amount="10000">₦10,000</button>' +
                        '<button type="button" class="quick-amount-btn" data-amount="25000">₦25,000</button>' +
                        '<button type="button" class="quick-amount-btn" data-amount="50000">₦50,000</button>' +
                    '</div>' +
                    '<input type="number" id="withdraw-amount" class="with-input" placeholder="Enter custom amount" min="100" max="' + walletBalance + '" step="100">' +
                '</div>' +
                '<div class="with-section">' +
                    '<div class="with-section-t"><i class="fas fa-university"></i> Bank Account</div>' +
                    '<select id="bank-name" class="with-select"><option value="">Loading banks...</option></select>' +
                    '<input type="text" id="account-number" class="with-input" placeholder="Account Number" maxlength="10" inputmode="numeric">' +
                    '<div id="account-verification-status" class="verify-status"></div>' +
                    '<input type="text" id="account-name" class="with-input readonly" placeholder="Account Name (auto-verified)" readonly>' +
                '</div>' +
                '<div class="with-section">' +
                    '<div class="with-section-t"><i class="fas fa-lock"></i> Confirm Password</div>' +
                    '<input type="password" id="withdraw-password" class="with-input" placeholder="Enter your password to confirm">' +
                '</div>' +
                '<div class="with-info">' +
                    '<i class="fas fa-clock" style="color:#ff5e00;"></i> Withdrawals are processed within 24-48 hours after admin approval' +
                '</div>' +
            '</div>',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-check"></i> Withdraw',
            confirmButtonColor: '#ff5e00',
            cancelButtonText: 'Cancel',
            width: '480px',
            didOpen: () => {
                // Quick amount buttons
                document.querySelectorAll('.quick-amount-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const amount = (e.currentTarget as HTMLElement).getAttribute('data-amount');
                        const input = document.getElementById('withdraw-amount') as HTMLInputElement;
                        if (input && amount) input.value = amount;
                    });
                });

                // Load banks
                api.payment.getBanks('NGN').then((res) => {
                    const banks = res.data || [];
                    const select = document.getElementById('bank-name') as HTMLSelectElement;
                    if (select) {
                        select.innerHTML = '<option value="">Select Bank</option>' +
                            banks.map((b: any) => {
                                const name = b.name || b.bank_name;
                                const code = b.code || b.bank_code || '';
                                return '<option value="' + name + '" data-code="' + code + '">' + name + '</option>';
                            }).join('');
                    }
                }).catch(() => {
                    const fallback = [
                        { name: 'Access Bank', code: '044' }, { name: 'GTBank', code: '058' },
                        { name: 'First Bank of Nigeria', code: '011' }, { name: 'UBA', code: '033' },
                        { name: 'Zenith Bank', code: '057' }, { name: 'Fidelity Bank', code: '070' },
                        { name: 'Kuda Bank', code: '50211' }, { name: 'Opay', code: '999992' },
                        { name: 'PalmPay', code: '999991' }, { name: 'Moniepoint', code: '50515' },
                        { name: 'Stanbic IBTC', code: '221' }
                    ];
                    const select = document.getElementById('bank-name') as HTMLSelectElement;
                    if (select) select.innerHTML = '<option value="">Select Bank</option>' +
                        fallback.map(b => '<option value="' + b.name + '" data-code="' + b.code + '">' + b.name + '</option>').join('');
                });

                // Auto-verify account on 10-digit input
                let vt: ReturnType<typeof setTimeout>;
                const acct = document.getElementById('account-number') as HTMLInputElement;
                if (acct) {
                    acct.addEventListener('input', () => {
                        clearTimeout(vt);
                        const vs = document.getElementById('account-verification-status');
                        const nm = document.getElementById('account-name') as HTMLInputElement;
                        if (!vs || !nm) return;
                        const val = acct.value.replace(/\D/g, '');
                        acct.value = val;
                        if (val.length === 10) {
                            vs.className = 'verify-status loading';
                            vs.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying account...';
                            nm.value = '';
                            nm.setAttribute('readonly', 'readonly');
                            vt = setTimeout(async () => {
                                const bs = document.getElementById('bank-name') as HTMLSelectElement;
                                const bc = bs?.selectedOptions?.[0]?.getAttribute('data-code') || '';
                                if (!bc) { vs.className = 'verify-status error'; vs.innerHTML = '<i class="fas fa-exclamation-circle"></i> Select a bank first'; return; }
                                try {
                                    const r = await api.payment.verifyAccount({ bank_code: bc, account_number: val });
                                    if (r.account_name) {
                                        nm.value = r.account_name; nm.setAttribute('readonly', 'readonly');
                                        vs.className = 'verify-status success';
                                        vs.innerHTML = '<i class="fas fa-check-circle"></i> Account verified: ' + r.account_name;
                                    } else {
                                        nm.removeAttribute('readonly');
                                        vs.className = 'verify-status error'; vs.innerHTML = '<i class="fas fa-exclamation-circle"></i> Could not verify. Enter name manually.';
                                    }
                                } catch {
                                    nm.removeAttribute('readonly');
                                    vs.className = 'verify-status error'; vs.innerHTML = '<i class="fas fa-exclamation-circle"></i> Verification failed. Enter name manually.';
                                }
                            }, 1000);
                        } else { vs.className = 'verify-status'; vs.innerHTML = ''; nm.value = ''; }
                    });
                }
            },
            preConfirm: () => {
                const amount = parseFloat((document.getElementById('withdraw-amount') as HTMLInputElement)?.value);
                const bankSelect = document.getElementById('bank-name') as HTMLSelectElement;
                const bankName = bankSelect?.value;
                const bankCode = bankSelect?.selectedOptions?.[0]?.getAttribute('data-code') || '';
                const account = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                const password = (document.getElementById('withdraw-password') as HTMLInputElement)?.value;
                if (!amount || isNaN(amount) || amount < 100) { Swal.showValidationMessage('Minimum withdrawal is ₦100'); return false; }
                if (amount > walletBalance) { Swal.showValidationMessage('Insufficient balance'); return false; }
                if (!bankName) { Swal.showValidationMessage('Please select a bank'); return false; }
                if (!account || account.length !== 10 || !/^\d+$/.test(account)) { Swal.showValidationMessage('Please enter a valid 10-digit account number'); return false; }
                if (!name || name.trim().length < 3) { Swal.showValidationMessage('Please enter a valid account name'); return false; }
                if (!password) { Swal.showValidationMessage('Please enter your password to confirm'); return false; }
                return { amount, bankName, bankCode, account, name, password };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'Submitting...', text: 'Processing your withdrawal request', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                try {
                    const res = await api.client.withdraw({
                        amount: result.value.amount,
                        password: result.value.password,
                        bank_name: result.value.bankName,
                        bank_code: result.value.bankCode || undefined,
                        account_number: result.value.account,
                        account_name: result.value.name,
                    });
                    Swal.close();
                    if (res.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Withdrawal Request Submitted',
                            html: '' +
                                '<div class="with-success-card">' +
                                    '<div style="font-size:12px;color:#2e7d32;margin-bottom:4px;">Amount Requested</div>' +
                                    '<div class="with-success-amount">₦' + result.value.amount.toLocaleString() + '</div>' +
                                '</div>' +
                                '<table style="width:100%;border-collapse:collapse;font-size:14px;">' +
                                    '<tr><td style="padding:6px 0;color:#888;">Bank</td><td style="padding:6px 0;font-weight:600;text-align:right;">' + result.value.bankName + '</td></tr>' +
                                    '<tr><td style="padding:6px 0;color:#888;">Account</td><td style="padding:6px 0;font-weight:600;text-align:right;">' + result.value.account + '</td></tr>' +
                                    '<tr><td style="padding:6px 0;color:#888;">Account Name</td><td style="padding:6px 0;font-weight:600;text-align:right;">' + result.value.name + '</td></tr>' +
                                '</table>' +
                                '<p style="margin-top:16px;font-size:13px;color:#666;text-align:center;">' +
                                    '<i class="fas fa-clock" style="color:#ff5e00;"></i> Funds will be sent within 24-48 hours' +
                                '</p>',
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Done'
                        }).then(() => fetchWalletData());
                    } else {
                        Swal.fire({ icon: 'error', title: 'Withdrawal Failed', text: res.message || 'Something went wrong', confirmButtonColor: '#ff5e00' });
                    }
                } catch (err: any) {
                    Swal.close();
                    Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to submit withdrawal', confirmButtonColor: '#ff5e00' });
                } finally {
                    if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
                }
            } else {
                if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
            }
        });
    };
    // Apply promo code
    const applyPromoCode = () => {
        Swal.fire({
            title: 'Promo Code',
            input: 'text',
            inputPlaceholder: 'Enter promo code',
            showCancelButton: true,
            confirmButtonText: 'Apply',
            confirmButtonColor: '#ff5e00',
            preConfirm: async (code: string) => {
                if (!code) {
                    Swal.showValidationMessage('Please enter a promo code');
                    return false;
                }
                try {
                    const res = await apiFetch('/client/promo/validate', {
                        method: 'POST',
                        body: JSON.stringify({ code }),
                    });
                    if (!res.success) throw new Error(res.message || 'Invalid promo code');
                    return res;
                } catch (e: any) {
                    Swal.showValidationMessage(e.message || 'Failed to validate promo code');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Promo Code Applied!',
                    text: result.value?.message || 'Discount applied successfully',
                    confirmButtonColor: '#ff5e00'
                }).then(() => fetchWalletData());
            }
        });
    };

    // Add payment method
    const addPaymentMethod = () => {
        Swal.fire({
            title: 'Add Payment Method',
            html: `
                <p class="text-sm text-gray-500 mb-3">KoraPay — Secure payment</p>
                <input type="hidden" id="payment-type" value="korapay">
                <select id="bank-name" class="swal2-input">
                    <option value="">Loading banks...</option>
                </select>
                <input type="text" id="account-name" class="swal2-input" placeholder="Account Name">
                <input type="text" id="account-number" class="swal2-input" placeholder="Account Number" maxlength="10" inputmode="numeric">
                <label class="flex items-center gap-2 mt-2" style="justify-content: center;">
                    <input type="checkbox" id="set-default"> 
                    <span class="text-sm">Set as default payment method</span>
                </label>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add Method',
            confirmButtonColor: '#ff5e00',
            didOpen: () => {
                import('../services/api').then(({ default: api }) => {
                    api.payment.getBanks('NGN').then((res: any) => {
                        const banks = res.data || [];
                        const select = document.getElementById('bank-name') as HTMLSelectElement;
                        if (select) {
                            select.innerHTML = '<option value="">Select Bank</option>' +
                                banks.map((b: any) => {
                                    const name = b.name || b.bank_name;
                                    return `<option value="${name}">${name}</option>`;
                                }).join('');
                        }
                    }).catch(() => { /* silent fallback */ });
                });
            },
            preConfirm: async () => {
                const type = 'korapay';
                const bank = (document.getElementById('bank-name') as HTMLSelectElement)?.value;
                const name = (document.getElementById('account-name') as HTMLInputElement)?.value;
                const number = (document.getElementById('account-number') as HTMLInputElement)?.value;
                const isDefault = (document.getElementById('set-default') as HTMLInputElement)?.checked;

                if (!bank || !name || !number) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                if (number.length !== 10 || !/^\d+$/.test(number)) {
                    Swal.showValidationMessage('Please enter a valid 10-digit account number');
                    return false;
                }
                try {
                    await apiFetch('/client/payment-methods', {
                        method: 'POST',
                        body: JSON.stringify({ type, bank_name: bank, account_name: name, account_number: number, is_default: isDefault }),
                    });
                    return true;
                } catch (e: any) {
                    Swal.showValidationMessage(e?.message || 'Failed to save payment method');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Method Added',
                    text: 'Payment method added successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchWalletData();
                });
            }
        });
    };

    // Show payment options
    const showPaymentOptions = (methodId: string, methodType: string) => {
        Swal.fire({
            title: 'Payment Method Options',
            html: `
                <div style="text-align: left;">
                    <button onclick="window.setDefaultPaymentMethod('${methodId}')" style="width: 100%; padding: 12px; margin-bottom: 10px; background: #f5f5f5; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-check-circle" style="color: #ff5e00; margin-right: 10px;"></i> Set as Default
                    </button>
                    <button onclick="window.removePaymentMethodMethod('${methodId}')" style="width: 100%; padding: 12px; background: #fee2e2; border: none; border-radius: 8px; color: #dc2626; cursor: pointer;">
                        <i class="fas fa-trash" style="margin-right: 10px;"></i> Remove Method
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true
        });
    };

    // View transaction details
    const viewTransaction = (transaction: Transaction) => {
        const amountPrefix = transaction.is_credit ? '+' : '-';
        const amountColor = transaction.is_credit ? '#4CAF50' : '#f44336';
        const isPending = transaction.status === 'pending' || transaction.status === 'processing';

        const html = `
            <div style="text-align: left; padding: 10px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="font-size: 18px; font-weight: bold;">Transaction Details</span>
                        <span style="background: ${transaction.status === 'completed' ? '#4CAF50' : '#FF9800'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${transaction.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 20px; text-align: center;">
                        <span style="font-size: 32px; font-weight: bold; color: ${amountColor}; font-family: 'Roboto', sans-serif; font-variant-numeric: tabular-nums;">
                            ${amountPrefix}${transaction.formatted_amount}
                        </span>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Transaction ID</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500;">${transaction.display_id}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Type</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500; text-transform: capitalize;">${transaction.type_display}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Date & Time</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500;">${transaction.date}</td>
                        </tr>
                        ${transaction.reference ? `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Reference</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500;">${transaction.reference}</td>
                        </tr>
                        ` : ''}
                        ${transaction.description ? `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Description</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500;">${transaction.description}</td>
                        </tr>
                        ` : ''}
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px 0; color: #666;">Balance Before</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500; font-family: 'Roboto', sans-serif; font-variant-numeric: tabular-nums;">₦${transaction.balance_before.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #666;">Balance After</td>
                            <td style="padding: 10px 0; text-align: right; font-weight: 500; color: #ff5e00; font-family: 'Roboto', sans-serif; font-variant-numeric: tabular-nums;">₦${transaction.balance_after.toLocaleString()}</td>
                        </tr>
                    </table>
                    ${isPending && transaction.reference ? `
                    <div style="margin-top: 15px;">
                        <button onclick="window.checkPaymentStatus('${transaction.reference}')" style="width: 100%; padding: 12px; background: #ff5e00; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Check Payment Status
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Transaction Details',
            html: html,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Close',
            width: '500px'
        });
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const data = await api.notifications.list();
            const notifications = data.data?.data || data.data?.notifications || [];

            if (notifications.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                notifications.forEach((notif: any) => {
                    html += `
                        <div style="padding: 12px; border-bottom: 1px solid #eee;">
                            <p><strong>${notif.title}</strong></p>
                            <p>${notif.message}</p>
                            <p style="font-size: 12px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                    `;
                });
                html += '</div>';

                Swal.fire({
                    icon: 'info',
                    title: `Notifications (${notifications.length})`,
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

    // Check payment status for pending transactions
    const checkPaymentStatus = async (reference: string) => {
        Swal.fire({
            title: 'Checking Payment Status',
            text: 'Please wait...',
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
                    text: 'The payment was not successful. Please try again.',
                    confirmButtonColor: '#ff5e00'
                });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Still Processing',
                    text: 'Your payment is still being processed. Please check back later.',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unable to check payment status. Please try again.',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Set default payment method (global for modal)
    useEffect(() => {
        (window as any).setDefaultPaymentMethod = (methodId: string) => {
            Swal.fire({
                icon: 'success',
                title: 'Default Set',
                text: 'Payment method set as default',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                fetchWalletData();
            });
        };

        (window as any).removePaymentMethodMethod = (methodId: string) => {
            Swal.fire({
                title: 'Remove Payment Method?',
                text: 'Are you sure you want to remove this payment method?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Yes, Remove',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Removed',
                        text: 'Payment method removed successfully',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        fetchWalletData();
                    });
                }
            });
        };

        (window as any).checkPaymentStatus = (reference: string) => {
            checkPaymentStatus(reference);
        };

        return () => {
            delete (window as any).setDefaultPaymentMethod;
            delete (window as any).removePaymentMethodMethod;
            delete (window as any).checkPaymentStatus;
        };
    }, [fetchWalletData]);

    // Initial data fetch
    useEffect(() => {
        fetchWalletData();

        // Check for payment status from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment_status');
        const reference = urlParams.get('reference');

        if (paymentStatus === 'completed' && reference) {
            Swal.fire({
                icon: 'success',
                title: 'Deposit Successful!',
                text: 'Your wallet has been credited.',
                confirmButtonColor: '#ff5e00'
            });
            fetchWalletData();
        } else if (paymentStatus === 'pending' && reference) {
            checkPaymentStatus(reference);
        }
    }, [fetchWalletData]);

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view on mobile devices
    if (isMobile) {
        return <ClientWalletMobile />;
    }

    return (
        <div className="wallet-desktop-container">
            <ClientSidebarDesktop 
                userName={userData?.fullname || userData?.full_name || 'User'} 
                profilePictureUrl={userData?.profile_picture_url}
            />

            <div className="wallet-desktop-main">
                {/* Header */}
                <div className="wallet-desktop-header">
                    <div className="wallet-desktop-title">
                        <h1>Wallet</h1>
                        <p>Manage your funds and transactions</p>
                    </div>
                    <div className="wallet-desktop-actions">
                        <button className="wallet-notification-btn" onClick={checkNotifications}>
                            <i className="fas fa-bell"></i>
                            {notificationCount > 0 && <span className="notification-badge font-roboto-number">{notificationCount}</span>}
                        </button>
                        <button className="wallet-add-money-btn" onClick={addFunds}>Add Money</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="wallet-stats-grid">
                    {/* Balance Card */}
                    <div className="wallet-card balance-card">
                        <div className="card-header">
                            <h2>Total Balance</h2>
                            {rideCount > 10 && (
                                <div className="reward-badge">
                                    <i className="fas fa-gift"></i>
                                    <span>Reward Available</span>
                                </div>
                            )}
                        </div>
                        <div className="balance-amount font-roboto-number">{formatCurrency(walletBalance)}</div>
                        <div className="balance-change">
                            <i className="fas fa-arrow-up"></i>
                            <span>Current balance</span>
                        </div>
                    </div>

                    {/* Payment Methods Card */}
                    <div className="wallet-card payment-methods-card">
                        <div className="card-header">
                            <h2>Payment Methods</h2>
                            <button className="see-all-btn" onClick={addPaymentMethod}>+ Add New</button>
                        </div>
                        <div className="payment-methods-list">
                            {paymentMethods.length > 0 ? (
                                paymentMethods.map((method) => (
                                    <div key={method.id} className={`payment-method-item ${method.is_default ? 'selected' : ''}`}>
                                        <div className="payment-method-select">
                                            <div className="payment-radio">
                                                <div className="radio-dot"></div>
                                            </div>
                                        </div>
                                        <div className={`payment-method-icon ${method.method_type === 'bank_transfer' ? 'transfer-icon' : 'card-icon'}`}>
                                            <i className={`fas fa-${method.method_type === 'bank_transfer' ? 'exchange-alt' : 'credit-card'}`}></i>
                                        </div>
                                        <div className="payment-method-details">
                                            <h4>{method.method_type === 'bank_transfer' ? 'Bank Transfer' : 'Credit/Debit Card'}</h4>
                                            <p>{method.account_last4 ? `**** ${method.account_last4}` : ''}</p>
                                        </div>
                                        <div className="payment-method-action" onClick={() => showPaymentOptions(method.id, method.method_type)}>
                                            <i className="fas fa-ellipsis-v"></i>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">No payment methods added yet</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="wallet-card large">
                        <div className="card-header">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="desktop-quick-actions">
                            <button className="desktop-action-btn" onClick={addFunds}>
                                <div className="desktop-action-icon add-wallet-icon">
                                    <i className="fas fa-wallet"></i>
                                </div>
                                <span>Add to Wallet</span>
                            </button>
                            <button className="desktop-action-btn" onClick={() => router.visit('/clientsupport?category=refund')}>
                                <div className="desktop-action-icon refunds-icon">
                                    <i className="fas fa-undo-alt"></i>
                                </div>
                                <span>Refunds</span>
                            </button>
                            <button className="desktop-action-btn" onClick={() => router.visit('/clientridehistory?status=pending')}>
                                <div className="desktop-action-icon pending-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <span>Pending Payment</span>
                            </button>
                            <button className="desktop-action-btn" onClick={() => router.visit('/clientsupport')}>
                                <div className="desktop-action-icon support-icon">
                                    <i className="fas fa-headset"></i>
                                </div>
                                <span>Contact Support</span>
                            </button>
                            <button className="desktop-action-btn" onClick={withdrawFunds}>
                                <div className="desktop-action-icon withdrawal-icon">
                                    <i className="fas fa-money-check-alt"></i>
                                </div>
                                <span>Request Withdrawal</span>
                            </button>
                            <button className="desktop-action-btn" onClick={addPaymentMethod}>
                                <div className="desktop-action-icon payment-methods-icon">
                                    <i className="fas fa-credit-card"></i>
                                </div>
                                <span>Payment Methods</span>
                            </button>
                            <button className="desktop-action-btn" onClick={() => router.visit('/clientridehistory')}>
                                <div className="desktop-action-icon history-icon">
                                    <i className="fas fa-history"></i>
                                </div>
                                <span>Transaction History</span>
                            </button>
                            <button className="desktop-action-btn" onClick={applyPromoCode}>
                                <div className="desktop-action-icon promo-icon">
                                    <i className="fas fa-tag"></i>
                                </div>
                                <span>Promo Codes</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Transactions Card */}
                    <div className="wallet-card large">
                        <div className="card-header">
                            <h2>Recent Transactions</h2>
                            <button className="see-all-btn" onClick={() => router.visit('/clientridehistory')}>See All</button>
                        </div>
                        <div className="desktop-transactions">
                            <div className="transaction-list">
                                {transactions.length > 0 ? (
                                    transactions.slice(0, 10).map((transaction) => (
                                        <div key={transaction.id} className="transaction-item" onClick={() => viewTransaction(transaction)}>
                                            <div className="transaction-info">
                                                <div className={`transaction-icon ${transaction.is_credit ? 'topup-icon' : 'transfer-icon'}`}>
                                                    <i className={`fas fa-${transaction.is_credit ? 'plus' : 'minus'}`}></i>
                                                </div>
                                                <div className="transaction-details">
                                                    <h4>{transaction.type_display}</h4>
                                                    <p>{transaction.date}</p>
                                                    <p className="text-xs text-gray-400">{transaction.display_id}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {(transaction.status === 'pending' || transaction.status === 'processing') && (
                                                    <span style={{ background: '#FF9800', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>
                                                        PENDING
                                                    </span>
                                                )}
                                                <div className={`transaction-amount font-roboto-number ${transaction.is_credit ? 'positive' : 'negative'}`}>
                                                    {transaction.is_credit ? '+' : '-'}{transaction.formatted_amount}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500">No transactions yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ride Booking Banner */}
                <div className="ride-booking-banner">
                    <div className="banner-info">
                        <h2>Ready for your next ride?</h2>
                        <p>Book a ride instantly and enjoy our premium service with safety measures and comfortable vehicles.</p>
                        <div className="banner-stats">
                            <div className="banner-stat">
                                <div className="banner-stat-value font-roboto-number">{rideCount}</div>
                                <div className="banner-stat-label">Rides Taken</div>
                            </div>
                            <div className="banner-stat">
                                <div className="banner-stat-value">4.9</div>
                                <div className="banner-stat-label">Avg. Rating</div>
                            </div>
                            <div className="banner-stat">
                                <div className="banner-stat-value font-roboto-number">{formatCurrency(walletBalance)}</div>
                                <div className="banner-stat-label">Balance</div>
                            </div>
                        </div>
                    </div>
                    <button className="banner-book-btn" onClick={() => router.visit('/clientbookride')}>
                        <i className="fas fa-car"></i>
                        <span>Book a Ride Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientWallet;