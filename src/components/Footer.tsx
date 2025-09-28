import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Footer = () => {
  const { currentUser } = useAuth();
  
  return (
    <footer className="bg-background border-t border-border md:ml-[var(--sidebar-width,60px)] md:mr-[60px] transition-all duration-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x md:divide-border">
          
          {/* Brand & Links */}
          <div className="md:pr-8">
            <div className="text-center md:text-left">
              <h3 className="font-poppins font-bold text-xl mb-1">Saksham AI</h3>
              <p className="text-muted-foreground text-sm mb-4 font-medium">AI-driven career guidance</p>
            </div>
            <div className="flex flex-wrap gap-4 md:flex-col md:gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary font-medium">Home</Link>
              <Link to="/wishlist" className="text-muted-foreground hover:text-primary font-medium">Dashboard</Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary font-medium">About</Link>
              <Link to="/support" className="text-muted-foreground hover:text-primary font-medium">Support</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="md:px-8">
            <h4 className="font-bold text-lg mb-3">Connect</h4>
            <div className="space-y-2 text-sm">
              <a href="mailto:pminternship@mca.gov.in" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-medium">
                <Mail className="w-4 h-4" />
                pminternship@mca.gov.in
              </a>
              <a href="tel:18001160900" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-medium">
                <Phone className="w-4 h-4" />
                1800 11 6090 (Toll Free)
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:pl-8">
            <h4 className="font-bold text-lg mb-3">Get in Touch</h4>
            <form action="mailto:dubeyananay@gmail.com" method="post" encType="text/plain" className="space-y-2">
              <input
                type="email"
                name="email"
                placeholder="Your email"
                defaultValue={currentUser?.email || ''}
                readOnly={!!currentUser?.email}
                required
                className={`w-full px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50 ${currentUser?.email ? 'cursor-not-allowed opacity-75' : ''}`}
              />
              <textarea
                name="message"
                placeholder="Your message"
                required
                rows={2}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p className="font-medium">© {new Date().getFullYear()} Saksham AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-primary font-medium">Privacy</Link>
            <Link to="/terms" className="hover:text-primary font-medium">Terms</Link>
            <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary font-medium">Official Portal</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
