import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCountryByName } from '@/data/countries';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  country?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const CurrencyInput = ({ value, onChange, country, label, placeholder, required }: CurrencyInputProps) => {
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    if (country) {
      const countryData = getCountryByName(country);
      if (countryData) {
        setCurrencySymbol(countryData.currency);
      }
    }
  }, [country]);

  const handleValueChange = (inputValue: string) => {
    // Remove any non-digit characters
    const numericValue = inputValue.replace(/[^\d]/g, '');
    const numberValue = parseInt(numericValue) || 0;
    onChange(numberValue);
  };

  const formatDisplayValue = (num: number) => {
    if (num === 0) return '';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="flex">
        <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-muted text-sm font-medium">
          {currencySymbol}
        </div>
        <Input
          value={formatDisplayValue(value)}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={placeholder || "0"}
          className="rounded-l-none"
          type="text"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Currency symbol is automatically set based on your selected country
      </p>
    </div>
  );
};