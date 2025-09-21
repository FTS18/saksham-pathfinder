import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EducationSelectorProps {
  degree: string;
  year: string;
  onDegreeChange: (degree: string) => void;
  onYearChange: (year: string) => void;
  degreeLabel?: string;
  yearLabel?: string;
}

const degreeOptions = {
  "Undergraduate": [
    "B.Tech (Bachelor of Technology)",
    "B.E (Bachelor of Engineering)", 
    "B.Sc (Bachelor of Science)",
    "B.Com (Bachelor of Commerce)",
    "B.A (Bachelor of Arts)",
    "BBA (Bachelor of Business Administration)",
    "BCA (Bachelor of Computer Applications)",
    "B.Arch (Bachelor of Architecture)",
    "B.Pharm (Bachelor of Pharmacy)",
    "B.Des (Bachelor of Design)",
    "LLB (Bachelor of Laws)",
    "MBBS (Bachelor of Medicine)",
    "BDS (Bachelor of Dental Surgery)",
    "B.Ed (Bachelor of Education)"
  ],
  "Postgraduate": [
    "M.Tech (Master of Technology)",
    "M.E (Master of Engineering)",
    "M.Sc (Master of Science)", 
    "M.Com (Master of Commerce)",
    "M.A (Master of Arts)",
    "MBA (Master of Business Administration)",
    "MCA (Master of Computer Applications)",
    "M.Arch (Master of Architecture)",
    "M.Pharm (Master of Pharmacy)",
    "M.Des (Master of Design)",
    "LLM (Master of Laws)",
    "MD (Doctor of Medicine)",
    "MS (Master of Surgery)",
    "M.Ed (Master of Education)"
  ],
  "Diploma": [
    "Diploma in Engineering",
    "Diploma in Computer Science",
    "Diploma in Electronics",
    "Diploma in Mechanical Engineering",
    "Diploma in Civil Engineering",
    "Diploma in Electrical Engineering",
    "Diploma in Information Technology",
    "Diploma in Business Administration",
    "Diploma in Design",
    "Diploma in Pharmacy"
  ],
  "Other": [
    "PhD (Doctor of Philosophy)",
    "Class 12th",
    "Class 10th",
    "Certificate Course",
    "Professional Course"
  ]
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => (currentYear - i + 4).toString());

export const EducationSelector = ({ 
  degree, 
  year, 
  onDegreeChange, 
  onYearChange,
  degreeLabel = "Degree",
  yearLabel = "Year"
}: EducationSelectorProps) => {
  const [degreeOpen, setDegreeOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [customYear, setCustomYear] = useState('');
  const [showCustomYear, setShowCustomYear] = useState(false);

  const allDegrees = Object.values(degreeOptions).flat();

  const handleYearSelect = (selectedYear: string) => {
    if (selectedYear === 'custom') {
      setShowCustomYear(true);
      setYearOpen(false);
    } else {
      onYearChange(selectedYear);
      setYearOpen(false);
      setShowCustomYear(false);
    }
  };

  const handleCustomYearSubmit = () => {
    if (customYear) {
      onYearChange(customYear);
      setShowCustomYear(false);
      setCustomYear('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Degree Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{degreeLabel}</Label>
        <Popover open={degreeOpen} onOpenChange={setDegreeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={degreeOpen}
              className="w-full justify-between border-2 rounded-lg h-11 transition-colors focus:border-ring"
            >
              {degree || "Select degree"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search degree..." />
              <CommandEmpty>No degree found.</CommandEmpty>
              {Object.entries(degreeOptions).map(([category, degrees]) => (
                <CommandGroup key={category} heading={category} className="max-h-64 overflow-y-auto">
                  {degrees.map((degreeOption) => (
                    <CommandItem
                      key={degreeOption}
                      value={degreeOption}
                      onSelect={() => {
                        onDegreeChange(degreeOption);
                        setDegreeOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          degree === degreeOption ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {degreeOption}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Year Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">{yearLabel}</Label>
        {showCustomYear ? (
          <div className="flex gap-2">
            <Input
              value={customYear}
              onChange={(e) => setCustomYear(e.target.value)}
              placeholder="Enter year"
              className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
            />
            <Button onClick={handleCustomYearSubmit} size="sm">
              Set
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCustomYear(false);
                setCustomYear('');
              }} 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Popover open={yearOpen} onOpenChange={setYearOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={yearOpen}
                className="w-full justify-between border-2 rounded-lg h-11 transition-colors focus:border-ring"
              >
                {year || "Select year"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search year..." />
                <CommandEmpty>No year found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {years.map((yearOption) => (
                    <CommandItem
                      key={yearOption}
                      value={yearOption}
                      onSelect={() => handleYearSelect(yearOption)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          year === yearOption ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {yearOption}
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="custom"
                    onSelect={() => handleYearSelect('custom')}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    Enter custom year...
                  </CommandItem>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};