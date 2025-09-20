import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/about', label: 'About' },
  ];

  const supportLinks = [
    { href: '/support', label: 'Support' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
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
                Saksham AI
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering students with AI-driven career guidance
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
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
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
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
              <h4 className="font-medium text-foreground mb-2">Connect With Us</h4>
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

        {/* PM Internship Contact Info */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-semibold text-foreground mb-2">PM Internship Scheme - Official Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Official Portal:</strong> <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pminternship.mca.gov.in</a></p>
                <p><strong>Contact:</strong> Email: <a href="mailto:pminternship@mca.gov.in" className="text-primary hover:underline">pminternship@mca.gov.in</a> | Call: <a href="tel:18001160900" className="text-primary hover:underline">1800 11 6090</a></p>
                <p><strong>Application Fee:</strong> Free for all candidates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Credits */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Saksham AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
