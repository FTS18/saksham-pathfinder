import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const translations = {
  en: {
    brand: 'Saksham AI',
    tagline: 'Empowering students with AI-driven career guidance',
    quickLinks: 'Quick Links',
    home: 'Home',
    dashboard: 'Dashboard',
    about: 'About',
    contact: 'Contact',
    support: 'Support',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    connect: 'Connect With Us',
    builtBy: 'Built by HexaCoders',
    teamMembers: 'Ananay, Aditya, Vansham, Aniket, Riya, Bhavya',
    rights: 'All rights reserved.'
  },
  hi: {
    brand: 'सक्षम AI',
    tagline: 'AI-संचालित करियर मार्गदर्शन के साथ छात्रों को सशक्त बनाना',
    quickLinks: 'त्वरित लिंक',
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    about: 'हमारे बारे में',
    contact: 'संपर्क',
    support: 'सहायता',
    privacy: 'गोपनीयता नीति',
    terms: 'सेवा की शर्तें',
    connect: 'हमसे जुड़ें',
    builtBy: 'HexaCoders द्वारा निर्मित',
    teamMembers: 'अनन्य, आदित्य, वंशम, अनिकेत, रिया, भाव्या',
    rights: 'सभी अधिकार सुरक्षित।'
  },
  bn: {
    brand: 'সক্ষম AI',
    tagline: 'AI-চালিত ক্যারিয়ার নির্দেশিকা দিয়ে ছাত্রদের ক্ষমতায়ন',
    quickLinks: 'দ্রুত লিঙ্ক',
    home: 'হোম',
    dashboard: 'ড্যাশবোর্ড',
    about: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    support: 'সহায়তা',
    privacy: 'গোপনীয়তা নীতি',
    terms: 'পরিষেবার শর্তাবলী',
    connect: 'আমাদের সাথে সংযোগ করুন',
    builtBy: 'HexaCoders দ্বারা নির্মিত',
    teamMembers: 'অনন্য, আদিত্য, বংশম, অনিকেত, রিয়া, ভব্য',
    rights: 'সমস্ত অধিকার সংরক্ষিত।'
  },
  ta: {
    brand: 'சக்ஷம் AI',
    tagline: 'AI-চালিত தொழில் வழிகாட்டுதலுடன் மாணவர்களை மேம்படுத்துதல்',
    quickLinks: 'விரைவு இணைப்புகள்',
    home: 'முகப்பு',
    dashboard: 'டாஷ்போர்டு',
    about: 'பற்றி',
    contact: 'தொடர்பு',
    support: 'ஆதரவு',
    privacy: 'தனியுரிமைக் கொள்கை',
    terms: 'சேவை விதிமுறைகள்',
    connect: 'எங்களுடன் இணையுங்கள்',
    builtBy: 'HexaCoders ஆல் கட்டப்பட்டது',
    teamMembers: 'அனன்யா, ஆதித்யா, வம்சம், அனிகேத், ரியா, பவ்யா',
    rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
  }
};

type Language = 'en' | 'hi' | 'bn' | 'ta';

export const Footer = () => {
  const { language, setLanguage } = useTheme();
  const t = translations[language];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  ];

  const quickLinks = [
    { href: '/', label: t.home },
    { href: '/dashboard', label: t.dashboard },
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
  ];

  const supportLinks = [
    { href: '/support', label: t.support },
    { href: '/privacy', label: t.privacy },
    { href: '/terms', label: t.terms },
  ];

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:team@sakshamai.com', label: 'Email' },
  ];

  return (
    <footer className="bg-background/50 backdrop-blur-sm border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-poppins font-bold text-xl text-foreground">
                {t.brand}
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t.tagline}
            </p>
            
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                   <span>{languages.find(l => l.code === language)?.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map(lang => (
                  <DropdownMenuItem key={lang.code} onClick={() => setLanguage(lang.code)}>
                    {lang.flag} {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">{t.support}</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="font-medium text-foreground mb-2">{t.connect}</h4>
              <div className="flex space-x-4">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Credits */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <h4 className="font-poppins font-semibold text-foreground mb-2">
              {t.builtBy}
            </h4>
            <p className="text-muted-foreground mb-4">
              {t.teamMembers}
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 {t.brand}. {t.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
