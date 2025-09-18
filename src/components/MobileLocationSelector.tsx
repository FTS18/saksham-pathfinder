import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { countries, getStatesByCountry, getCitiesByState } from '@/data/countries';

interface MobileLocationSelectorProps {
  value: {
    country: string;
    state: string;
    city: string;
  };
  onChange: (location: { country: string; state: string; city: string }) => void;
  label?: string;
  required?: boolean;
}

export const MobileLocationSelector = ({ value, onChange, label, required }: MobileLocationSelectorProps) => {
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (value.country) {
      const states = getStatesByCountry(value.country);
      setAvailableStates(states);
      
      if (!states.find(s => s.name === value.state)) {
        onChange({ ...value, state: '', city: '' });
      }
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [value.country]);

  useEffect(() => {
    if (value.country && value.state) {
      const cities = getCitiesByState(value.country, value.state);
      setAvailableCities(cities);
      
      if (!cities.includes(value.city)) {
        onChange({ ...value, city: '' });
      }
    } else {
      setAvailableCities([]);
    }
  }, [value.country, value.state]);

  const handleCountryChange = (country: string) => {
    onChange({ country, state: '', city: '' });
  };

  const handleStateChange = (state: string) => {
    onChange({ ...value, state, city: '' });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...value, city });
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="grid grid-cols-3 gap-2">
        <select 
          value={value.country} 
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="">Country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>

        <select 
          value={value.state} 
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={!value.country}
          className="w-full p-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
        >
          <option value="">State</option>
          {availableStates.map((state) => (
            <option key={state.name} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>

        <select 
          value={value.city} 
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!value.state}
          className="w-full p-2 border border-border rounded-md bg-background text-foreground disabled:opacity-50"
        >
          <option value="">City</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};