import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';

interface AdaptiveSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
  icon?: React.ReactNode;
}

export const AdaptiveSelect = ({ 
  value, 
  onValueChange, 
  placeholder, 
  options, 
  className = '',
  icon 
}: AdaptiveSelectProps) => {
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  if (isAndroid) {
    return (
      <div className={`relative ${className}`}>
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={`w-full h-10 py-2 text-sm bg-background border border-input rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-ring ${
            icon ? 'pl-10 pr-10' : 'px-3 pr-10'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }

  // Windows/Desktop - use custom Select
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {icon}
        </div>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={icon ? 'pl-10' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};