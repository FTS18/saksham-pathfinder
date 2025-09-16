import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Globe, Bell, ZoomIn, ZoomOut, Volume2, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const translations = {
  en: { home: 'Home', dashboard: 'Dashboard', about: 'About', contact: 'Contact', brand: 'Saksham AI', wishlist: 'Wishlist' },
  hi: { home: 'होम', dashboard: 'डैशबोर्ड', about: 'हमारे बारे में', contact: 'संपर्क', brand: 'सक्षम AI', wishlist: 'इच्छा-सूची' },
  bn: { home: 'হোম', dashboard: 'ড্যাশবোর্ড', about: 'আমাদের সম্পর্কে', contact: 'যোগাযোগ', brand: 'সক্ষম AI', wishlist: 'ইচ্ছেতালিকা' },
  ta: { home: 'முகப்பு', dashboard: 'டாஷ்போர்டு', about: 'பற்றி', contact: 'தொடர்பு', brand: 'சக்ஷம் AI', wishlist: 'விருப்பப்பட்டியல்' },
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, language, setLanguage, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const t = translations[language];

  const navLinks = [
    { href: '/', label: t.home },
    { href: '/dashboard', label: t.dashboard },
    { href: '/wishlist', label: t.wishlist },
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
  ];

  const languages = [
    { code: 'en' as const, label: 'English', flag: '🇬🇧' },
    { code: 'hi' as const, label: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn' as const, label: 'বাংলা', flag: '🇧🇩' },
    { code: 'ta' as const, label: 'தமிழ்', flag: '🇮🇳' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-blur">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-poppins font-bold text-xl text-foreground">
              {t.brand}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-2 py-2 text-sm font-medium smooth-transition ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full smooth-transition" />
                )}
                 {link.href === '/wishlist' && wishlist.length > 0 && (
                  <span className="absolute top-1 right-0 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">{wishlist.length}</span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1 h-8 px-2 text-xs">
                  <Globe className="w-4 h-4" />
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
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-8 h-8 p-0">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-ping"></span>
            </Button>
            <Button variant="ghost" size="sm" onClick={increaseFontSize} className="w-8 h-8 p-0 hidden sm:inline-flex"><ZoomIn className="w-4 h-4"/></Button>
            <Button variant="ghost" size="sm" onClick={decreaseFontSize} className="w-8 h-8 p-0 hidden sm:inline-flex"><ZoomOut className="w-4 h-4"/></Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hidden sm:inline-flex"><Volume2 className="w-4 h-4"/></Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-8 h-8 p-0"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
