const API_BASE = '/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'An error occurred');
  }

  return data;
}

export const sanctum = {
  csrf: () => fetch('/sanctum/csrf-cookie', { credentials: 'include' }),
};

export const api = {
  // Auth
  auth: {
    register: (data: { full_name: string; username: string; email: string; password: string; role: string; phone: string }) =>
      apiFetch('/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      apiFetch('/login', { method: 'POST', body: JSON.stringify(data) }),
    adminLogin: (data: { email: string; password: string }) =>
      apiFetch('/admin/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () =>
      apiFetch('/logout', { method: 'POST' }),
    adminLogout: () =>
      apiFetch('/admin/logout', { method: 'POST' }),
    me: () =>
      apiFetch('/me'),
    resendOtp: (data: { email: string }) =>
      apiFetch('/resend-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: { email: string; otp: string }) =>
      apiFetch('/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    forgotPassword: (data: { email: string }) =>
      apiFetch('/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (data: { token: string; password: string }) =>
      apiFetch('/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Client
  client: {
    stats: () => apiFetch('/client/stats'),
    rides: (limit = 5) => apiFetch(`/client/rides?limit=${limit}`),
    rideHistory: (params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/client/rides/history?${qs}`);
    },
    wallet: () => apiFetch('/client/wallet'),
    transactions: (params?: { type?: string; category?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.type) qs.set('type', params.type);
      if (params?.category) qs.set('category', params.category);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/client/wallet/transactions?${qs}`);
    },
    profile: () => apiFetch('/client/profile'),
    updateProfile: (data: Record<string, string>) =>
      apiFetch('/client/profile/update', { method: 'POST', body: JSON.stringify(data) }),
    kyc: () => apiFetch('/client/kyc'),
    uploadKyc: (formData: FormData) =>
      apiFetch('/client/kyc/upload', { method: 'POST', body: formData }),
    locations: () => apiFetch('/client/locations'),
    support: (data: { category: string; subject: string; message: string; priority: string }) =>
      apiFetch('/client/support', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Driver
  driver: {
    stats: () => apiFetch('/driver/stats'),
    rides: (limit = 5) => apiFetch(`/driver/rides?limit=${limit}`),
    pendingRides: () => apiFetch('/driver/rides/pending'),
    rideHistory: (params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/driver/rides/history?${qs}`);
    },
    wallet: () => apiFetch('/driver/wallet'),
    transactions: (params?: { type?: string; category?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.type) qs.set('type', params.type);
      if (params?.category) qs.set('category', params.category);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/driver/wallet/transactions?${qs}`);
    },
    requestWithdrawal: (data: { amount: number }) =>
      apiFetch('/driver/wallet/withdraw', { method: 'POST', body: JSON.stringify(data) }),
    profile: () => apiFetch('/driver/profile'),
    updateProfile: (data: Record<string, string>) =>
      apiFetch('/driver/profile/update', { method: 'POST', body: JSON.stringify(data) }),
    kyc: () => apiFetch('/driver/kyc'),
    uploadKyc: (formData: FormData) =>
      apiFetch('/driver/kyc/upload', { method: 'POST', body: formData }),
    locations: () => apiFetch('/driver/locations'),
    toggleStatus: (data: { status: string }) =>
      apiFetch('/driver/toggle-status', { method: 'POST', body: JSON.stringify(data) }),
    updateLocation: (data: { lat: number; lng: number }) =>
      apiFetch('/driver/update-location', { method: 'POST', body: JSON.stringify(data) }),
    nearbyDrivers: (data: { lat: number; lng: number; radius_km?: number }) =>
      apiFetch('/driver/nearby', { method: 'POST', body: JSON.stringify(data) }),
    support: (data: { category: string; subject: string; message: string; priority: string }) =>
      apiFetch('/driver/support', { method: 'POST', body: JSON.stringify(data) }),
    bankDetails: () => apiFetch('/driver/bank'),
    saveBankDetails: (data: { bank_name: string; account_number: string; account_name: string }) =>
      apiFetch('/driver/bank/save', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Rides
  rides: {
    getRideTypes: () => apiFetch('/ride-types'),
    calculateFare: (data: { pickup_lat: number; pickup_lng: number; dropoff_lat: number; dropoff_lng: number; ride_type: string }) =>
      apiFetch('/rides/calculate-fare', { method: 'POST', body: JSON.stringify(data) }),
    book: (data: { pickup_location: string; dropoff_location: string; pickup_lat: number; pickup_lng: number; dropoff_lat: number; dropoff_lng: number; ride_type: string; scheduled_at?: string; notes?: string }) =>
      apiFetch('/rides/book', { method: 'POST', body: JSON.stringify(data) }),
    getById: (id: string) => apiFetch(`/rides/${id}`),
    receipt: (id: string) => apiFetch(`/rides/${id}/receipt`),
    accept: (id: string) => apiFetch(`/rides/${id}/accept`, { method: 'POST' }),
    decline: (id: string) => apiFetch(`/rides/${id}/decline`, { method: 'POST' }),
    complete: (id: string) => apiFetch(`/rides/${id}/complete`, { method: 'POST' }),
    cancel: (id: string, data?: { reason?: string }) =>
      apiFetch(`/rides/${id}/cancel`, { method: 'POST', body: JSON.stringify(data || {}) }),
    rateDriver: (id: string, data: { rating: number; comment?: string }) =>
      apiFetch(`/rides/${id}/rate-driver`, { method: 'POST', body: JSON.stringify(data) }),
    rateClient: (id: string, data: { rating: number; comment?: string }) =>
      apiFetch(`/rides/${id}/rate-client`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Admin
  admin: {
    stats: () => apiFetch('/admin/stats'),
    payments: (params?: { from?: string; to?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.from) qs.set('from', params.from);
      if (params?.to) qs.set('to', params.to);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/admin/payments?${qs}`);
    },
    wallets: (page?: number) => apiFetch(`/admin/wallets${page ? `?page=${page}` : ''}`),
    reports: (data: { type: string; from: string; to: string }) =>
      apiFetch('/admin/reports', { method: 'POST', body: JSON.stringify(data) }),
    activityLogs: (page?: number) => apiFetch(`/admin/activity-logs${page ? `?page=${page}` : ''}`),
    withdrawals: (params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/admin/withdrawals?${qs}`);
    },
    approveWithdrawal: (id: string) =>
      apiFetch(`/admin/withdrawals/${id}/approve`, { method: 'POST' }),
    rejectWithdrawal: (id: string, data: { reason: string }) =>
      apiFetch(`/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
    settings: () => apiFetch('/admin/settings'),
    saveSettings: (data: Record<string, string | number>) =>
      apiFetch('/admin/settings', { method: 'POST', body: JSON.stringify(data) }),
    getUser: (id: string) => apiFetch(`/admin/users/${id}`),
    drivers: (params?: { status?: string; verification?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.verification) qs.set('verification', params.verification);
      if (params?.page) qs.set('page', String(params.page));
      return apiFetch(`/admin/drivers?${qs}`);
    },
    approveDriver: (id: string) =>
      apiFetch(`/admin/drivers/${id}/approve`, { method: 'POST' }),
    rejectDriver: (id: string, data: { reason: string }) =>
      apiFetch(`/admin/drivers/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
    pendingKyc: (page?: number) => apiFetch(`/admin/kyc/pending${page ? `?page=${page}` : ''}`),
    approveKyc: (id: string) =>
      apiFetch(`/admin/kyc/${id}/approve`, { method: 'POST' }),
    rejectKyc: (id: string, data: { reason: string }) =>
      apiFetch(`/admin/kyc/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Notifications
  notifications: {
    list: (page?: number) => apiFetch(`/notifications${page ? `?page=${page}` : ''}`),
    clear: (data: { notification_id: string }) =>
      apiFetch('/notifications/clear', { method: 'POST', body: JSON.stringify(data) }),
    clearAll: () =>
      apiFetch('/notifications/clear-all', { method: 'POST' }),
  },

  // Payment
  payment: {
    initiate: (data: { amount: number; email: string; name: string; reference?: string; metadata?: Record<string, string> }) =>
      apiFetch('/payment/initiate', { method: 'POST', body: JSON.stringify(data) }),
    callback: (paymentId: string, payerId: string) =>
      apiFetch(`/payment/callback?paymentId=${paymentId}&PayerID=${payerId}`),
    verify: (reference: string) =>
      apiFetch(`/payment/verify?reference=${reference}`),
  },

  // Location
  location: {
    suggestions: (query: string) => apiFetch(`/location/suggestions?query=${encodeURIComponent(query)}`),
    placeDetails: (data: { place_id?: string; query?: string }) =>
      apiFetch('/location/details', { method: 'POST', body: JSON.stringify(data) }),
  },
};

export default api;
