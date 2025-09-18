import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { extractTopCities } from '@/lib/dataExtractor';
import { ChevronDown } from 'lucide-react';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
  required?: boolean;
}

const getUserLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            resolve(data.city || data.locality || 'Unknown');
          } catch (error) {
            resolve('Unknown');
          }
        },
        () => resolve('Unknown')
      );
    } else {
      resolve('Unknown');
    }
  });
};

export const CitySelector = ({ value, onChange, label, required }: CitySelectorProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string>('Unknown');

  useEffect(() => {
    const loadData = async () => {
      const [topCities, detectedCity] = await Promise.all([
        extractTopCities(),
        getUserLocation()
      ]);
      
      setUserCity(detectedCity);
      // Replace 'Home' with actual detected city in display
      const citiesWithHome = topCities.map(city => 
        city === 'Home' ? `Home (${detectedCity})` : city
      );
      setCities(citiesWithHome);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
        <div className="relative">
          <select
            disabled
            className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none opacity-50"
          >
            <option>Loading cities...</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 pr-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select city</option>
          {cities.map((city) => {
            const displayCity = city.startsWith('Home (') ? city : city;
            const actualValue = city.startsWith('Home (') ? userCity : city;
            return (
              <option key={city} value={actualValue}>
                {displayCity}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
};