import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
  }
};

export const Footer = () => {
  const { language, toggleLanguage } = useTheme();
  const t = translations[language];

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
            
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'English 🇬🇧' : 'Hindi 🇮🇳'}</span>
            </Button>
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
              © 2024 {t.brand}. {t.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};