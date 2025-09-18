import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { countries, getStatesByCountry, getCitiesByState } from '@/data/countries';
import { ChevronDown } from 'lucide-react';

interface LocationSelectorProps {
  value: {
    country: string;
    state: string;
    city: string;
  };
  onChange: (location: { country: string; state: string; city: string }) => void;
  label?: string;
  required?: boolean;
}

export const LocationSelector = ({ value, onChange, label, required }: LocationSelectorProps) => {
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Initialize with India if no country is selected
  useEffect(() => {
    if (!value.country) {
      onChange({ country: 'India', state: '', city: '' });
    }
  }, [value, onChange]);

  useEffect(() => {
    if (value.country) {
      const states = getStatesByCountry(value.country);
      setAvailableStates(states);
      
      if (value.state && !states.find(s => s.name === value.state)) {
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
      
      if (value.city && !cities.includes(value.city)) {
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
        <div className="relative">
          <select
            value={value.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full h-10 px-3 pr-8 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={value.state}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={!value.country}
            className="w-full h-10 px-3 pr-8 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="">State</option>
            {availableStates.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={value.city}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!value.state}
            className="w-full h-10 px-3 pr-8 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="">City</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};