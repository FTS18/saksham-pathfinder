import { 
  Code, 
  DollarSign, 
  Cpu, 
  Palette, 
  Brain, 
  HardDrive, 
  ShoppingCart, 
  Radio, 
  Car, 
  Heart, 
  Plane, 
  Shield 
} from 'lucide-react';

const sectorIcons: { [key: string]: any } = {
  'Tech': Code,
  'Finance': DollarSign,
  'Electronics': Cpu,
  'Designing': Palette,
  'AI/ML': Brain,
  'Hardware': HardDrive,
  'E-commerce': ShoppingCart,
  'Telecommunication': Radio,
  'Automotive': Car,
  'Healthcare': Heart,
  'Aerospace': Plane,
  'Defense': Shield,
  'Cloud Computing': HardDrive
};

export const getSectorIcon = (sector: string) => {
  return sectorIcons[sector] || Code;
};

export const SectorIcon = ({ sector, className = "w-6 h-6" }: { sector: string; className?: string }) => {
  const IconComponent = getSectorIcon(sector);
  return <IconComponent className={className} />;
};