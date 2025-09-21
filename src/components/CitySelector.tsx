import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import statesCitiesData from '@/data/states-cities.json';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  state?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showLocationButton?: boolean;
}

export const CitySelector = ({ 
  value, 
  onChange, 
  state, 
  label, 
  placeholder = "Select city", 
  required,
  showLocationButton = true 
}: CitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (state && statesCitiesData[state as keyof typeof statesCitiesData]) {
      setCities(statesCitiesData[state as keyof typeof statesCitiesData]);
    } else {
      // Show all cities if no state selected
      const allCities = Object.values(statesCitiesData).flat();
      setCities(allCities);
    }
  }, [state]);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          if (data.city) {
            onChange(data.city);
          } else if (data.locality) {
            onChange(data.locality);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          alert('Unable to detect location. Please select manually.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access location. Please select manually.');
      }
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="flex-1 justify-between border-2 rounded-lg h-11 transition-colors focus:border-ring"
            >
              {value || placeholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search city..." />
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onChange(city);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === city ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {showLocationButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={detectLocation}
            className="px-3 border-2 rounded-lg h-11"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};