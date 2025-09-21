import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { extractTopCities } from '@/lib/dataExtractor';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
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
            resolve(data.city || data.locality || 'Delhi');
          } catch (error) {
            resolve('Delhi');
          }
        },
        () => resolve('Delhi')
      );
    } else {
      resolve('Delhi');
    }
  });
};

export const CitySelector = ({ value, onChange, label, required, placeholder = "Select city" }: CitySelectorProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState<string>('Delhi');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [topCities, detectedCity] = await Promise.all([
        extractTopCities(),
        getUserLocation()
      ]);
      
      setUserCity(detectedCity);
      setCities(topCities);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const detectedCity = await getUserLocation();
      setUserCity(detectedCity);
      onChange(detectedCity);
    } catch (error) {
      console.error('Failed to detect location:', error);
    } finally {
      setDetectingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>}
        <div className="relative">
          <select
            disabled
            className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none opacity-50 transition-colors"
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
      {label && <Label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-11 px-3 pr-10 py-2 text-sm bg-background border-2 border-input rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          >
            <option value="">{placeholder}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="h-11 px-3 border-2 rounded-lg"
          title="Detect current location"
        >
          {detectingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};