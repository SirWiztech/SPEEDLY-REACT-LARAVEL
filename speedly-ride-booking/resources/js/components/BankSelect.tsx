import React from 'react';
import { useBankList, Bank } from '../hooks/useBankList';

interface BankSelectProps {
  id?: string;
  value?: string;
  onChange?: (bankName: string, bankCode: string) => void;
  className?: string;
  placeholder?: string;
}

const BankSelect: React.FC<BankSelectProps> = ({
  id = 'bank-select',
  value,
  onChange,
  className = 'swal2-input',
  placeholder = 'Select Bank',
}) => {
  const { banks, loading } = useBankList();

  if (loading) {
    return (
      <select id={id} className={className} disabled>
        <option>Loading banks...</option>
      </select>
    );
  }

  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => {
        const selected = banks.find((b: Bank) => b.name === e.target.value);
        onChange?.(e.target.value, selected?.code || '');
      }}
    >
      <option value="">{placeholder}</option>
      {banks.map((bank: Bank) => (
        <option key={bank.code} value={bank.name} data-code={bank.code}>
          {bank.name}
        </option>
      ))}
    </select>
  );
};

export default BankSelect;
