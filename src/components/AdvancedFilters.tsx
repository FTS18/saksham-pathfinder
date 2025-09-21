import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FilterState {
  salaryRange: [number, number];
  companySize: string;
  workMode: string[];
  sectors: string[];
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  availableSectors: string[];
}

// Sector-skill mapping based on actual internship data
const sectorSkillsMap: Record<string, string[]> = {
  "IT": ["Java", "Python", "SQL", "Data Structures", "Networking", "Troubleshooting", "IoT", "5G", "DevOps", "CI/CD", "Docker", "Kubernetes", "Cybersecurity", "Network Security", "Ethical Hacking", "Threat Analysis", "HTML", "CSS", "JavaScript", "React", "Cloud Computing", "AWS", "Azure", "Machine Learning", "TensorFlow", "Data Science", "Data Analysis", "Tableau", "Business Intelligence", "Android Development", "Kotlin", "UI/UX", "User Research", "Usability Testing", "Communication", "Manual Testing", "Automation Testing", "Jira", "Cloud Security", "Business Analysis", "Requirements Gathering", "Troubleshooting", "Hardware", "Software", "Node.js", "Product Management", "Market Research", "Strategy", "UI/UX Design", "Figma", "Adobe XD", "Prototyping"],
  "Finance": ["Financial Modeling", "Data Analysis", "MS Excel", "Accounting", "Auditing", "Risk Assessment", "Financial Analysis", "Credit Analysis", "Corporate Finance", "Communication", "Valuation", "Mergers & Acquisitions", "Financial Planning", "Investment", "Client Relations", "Market Research", "Equity Research", "Valuation", "Market Analysis", "Forex Trading", "Risk Management", "Treasury", "Cash Management", "Financial Reporting", "Compliance", "Regulatory Frameworks", "Risk Analysis", "Mortgage Lending", "Customer Service", "Sales", "Banking", "Insurance"],
  "Banking": ["Financial Analysis", "Credit Analysis", "Corporate Finance", "Communication", "Customer Service", "Sales", "Banking", "Financial Modeling", "Valuation", "Mergers & Acquisitions", "Financial Planning", "Investment", "Client Relations", "Market Research", "Equity Research", "Market Analysis", "Forex Trading", "Risk Management", "Treasury", "Cash Management", "Financial Reporting", "Compliance", "Regulatory Frameworks", "Auditing", "Risk Analysis", "Mortgage Lending", "Insurance"],
  "Automotive": ["Mechanical Design", "AutoCAD", "Thermodynamics", "Quality Control", "Logistics", "Inventory Management", "Supply Chain", "Operations", "Manufacturing", "Quality Control", "Lean Manufacturing", "Robotics", "Electronics", "Embedded Systems", "Circuit Design", "CAN Bus", "Automation", "Programming", "Control Systems", "Powertrain", "Engine Design", "Simulation", "Mechanical Design", "Quality Engineering", "Process Improvement", "Statistical Analysis", "Industrial Design", "CAD", "3D Modeling", "Sketching", "Production Engineering"],
  "Manufacturing": ["Mechanical Design", "AutoCAD", "Thermodynamics", "Quality Control", "Supply Chain", "Logistics", "Inventory Management", "Operations", "Production Planning", "Quality Control", "Manufacturing", "Safety Procedures", "Electrical Systems", "Power Electronics", "CAD", "Maintenance", "Metallurgy", "Material Science", "Lab Procedures", "Automation", "PLC", "Robotics", "Control Systems", "Quality Assurance", "Process Improvement", "Statistical Analysis", "Lean Manufacturing", "Production Engineering", "Industrial Design", "Product Design", "Creative"],
  "Healthcare": ["Healthcare Administration", "Communication", "Data Entry", "Patient Relations", "Research", "Data Analysis", "Lab Procedures", "Medical Terminology", "Biomedical Engineering", "Medical Devices", "Troubleshooting", "Maintenance"],
  "Consulting": ["Java", "Python", "SQL", "Data Structures", "Auditing", "Accounting", "Risk Assessment", "Financial Analysis", "DevOps", "CI/CD", "Docker", "Kubernetes", "Cybersecurity", "Network Security", "Ethical Hacking", "Threat Analysis", "HTML", "CSS", "JavaScript", "React", "Data Analysis", "Tableau", "Business Intelligence", "Taxation", "Compliance", "Business Analysis", "Requirements Gathering", "Communication", "Troubleshooting", "Hardware", "Software", "UI/UX Design", "Figma", "Adobe XD", "Prototyping", "Project Management", "Planning", "Logistics"],
  "Construction": ["Civil Engineering", "Project Management", "AutoCAD", "Construction", "Structural Analysis", "Design", "Urban Planning", "GIS", "Policy Analysis", "Sustainability", "Cost Estimation", "Tendering", "Budgeting", "Site Supervision", "Planning", "Safety Regulations", "Risk Assessment", "First Aid", "Communication", "Environmental Science", "Compliance", "Surveying", "Data Collection", "Drafting", "Revit", "Blueprint Reading"],
  "Infrastructure": ["Civil Engineering", "Project Management", "AutoCAD", "Construction", "Structural Analysis", "Design", "Urban Planning", "GIS", "Policy Analysis", "Sustainability", "Cost Estimation", "Tendering", "Budgeting", "Project Management", "Planning", "Logistics", "Communication", "Site Supervision", "Safety Regulations", "Risk Assessment", "First Aid", "Environmental Science", "Compliance", "Surveying", "Data Collection", "Structural Engineering", "Finite Element Analysis", "CAD", "Drafting", "Revit", "Blueprint Reading", "Public Transport"],
  "FMCG": ["Digital Marketing", "Market Research", "Social Media", "Communication", "Store Operations", "Customer Service", "Inventory Management", "Sales", "Supply Chain", "Logistics", "Operations", "Quality Assurance", "Food Safety", "Auditing", "Lab Procedures", "Marketing", "Branding", "Consumer Insights", "Market Analysis", "Product Development", "R&D", "Distribution"],
  "Retail": ["Digital Marketing", "Market Research", "Social Media", "Communication", "Supply Chain", "Logistics", "Inventory Management", "Data Analysis", "Store Operations", "Customer Service", "Sales", "E-commerce", "Merchandising", "Marketing", "Retail Operations", "Visual Merchandising", "Operations"],
  "E-commerce": ["Supply Chain", "Logistics", "Inventory Management", "Data Analysis", "SEO", "Social Media Marketing", "Content Creation", "Google Analytics", "E-commerce", "Merchandising", "Marketing", "JavaScript", "Node.js", "React", "SQL", "Product Management", "Market Research", "Strategy"],
  "Hospitality": ["Healthcare Administration", "Communication", "Data Entry", "Patient Relations", "Culinary Arts", "Food Preparation", "Hygiene", "Teamwork", "Customer Service", "Problem-Solving", "Front Office", "Hotel Management", "Leadership", "Operations", "Food Service", "Event Planning", "Coordination", "Vendor Management", "Housekeeping", "Tourism", "Tour Planning", "Logistics"],
  "Travel": ["Culinary Arts", "Food Preparation", "Hygiene", "Teamwork", "Customer Service", "Communication", "Problem-Solving", "Front Office", "Hotel Management", "Leadership", "Operations", "Food Service", "Event Planning", "Coordination", "Vendor Management", "Housekeeping", "Tourism", "Tour Planning", "Logistics"],
  "Telecommunications": ["Networking", "Troubleshooting", "IoT", "5G", "Network Operations", "Customer Service", "Telecommunications", "Mobile Networks", "Network Planning", "RF Engineering", "Data Analysis", "Cybersecurity", "Network Security", "Threat Analysis", "Firewalls", "IoT", "Embedded Systems", "Programming"],
  "Energy": ["Petroleum Engineering", "Geology", "Drilling Operations", "Reservoir Engineering", "Solar Technology", "Renewable Energy", "Project Management", "Electrical Engineering", "Plant Operations", "Safety Procedures", "Troubleshooting", "Financial Analysis", "Valuation", "Corporate Finance", "Financial Modeling"],
  "Technology": ["Content Creation", "Writing", "Instructional Design", "Subject Matter Expertise", "UI/UX Design", "Figma", "Adobe XD", "Prototyping", "Cloud Computing", "AWS", "Azure", "Networking", "Machine Learning", "Python", "TensorFlow", "Data Science", "Biomedical Engineering", "Medical Devices", "Troubleshooting", "Maintenance", "Electronics", "Embedded Systems", "Circuit Design", "CAN Bus", "IoT", "Programming", "User Research", "Usability Testing", "Communication"],
  "Engineering": ["Electrical Systems", "Power Electronics", "CAD", "Maintenance", "Automation", "PLC", "Robotics", "Control Systems", "Mechanical Design", "Thermodynamics", "Project Management"],
  "Oil & Gas": ["Petroleum Engineering", "Geology", "Drilling Operations", "Reservoir Engineering"],
  "Renewable Energy": ["Solar Technology", "Renewable Energy", "Project Management", "Electrical Engineering"],
  "Government": ["Civil Engineering", "Urban Planning", "Public Transport", "Project Management", "Plant Operations", "Electrical Engineering", "Safety Procedures", "Troubleshooting", "Urban Planning", "GIS", "Policy Analysis", "Sustainability"],
  "Pharma": ["Research", "Data Analysis", "Lab Procedures", "Medical Terminology"],
  "Industrial": ["Production Planning", "Quality Control", "Manufacturing", "Safety Procedures", "Metallurgy", "Material Science", "Lab Procedures"],
  "Media": ["Writing", "Research", "Reporting", "Communication"],
  "Publishing": ["Writing", "Research", "Reporting", "Communication"],
  "Insurance": ["Insurance", "Sales", "Customer Service", "Communication"],
  "Agriculture": ["Agribusiness", "Crop Science", "Farm Operations", "Research"],
  "Events": ["Event Planning", "Coordination", "Customer Service", "Vendor Management"],
  "Education": ["Content Creation", "Writing", "Instructional Design", "Subject Matter Expertise"],
  "Marketing": ["SEO", "Social Media Marketing", "Content Creation", "Google Analytics", "Digital Marketing", "Branding", "Consumer Insights", "Market Analysis"],
  "Food & Beverages": ["UI/UX Design", "Figma", "Adobe XD", "Prototyping", "Android Development", "Java", "Kotlin", "UI/UX", "Product Management", "Market Research", "Strategy", "Data Analysis"],
  "Fintech": ["Data Science", "Python", "Machine Learning", "Statistical Analysis"],
  "Stock Market": ["Equity Research", "Financial Analysis", "Market Research", "Valuation", "Stock Analysis", "Financial Research", "Technical Analysis"],
  "Real Estate": ["Structural Analysis", "AutoCAD", "Design", "Project Management", "Urban Planning", "GIS", "Policy Analysis", "Sustainability", "Project Management", "Planning", "Budgeting", "Construction"],
  "Fashion": ["E-commerce", "Merchandising", "Data Analysis", "Marketing", "Merchandising", "Visual Merchandising", "Inventory Management", "Sales"],
  "Design": ["Industrial Design", "CAD", "Product Design", "Creative"]
};

