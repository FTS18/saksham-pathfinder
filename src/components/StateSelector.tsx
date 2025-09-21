import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import statesCitiesData from '@/data/states-cities.json';

interface StateSelectorProps {
  value: string;
  onChange: (state: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const StateSelector = ({ value, onChange, label, placeholder = "Select state", required }: StateSelectorProps) => {
  const [open, setOpen] = useState(false);
  const states = Object.keys(statesCitiesData);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-2 rounded-lg h-11 transition-colors focus:border-ring"
          >
            {value || placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search state..." />
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {states.map((state) => (
                <CommandItem
                  key={state}
                  value={state}
                  onSelect={() => {
                    onChange(state);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === state ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {state}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};