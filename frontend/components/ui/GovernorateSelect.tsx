// frontend/components/ui/GovernorateSelect.tsx
'use client';

import { SelectHTMLAttributes } from 'react';

interface GovernorateSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const TUNISIAN_GOVERNORATES = [
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tunis',
  'Zaghouan',
  'Tozeur',
  'Tataouine',
];

export default function GovernorateSelect({ label, error, className, ...props }: GovernorateSelectProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'input-error' : ''} ${className || ''}`} {...props}>
        <option value="">Sélectionner un gouvernorat</option>
        {TUNISIAN_GOVERNORATES.map(gov => (
          <option key={gov} value={gov}>{gov}</option>
        ))}
      </select>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}