import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import { api } from '../../services/api';
import '../../../css/DriverProfileMobile.css';

interface DriverVehicle {
    id: string;
    vehicle_type: string | null;
    vehicle_model: string | null;
    vehicle_color: string | null;
    vehicle_year: string | null;
    plate_number: string | null;
    vehicle_image_url: string | null;
}

interface DriverData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    driver_status: string;
    verification_status: string;
    is_available: boolean;
    vehicle: DriverVehicle | null;
    bank_name: string | null;
    account_number: string | null;
    account_name: string | null;
    bank_accounts: any[];
    withdrawal_history: any[];
    kyc_status: string | null;
    created_at: string;
}

interface DriverStats {
    total_rides: number;
    total_earnings: number;
    wallet_balance: number;
    avg_rating: number;
    completed_rides: number;
    cancelled_rides: number;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function DriverProfileMobile() {
    const loading = usePreloader(0);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<string>('profile');
    const [isAvailable, setIsAvailable] = useState<boolean>(true);
    
    // Form states
    const [editFullname, setEditFullname] = useState<string>('');
    const [editPhone, setEditPhone] = useState<string>('');
    const [editAddress, setEditAddress] = useState<string>('');
    const [editCity, setEditCity] = useState<string>('');
    const [editState, setEditState] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<string>('');
    const [vehicleModel, setVehicleModel] = useState<string>('');
    const [vehicleYear, setVehicleYear] = useState<string>('');
    const [vehicleColor, setVehicleColor] = useState<string>('');
    const [licensePlate, setLicensePlate] = useState<string>('');
    const [bankName, setBankName] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
    
    // Password states
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    
    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // Fetch driver data
    const { data: driverData, refetch: refetchDriver } = useQuery<DriverData>({
        queryKey: ['driver-profile-mobile'],
        queryFn: async () => {
            const response = await api.driver.profile();
            const d = response.data?.user || response.user || response.data;
            return d;
        },
    });

    // Fetch stats
    const { data: stats, refetch: refetchStats } = useQuery<DriverStats>({
        queryKey: ['driver-stats-mobile'],
        queryFn: async () => {
            const response = await api.driver.stats();
            const s = response.data || response;
            const rawStats = s.stats || s;
            return {
                total_rides: rawStats.total_rides ?? 0,
                total_earnings: rawStats.total_earnings ?? 0,
                wallet_balance: rawStats.wallet_balance ?? 0,
                avg_rating: rawStats.average_rating ?? 0,
                completed_rides: rawStats.completed_rides ?? 0,
                cancelled_rides: rawStats.cancelled_rides ?? 0,
            };
        },
    });

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const data = await api.notifications.list();
            if (data.success || data.data) {
                const d = data.data || data;
                setNotifications(d.notifications || []);
                setUnreadCount(d.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Update profile
    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Updating Profile...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const data = await api.driver.updateProfile({
                full_name: editFullname,
                phone_number: editPhone,
                address: editAddress,
                city: editCity,
                state: editState,
            });
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                    setActiveTab('profile');
                });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Update Failed', 
                    text: data.message || 'Failed to update profile',
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Failed to update profile',
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Update vehicle
    const updateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Updating Vehicle...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const data = await api.driver.updateVehicle({
                vehicle_type: vehicleType,
                vehicle_model: vehicleModel,
                vehicle_year: vehicleYear,
                vehicle_color: vehicleColor,
                plate_number: licensePlate
            });
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Vehicle Updated',
                    text: 'Your vehicle information has been updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                    setActiveTab('profile');
                });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Update Failed', 
                    text: data.message || 'Failed to update vehicle',
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Failed to update vehicle',
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Update bank details
    const updateBank = async (e: React.FormEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Saving Bank Details...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const data = await api.driver.saveBankDetails({
                bank_name: bankName,
                account_number: accountNumber,
                account_name: accountName
            });
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Bank Details Saved',
                    text: 'Your bank details have been updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                    setActiveTab('profile');
                });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Save Failed', 
                    text: data.message || 'Failed to save bank details',
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Failed to save bank details',
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Upload KYC documents
    const uploadDocuments = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!licenseFile && !idFile) {
            Swal.fire({
                icon: 'warning',
                title: 'No Files Selected',
                text: 'Please select at least one document to upload',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }
        
        Swal.fire({
            title: 'Uploading Documents...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const formData = new FormData();
            if (licenseFile) formData.append('license_file', licenseFile);
            if (idFile) formData.append('id_file', idFile);
            
            const data = await api.driver.uploadKyc(formData);
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Documents Uploaded',
                    text: 'Your documents have been submitted for review',
                    confirmButtonColor: '#ff5e00'
                }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                    setActiveTab('profile');
                    setLicenseFile(null);
                    setIdFile(null);
                });
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Upload Failed', 
                    text: data.message || 'Failed to upload documents',
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: 'Failed to upload documents',
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Change password
    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Passwords Do Not Match', 
                text: 'Please make sure your passwords match',
                confirmButtonColor: '#ff5e00' 
            });
            return;
        }
        
        if (newPassword.length < 8) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Password Too Short', 
                text: 'Password must be at least 8 characters',
                confirmButtonColor: '#ff5e00' 
            });
            return;
        }
        
        Swal.fire({
            title: 'Changing Password...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const data = await api.auth.changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });
            if (data.success) {
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Password Changed', 
                    text: 'Your password has been changed successfully', 
                    confirmButtonColor: '#ff5e00' 
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setActiveTab('profile');
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Error', 
                    text: data.message, 
                    confirmButtonColor: '#ff5e00' 
                });
            }
        } catch (error: any) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: error.message || 'Failed to change password', 
                confirmButtonColor: '#ff5e00' 
            });
        }
    };

    // Toggle availability
    const toggleAvailability = async (status: boolean) => {
        setIsAvailable(status);
        
        try {
            const data = await api.driver.toggleStatus({ status: status ? 'online' : 'offline' });
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: status ? 'You are now Available' : 'You are now Offline',
                    text: status ? 'You will receive ride requests' : 'You will not receive ride requests',
                    timer: 2000,
                    showConfirmButton: false,
                    position: 'top-end'
                });
                queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
            }
        } catch (error) {
            console.error('Error toggling availability:', error);
            setIsAvailable(!status);
        }
    };

    // Request withdrawal
    const requestWithdrawal = () => {
        if ((stats?.wallet_balance || 0) < 100) {
            Swal.fire({
                icon: 'warning',
                title: 'Insufficient Balance',
                text: 'Minimum withdrawal amount is ₦100',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }

        Swal.fire({
            title: 'Withdraw Funds',
            html: `
                <div style="padding: 0 4px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ff5e00, #ff8c38); border-radius: 16px; padding: 20px; margin-bottom: 20px; color: white; text-align: center;">
                        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">Available Balance</div>
                        <div style="font-size: 26px; font-weight: 800; word-break: break-word;">₦${(stats?.wallet_balance || 0).toLocaleString()}</div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Minimum withdrawal: ₦100</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px;">Amount</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                            <button type="button" class="quick-amount-btn" data-amount="5000" style="background: #f5f5f5; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 600;">₦5,000</button>
                            <button type="button" class="quick-amount-btn" data-amount="10000" style="background: #f5f5f5; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 600;">₦10,000</button>
                            <button type="button" class="quick-amount-btn" data-amount="25000" style="background: #f5f5f5; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 600;">₦25,000</button>
                            <button type="button" class="quick-amount-btn" data-amount="50000" style="background: #f5f5f5; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; font-size: 14px; font-weight: 600;">₦50,000</button>
                        </div>
                        <input type="number" id="withdraw-amount" class="form-control" placeholder="Enter custom amount" min="100" max="${stats?.wallet_balance || 0}" step="100" style="width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px;">Bank Account</div>
                        <select id="bank-name" class="form-control" style="width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; background: white; cursor: pointer; box-sizing: border-box; margin-bottom: 8px;">
                            <option value="">Loading banks...</option>
                        </select>
                        <input type="text" id="account-number" class="form-control" placeholder="Account Number" maxlength="10" inputmode="numeric" style="width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 8px;">
                        <div id="account-verification-status" style="font-size: 12px; margin-top: 4px; padding: 6px 10px; border-radius: 8px;"></div>
                        <input type="text" id="account-name" class="form-control" placeholder="Account Name (auto-verified)" readonly style="width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; background: #f9f9f9; color: #666;">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 8px;">Confirm Password</div>
                        <input type="password" id="withdraw-password" class="form-control" placeholder="Enter your password to confirm" style="width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
                    </div>
                    <div style="margin-top: 12px; padding: 12px; background: #fff8e6; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #856404;">
                        <i style="color: #ff5e00;">⏰</i> Withdrawals are processed within 24-48 hours after admin approval
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Withdraw',
            confirmButtonColor: '#ff5e00',
            cancelButtonText: 'Cancel',
            width: '90%',
            didOpen: () => {
                document.querySelectorAll('.quick-amount-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const amount = (e.currentTarget as HTMLElement).getAttribute('data-amount');
                        const input = document.getElementById('withdraw-amount') as HTMLInputElement;
                        if (input && amount) input.value = amount;
                    });
                });

                api.payment.getBanks('NGN').then((res: any) => {
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
                    ];
                    const select = document.getElementById('bank-name') as HTMLSelectElement;
                    if (select) select.innerHTML = '<option value="">Select Bank</option>' +
                        fallback.map(b => '<option value="' + b.name + '" data-code="' + b.code + '">' + b.name + '</option>').join('');
                });

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
                if (amount > (stats?.wallet_balance || 0)) { Swal.showValidationMessage('Insufficient balance'); return false; }
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
                    const res = await api.driver.requestWithdrawal({
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
                            html: `
                                <div style="text-align: center;">
                                    <div style="font-size: 12px; color: #2e7d32; margin-bottom: 4px;">Amount Requested</div>
                                    <div style="font-size: 26px; font-weight: 800; color: #ff5e00; word-break: break-word;">₦${result.value.amount.toLocaleString()}</div>
                                </div>
                                <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
                                    <tr><td style="padding:6px 0;color:#888;">Bank</td><td style="padding:6px 0;font-weight:600;text-align:right;word-break:break-word;">${result.value.bankName}</td></tr>
                                    <tr><td style="padding:6px 0;color:#888;">Account</td><td style="padding:6px 0;font-weight:600;text-align:right;word-break:break-word;">${result.value.account}</td></tr>
                                    <tr><td style="padding:6px 0;color:#888;">Account Name</td><td style="padding:6px 0;font-weight:600;text-align:right;word-break:break-word;">${result.value.name}</td></tr>
                                </table>
                                <p style="margin-top:16px;font-size:13px;color:#666;text-align:center;">
                                    ⏰ Funds will be sent within 24-48 hours
                                </p>
                            `,
                            confirmButtonColor: '#ff5e00',
                            confirmButtonText: 'Done'
                        }).then(() => {
                            queryClient.invalidateQueries({ queryKey: ['driver-stats-mobile'] });
                            queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                        });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Withdrawal Failed', text: res.message || 'Something went wrong', confirmButtonColor: '#ff5e00' });
                    }
                } catch (err: any) {
                    Swal.close();
                    Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to submit withdrawal', confirmButtonColor: '#ff5e00' });
                }
            }
        });
    };

    // Profile picture upload
    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Swal.fire({
            title: 'Uploading...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const formData = new FormData();
            formData.append('profile_picture', file);
            const data = await api.uploadProfilePicture(formData);
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Picture Updated',
                    timer: 1500,
                    showConfirmButton: false
                });
                queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: data.message || 'Failed to upload profile picture',
                    confirmButtonColor: '#ff5e00'
                });
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message || 'Failed to upload profile picture',
                confirmButtonColor: '#ff5e00'
            });
        }
    };

    // Show notifications
    const showNotifications = () => {
        if (notifications.length === 0) {
            Swal.fire({
                title: 'No Notifications',
                text: 'You have no new notifications',
                icon: 'info',
                confirmButtonColor: '#ff5e00'
            });
            return;
        }
        
        let html = '<div style="max-height: 400px; overflow-y: auto;">';
        notifications.forEach(notif => {
            html += `
                <div style="padding: 12px; border-bottom: 1px solid #eee; ${!notif.is_read ? 'background: #fff8f0;' : ''}">
                    <strong style="color: #333;">${notif.title}</strong>
                    <p style="color: #666; font-size: 13px; margin-top: 4px; word-break: break-word;">${notif.message}</p>
                    <small style="color: #999;">${new Date(notif.created_at).toLocaleString()}</small>
                </div>
            `;
        });
        html += '</div>';
        
        Swal.fire({
            title: 'Notifications',
            html: html,
            confirmButtonColor: '#ff5e00',
            width: '90%'
        });
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const userInitial = driverData?.full_name?.charAt(0)?.toUpperCase() || 'D';

    useEffect(() => {
        fetchNotifications();
        
        // Refresh data every 30 seconds
        const interval = setInterval(() => {
            refetchDriver();
            refetchStats();
            fetchNotifications();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    // Set form values when data loads
    useEffect(() => {
        if (driverData) {
            const v = driverData.vehicle || {};
            setEditFullname(driverData.full_name || '');
            setEditPhone(driverData.phone_number || '');
            setEditAddress(driverData.address || '');
            setEditCity(driverData.city || '');
            setEditState(driverData.state || '');
            setVehicleType(v.vehicle_type || '');
            setVehicleModel(v.vehicle_model || '');
            setVehicleYear(v.vehicle_year || '');
            setLicensePlate(v.plate_number || '');
            setVehicleColor(v.vehicle_color || '');
            setBankName(driverData.bank_name || '');
            setAccountNumber(driverData.account_number || '');
            setAccountName(driverData.account_name || '');
            setBankAccounts(driverData.bank_accounts || []);
            setWithdrawalHistory(driverData.withdrawal_history || []);
            setIsAvailable(driverData.is_available ?? true);
        }
    }, [driverData]);

    const getKycStatusBadge = () => {
        switch (driverData?.kyc_status) {
            case 'approved':
                return <span className="kyc-badge approved">✅ KYC Verified</span>;
            case 'pending':
                return <span className="kyc-badge pending">⏳ KYC Pending</span>;
            case 'rejected':
                return <span className="kyc-badge rejected">❌ KYC Rejected</span>;
            default:
                return <span className="kyc-badge missing">🔒 KYC Required</span>;
        }
    };

    if (loading) {
        return (
            <div className="mobile-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <Head title="Profile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>My Profile</h1>
                    <button className="notification-btn" onClick={showNotifications}>
                        🔔
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>
                </div>

                {/* Profile Card */}
                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            {driverData?.profile_picture_url ? (
                                <img 
                                    src={driverData.profile_picture_url} 
                                    alt="Profile" 
                                    className="profile-avatar"
                                />
                            ) : (
                                <div className="avatar-placeholder">{userInitial}</div>
                            )}
                            <label className="upload-pic-btn">
                                📷
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureUpload} />
                            </label>
                        </div>
                        <div className="profile-info">
                            <h2>{driverData?.full_name || 'Driver'}</h2>
                            <p>{driverData?.email}</p>
                            {getKycStatusBadge()}
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="availability-toggle">
                        <button 
                            className={`availability-option available ${isAvailable ? 'active' : ''}`}
                            onClick={() => toggleAvailability(true)}
                        >
                            ✅ Available
                        </button>
                        <button 
                            className={`availability-option offline ${!isAvailable ? 'active' : ''}`}
                            onClick={() => toggleAvailability(false)}
                        >
                            ⛔ Offline
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-value">{(stats?.avg_rating || 0).toFixed(1)} ⭐</div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats?.total_rides || 0}</div>
                            <div className="stat-label">Total Rides</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats?.completed_rides || 0}%</div>
                            <div className="stat-label">Completion</div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-details">
                                <div className="stat-label">Total Earnings</div>
                                <div className="stat-value">{formatCurrency(stats?.total_earnings || 0)}</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👛</div>
                            <div className="stat-details">
                                <div className="stat-label">Wallet Balance</div>
                                <div className="stat-value">{formatCurrency(stats?.wallet_balance || 0)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Button */}
                    <button className="withdraw-btn" onClick={requestWithdrawal}>
                        💰 Request Withdrawal
                    </button>
                </div>

                {/* Tabs - Scrollable */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('edit')}
                    >
                        ✏️ Edit
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'vehicle' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('vehicle')}
                    >
                        🚗 Vehicle
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('bank')}
                    >
                        🏦 Bank
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('kyc')}
                    >
                        🪪 KYC
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('security')}
                    >
                        🔒 Security
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="tab-panel">
                            <div className="info-section">
                                <h3>Personal Information</h3>
                                <div className="info-row">
                                    <span className="info-label">Full Name</span>
                                    <span className="info-value">{driverData?.full_name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{driverData?.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{driverData?.phone_number || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Address</span>
                                    <span className="info-value">{driverData?.address || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">City / State</span>
                                    <span className="info-value">{driverData?.city ? `${driverData.city}, ${driverData.state}` : 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Vehicle Information</h3>
                                <div className="info-row">
                                    <span className="info-label">Type</span>
                                    <span className="info-value">{driverData?.vehicle?.vehicle_type?.toUpperCase() || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Model</span>
                                    <span className="info-value">{driverData?.vehicle?.vehicle_model || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Color</span>
                                    <span className="info-value">{driverData?.vehicle?.vehicle_color || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Year</span>
                                    <span className="info-value">{driverData?.vehicle?.vehicle_year || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">License Plate</span>
                                    <span className="info-value">{driverData?.vehicle?.plate_number || 'Not provided'}</span>
                                </div>
                            </div>

                            <div className="info-section">
                                <h3>Bank Details</h3>
                                <div className="info-row">
                                    <span className="info-label">Bank Name</span>
                                    <span className="info-value">{driverData?.bank_name || 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Account Number</span>
                                    <span className="info-value">{driverData?.account_number ? `****${driverData.account_number.slice(-4)}` : 'Not provided'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Account Name</span>
                                    <span className="info-value">{driverData?.account_name || 'Not provided'}</span>
                                </div>
                            </div>

                            {withdrawalHistory.length > 0 && (
                                <div className="info-section">
                                    <h3>Withdrawal History</h3>
                                    {withdrawalHistory.slice(0, 5).map((item, index) => (
                                        <div key={index} className="withdrawal-item">
                                            <div className="withdrawal-info">
                                                <span className="withdrawal-amount">{formatCurrency(item.amount)}</span>
                                                <span className="withdrawal-date">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`withdrawal-status ${item.status}`}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Edit Profile Tab */}
                    {activeTab === 'edit' && (
                        <div className="tab-panel">
                            <h3>Edit Profile</h3>
                            <form onSubmit={updateProfile}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editFullname} 
                                        onChange={(e) => setEditFullname(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={driverData?.email || ''} 
                                        disabled 
                                    />
                                    <small>Email cannot be changed</small>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        value={editPhone} 
                                        onChange={(e) => setEditPhone(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editAddress} 
                                        onChange={(e) => setEditAddress(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editCity} 
                                        onChange={(e) => setEditCity(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editState} 
                                        onChange={(e) => setEditState(e.target.value)} 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">💾 Save Changes</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* Vehicle Tab */}
                    {activeTab === 'vehicle' && (
                        <div className="tab-panel">
                            <h3>Vehicle Information</h3>
                            <form onSubmit={updateVehicle}>
                                <div className="form-group">
                                    <label>Vehicle Type</label>
                                    <select 
                                        className="form-control" 
                                        value={vehicleType} 
                                        onChange={(e) => setVehicleType(e.target.value)}
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        <option value="sedan">Sedan</option>
                                        <option value="suv">SUV</option>
                                        <option value="hatchback">Hatchback</option>
                                        <option value="mpv">MPV</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Model</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g., Toyota Camry"
                                        value={vehicleModel} 
                                        onChange={(e) => setVehicleModel(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Year</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="e.g., 2020"
                                        value={vehicleYear} 
                                        onChange={(e) => setVehicleYear(e.target.value)} 
                                        min="2000"
                                        max="2025"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Color</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="e.g., White, Black, Blue"
                                        value={vehicleColor} 
                                        onChange={(e) => setVehicleColor(e.target.value)} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>License Plate Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="ABC-123-XY"
                                        value={licensePlate} 
                                        onChange={(e) => setLicensePlate(e.target.value)} 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">💾 Save Vehicle Info</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* Bank Tab */}
                    {activeTab === 'bank' && (
                        <div className="tab-panel">
                            <h3>Bank Account Details</h3>
                            
                            {bankAccounts.length > 0 && (
                                <div className="saved-banks">
                                    <h4>Your Saved Banks</h4>
                                    {bankAccounts.map((bank: any) => (
                                        <div key={bank.id} className={`saved-bank-item ${bank.is_default ? 'default' : ''}`}>
                                            <div className="bank-info">
                                                <span className="bank-name">{bank.bank_name}</span>
                                                <span className="bank-account">••••{bank.account_number?.slice(-4)}</span>
                                                {bank.is_default && <span className="default-badge">Default</span>}
                                            </div>
                                            <div className="bank-actions">
                                                {!bank.is_default && (
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => {
                                                            api.driver.setDefaultBank(bank.id).then(() => {
                                                                queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                                                            });
                                                        }}
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Remove Bank?',
                                                            text: 'Are you sure you want to remove this bank account?',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#dc3545',
                                                            cancelButtonColor: '#6c757d',
                                                            confirmButtonText: 'Yes, remove'
                                                        }).then(async (result) => {
                                                            if (result.isConfirmed) {
                                                                await api.driver.removeBankAccount(bank.id);
                                                                queryClient.invalidateQueries({ queryKey: ['driver-profile-mobile'] });
                                                            }
                                                        });
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            <h4>{bankAccounts.length > 0 ? 'Add Another Bank' : 'Add Bank Account'}</h4>
                            <form onSubmit={updateBank}>
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <select 
                                        className="form-control" 
                                        value={bankName} 
                                        onChange={(e) => setBankName(e.target.value)}
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="Access Bank">Access Bank</option>
                                        <option value="GTBank">GTBank</option>
                                        <option value="First Bank">First Bank</option>
                                        <option value="UBA">UBA</option>
                                        <option value="Zenith Bank">Zenith Bank</option>
                                        <option value="Fidelity Bank">Fidelity Bank</option>
                                        <option value="Sterling Bank">Sterling Bank</option>
                                        <option value="Union Bank">Union Bank</option>
                                        <option value="Wema Bank">Wema Bank</option>
                                        <option value="Polaris Bank">Polaris Bank</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="10-digit account number"
                                        value={accountNumber} 
                                        onChange={(e) => setAccountNumber(e.target.value)} 
                                        maxLength={10}
                                        pattern="\d{10}"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Account Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Account holder name"
                                        value={accountName} 
                                        onChange={(e) => setAccountName(e.target.value)} 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">💾 Save Bank Details</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                            </form>
                        </div>
                    )}

                    {/* KYC Tab */}
                    {activeTab === 'kyc' && (
                        <div className="tab-panel">
                            <h3>KYC Verification</h3>
                            
                            {driverData?.kyc_status === 'approved' ? (
                                <div className="kyc-approved">
                                    <div className="kyc-icon">✅</div>
                                    <h4>KYC Verification Complete</h4>
                                    <p>Your documents have been verified. You are eligible to receive rides and process withdrawals.</p>
                                </div>
                            ) : (
                                <form onSubmit={uploadDocuments}>
                                    <div className="kyc-info">
                                        <p>Please upload the following documents to complete your KYC verification. This is required to start receiving ride requests and process withdrawals.</p>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Driver's License</label>
                                        <div className="file-input-wrapper">
                                            <input 
                                                type="file" 
                                                id="licenseFile"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                            />
                                            <label htmlFor="licenseFile" className="file-label">
                                                {licenseFile ? licenseFile.name : 'Choose File'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Government ID</label>
                                        <div className="file-input-wrapper">
                                            <input 
                                                type="file" 
                                                id="idFile"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                            />
                                            <label htmlFor="idFile" className="file-label">
                                                {idFile ? idFile.name : 'Choose File'}
                                            </label>
                                        </div>
                                    </div>
                                    
                                    {driverData?.kyc_status === 'pending' && (
                                        <div className="kyc-pending">
                                            <p>⏳ Your documents are currently under review. This typically takes 1-2 business days.</p>
                                        </div>
                                    )}
                                    
                                    {driverData?.kyc_status === 'rejected' && (
                                        <div className="kyc-rejected">
                                            <p>❌ Your previous submission was rejected. Please upload clear, valid documents and try again.</p>
                                        </div>
                                    )}
                                    
                                    <button type="submit" className="btn btn-primary">📤 Upload Documents</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="tab-panel">
                            <h3>Change Password</h3>
                            <form onSubmit={changePassword}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        required 
                                    />
                                    <small>Minimum 8 characters with letters and numbers</small>
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">🔑 Update Password</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('profile')}>Cancel</button>
                            </form>

                            <div className="security-tips">
                                <h4>🛡️ Security Tips</h4>
                                <ul>
                                    <li>✅ Use a strong, unique password</li>
                                    <li>✅ Never share your password with anyone</li>
                                    <li>✅ Change your password regularly</li>
                                    <li>✅ Enable two-factor authentication for extra security</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}