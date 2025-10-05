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
  Shield,
  GraduationCap,
  Megaphone,
  Factory,
  Camera,
  Gamepad2,
  Users,
  Banknote,
  Hammer,
  Coffee,
  MapPin,
  HandHeart,
  FlaskConical,
  TrendingUp,
  Settings
} from 'lucide-react';

const sectorIcons: { [key: string]: any } = {
  'Technology': Code,
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
  'Cloud Computing': HardDrive,
  'Education': GraduationCap,
  'Marketing': Megaphone,
  'Manufacturing': Factory,
  'Media': Camera,
  'Gaming': Gamepad2,
  'Consulting': Users,
  'Banking': Banknote,
  'Construction': Hammer,
  'Hospitality': Coffee,
  'Travel': MapPin,
  'NGO': HandHeart,
  'Research': FlaskConical,
  'Sales': TrendingUp,
  'Operations': Settings,
  'Infrastructure': Hammer
};

export const getSectorIcon = (sector: string) => {
  return sectorIcons[sector] || Code;
};

export const SectorIcon = ({ sector, className = "w-6 h-6", style }: { sector: string; className?: string; style?: React.CSSProperties }) => {
  const IconComponent = getSectorIcon(sector);
  return <IconComponent className={className} style={style} />;
};