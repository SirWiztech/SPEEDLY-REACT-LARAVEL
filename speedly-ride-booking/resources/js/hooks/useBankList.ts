import { useState, useEffect } from 'react';

export interface Bank {
  name: string;
  code: string;
}

const FALLBACK_BANKS: Bank[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'GTBank', code: '058' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'UBA', code: '033' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'Union Bank', code: '032' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Opay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Moniepoint', code: '50515' },
  { name: 'Wema Bank', code: '035' },
  { name: 'FCMB', code: '214' },
  { name: 'Ecobank', code: '050' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Providus Bank', code: '101' },
];

export function useBankList() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBanks = async () => {
      try {
        const { default: api } = await import('../services/api');
        const res = await api.payment.getBanks('NGN');
        if (cancelled) return;

        if (res.data && Array.isArray(res.data)) {
          setBanks(
            res.data.map((b: any) => ({
              name: b.name || b.bank_name,
              code: b.code || b.bank_code,
            }))
          );
        } else {
          setBanks(FALLBACK_BANKS);
        }
      } catch {
        if (!cancelled) {
          setBanks(FALLBACK_BANKS);
          setError('Using cached bank list');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBanks();
    return () => { cancelled = true; };
  }, []);

  return { banks, loading, error };
}
