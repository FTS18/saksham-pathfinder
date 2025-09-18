import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { countries, getCountryByName } from '@/data/countries';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  country?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const PhoneInput = ({ value, onChange, country, label, placeholder, required }: PhoneInputProps) => {
  const [phoneCode, setPhoneCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (country) {
      const countryData = getCountryByName(country);
      if (countryData) {
        setPhoneCode(countryData.phone);
      }
    }
  }, [country]);

  useEffect(() => {
    // Parse existing value to extract phone code and number
    if (value && value.startsWith('+')) {
      const match = value.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        setPhoneCode(match[1]);
        setPhoneNumber(match[2]);
      }
    } else {
      setPhoneNumber(value);
    }
  }, [value]);

  const handlePhoneNumberChange = (newNumber: string) => {
    // Remove any non-digit characters except spaces and dashes
    const cleanNumber = newNumber.replace(/[^\d\s-]/g, '');
    setPhoneNumber(cleanNumber);
    
    // Combine phone code with number
    const fullNumber = cleanNumber ? `${phoneCode} ${cleanNumber}` : '';
    onChange(fullNumber);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="flex">
        <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-muted text-sm font-medium">
          {phoneCode}
        </div>
        <Input
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder={placeholder || "Enter phone number"}
          className="rounded-l-none"
          type="tel"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Phone code is automatically set based on your selected country
      </p>
    </div>
  );
};