const workModes = ['Remote', 'Hybrid', 'On-site'];
const companySizes = ['Startup (1-50)', 'Medium (51-500)', 'Large (500+)', 'Any'];

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableSectors 
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSalaryChange = (value: number[]) => {
    onFiltersChange({ ...filters, salaryRange: [value[0], value[1]] });
  };

  const handleCompanySizeChange = (value: string) => {
    onFiltersChange({ ...filters, companySize: value });
  };

  const handleWorkModeToggle = (mode: string) => {
    const newModes = filters.workMode.includes(mode)
      ? filters.workMode.filter(m => m !== mode)
      : [...filters.workMode, mode];
    onFiltersChange({ ...filters, workMode: newModes });
  };

  const handleSectorToggle = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    onFiltersChange({ ...filters, sectors: newSectors });
  };

  const hasActiveFilters = 
    filters.salaryRange[0] > 0 || 
    filters.salaryRange[1] < 100000 ||
    filters.companySize !== 'Any' ||
    filters.workMode.length > 0 ||
    filters.sectors.length > 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-primary" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.workMode.length,
                  filters.sectors.length,
                  filters.companySize !== 'Any' ? 1 : 0,
                  (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 100000) ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Salary Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Stipend Range: ₹{filters.salaryRange[0].toLocaleString()} - ₹{filters.salaryRange[1].toLocaleString()}
            </label>
            <Slider
              value={filters.salaryRange}
              onValueChange={handleSalaryChange}
              max={100000}
              min={0}
              step={5000}
              className="w-full"
            />
          </div>

          {/* Company Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Company Size</label>
            <Select value={filters.companySize} onValueChange={handleCompanySizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Mode */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {workModes.map(mode => (
                <Badge
                  key={mode}
                  variant={filters.workMode.includes(mode) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleWorkModeToggle(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Sectors</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.sectors.length > 0 
                    ? `${filters.sectors.length} sector${filters.sectors.length > 1 ? 's' : ''} selected`
                    : "Select sectors"
                  }
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="max-h-60 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 gap-2">
                    {availableSectors
                      .filter(sector => sectorSkillsMap[sector] && sectorSkillsMap[sector].length > 0)
                      .map(sector => (
                        <div key={sector} className="flex items-center space-x-2">
                          <Checkbox
                            id={`advanced-sector-${sector}`}
                            checked={filters.sectors.includes(sector)}
                            onCheckedChange={() => handleSectorToggle(sector)}
                          />
                          <Label htmlFor={`advanced-sector-${sector}`} className="text-sm font-normal cursor-pointer">
                            {sector}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Selected Sectors Tags */}
            {filters.sectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.sectors.map(sector => (
                  <Badge 
                    key={sector} 
                    variant="default" 
                    className="cursor-pointer"
                    onClick={() => handleSectorToggle(sector)}
                  >
                    {sector}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};