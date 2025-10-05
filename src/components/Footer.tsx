import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Shield, HelpCircle, BookOpen, Users, Briefcase, Star, FileText, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export const Footer = () => {
  const { currentUser } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  
  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
  }, []);
  

  
  return (
    <footer className={`bg-background border-t border-border mt-auto transition-all duration-300 ${
      sidebarExpanded 
        ? 'md:ml-[280px] md:mr-[60px]' 
        : 'md:ml-[60px] md:mr-[60px]'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-poppins font-bold text-lg text-foreground">HexaForces</h3>
            <p className="text-sm text-muted-foreground">
              Your gateway to amazing internship opportunities and career growth.
            </p>
            <p className="text-xs text-muted-foreground">
              This site is owned by Ministry of Corporate Affairs.
            </p>
          </div>
          
          <div className="space-y-4 md:col-span-2">
            <h4 className="font-semibold">Quick Links & Resources</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
              <Link to="/wishlist" className="text-muted-foreground hover:text-primary transition-colors">Wishlist</Link>
              {currentUser && <Link to="/applications" className="text-muted-foreground hover:text-primary transition-colors">Applications</Link>}
              {currentUser && <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>}
              <Link to="/referrals" className="text-muted-foreground hover:text-primary transition-colors">Referrals</Link>
              <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">Settings</Link>
              <Link to="/tutorials" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</Link>
              <Link to="/sitemap" className="text-muted-foreground hover:text-primary transition-colors">Sitemap</Link>
              <Link to="/report-issue" className="text-muted-foreground hover:text-primary transition-colors">Report Issue</Link>
              <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">Recruiter</Link>
              <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Login</Link>
              <a href="https://pminternship.mca.gov.in/mca-api/files/cdn?path=PMIS-Data-Privacy-Protection-Policy.pdf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="mailto:pminternship@mca.gov.in" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                <Mail className="w-3 h-3" />
                pminternship@mca.gov.in
              </a>
              <a href="tel:18001116090" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                <Phone className="w-3 h-3" />
                1800 11 6090
              </a>
              <div className="text-muted-foreground flex items-start gap-2">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="text-xs leading-relaxed">A Wing, 5th Floor, Shastri Bhawan, Dr Rajendra Prasad Rd, New Delhi-110001</span>
              </div>
            </div>
          </div>
          

        </div>
        

        
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2024 PM-INTERNSHIP, All Rights Reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Technical collaboration with Team HexaForces, PEC Chandigarh
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right">
              <p>Made with ❤️ for students</p>
              <p className="mt-1">v2.0.1</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
