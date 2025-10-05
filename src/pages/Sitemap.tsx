import { Link } from 'react-router-dom';
import { Home, Info, HelpCircle, Heart, FileText, LayoutDashboard, Users, Bug, Settings, Play, Newspaper, Briefcase, Building2, MapPin, Tag, BookOpen, Shield, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Sitemap() {
  const { currentUser } = useAuth();

  const sections = [
    {
      title: 'Main Pages',
      icon: Home,
      links: [
        { to: '/', label: 'Home', icon: Home, description: 'Browse internships and get AI recommendations' },
        { to: '/about', label: 'About Us', icon: Info, description: 'Learn about Saksham AI and our mission' },
        { to: '/faq', label: 'FAQ', icon: HelpCircle, description: 'Frequently asked questions and answers' },
        { to: '/sitemap', label: 'Sitemap', icon: MapPin, description: 'Complete directory of all pages' }
      ]
    },
    {
      title: 'User Features',
      icon: Users,
      links: [
        { to: '/wishlist', label: 'Wishlist', icon: Heart, description: 'Your saved internship opportunities' },
        ...(currentUser ? [
          { to: '/applications', label: 'Applications', icon: FileText, description: 'Track your internship applications' },
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Your personalized dashboard' },
          { to: '/profile', label: 'Profile Settings', icon: Settings, description: 'Manage your account and preferences' },
          { to: '/notifications', label: 'Notifications', icon: FileText, description: 'View your notifications and updates' }
        ] : [])
      ]
    },
    {
      title: 'Resources',
      icon: BookOpen,
      links: [
        { to: '/dashboard/tutorials', label: 'Tutorials', icon: Play, description: 'Learn how to use the platform effectively' },
        { to: '/dashboard/news-events', label: 'News & Events', icon: Newspaper, description: 'Latest internship news and career events' },
        { to: '/referrals', label: 'Referral Program', icon: Users, description: 'Refer friends and earn rewards' },
        { to: '/report-issue', label: 'Report Issue', icon: Bug, description: 'Report bugs or request features' }
      ]
    },
    {
      title: 'Browse Internships',
      icon: Briefcase,
      links: [
        { to: '/company/google', label: 'Google Internships', icon: Building2, description: 'Internships at Google' },
        { to: '/company/microsoft', label: 'Microsoft Internships', icon: Building2, description: 'Internships at Microsoft' },
        { to: '/company/amazon', label: 'Amazon Internships', icon: Building2, description: 'Internships at Amazon' },
        { to: '/city/bangalore', label: 'Bangalore Internships', icon: MapPin, description: 'Internships in Bangalore' },
        { to: '/city/mumbai', label: 'Mumbai Internships', icon: MapPin, description: 'Internships in Mumbai' },
        { to: '/city/delhi', label: 'Delhi Internships', icon: MapPin, description: 'Internships in Delhi' },
        { to: '/sector/technology', label: 'Technology Sector', icon: Tag, description: 'Tech internships' },
        { to: '/sector/finance', label: 'Finance Sector', icon: Tag, description: 'Finance internships' }
      ]
    },
    {
      title: 'Legal & Policies',
      icon: Shield,
      links: [
        { to: '/terms', label: 'Terms of Service', icon: FileCheck, description: 'Our terms and conditions' },
        { to: '/accessibility', label: 'Accessibility', icon: Shield, description: 'Accessibility statement and features' },
        { to: 'https://pminternship.mca.gov.in/mca-api/files/cdn?path=PMIS-Data-Privacy-Protection-Policy.pdf', label: 'Privacy Policy', icon: Shield, description: 'How we protect your data', external: true },
        { to: 'https://pminternship.mca.gov.in/assets/docs/Partner_Companies.pdf', label: 'Partner Companies', icon: Building2, description: 'Our partner organizations', external: true }
      ]
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-racing font-bold mb-2">Sitemap</h1>
        <p className="text-muted-foreground">Complete directory of all pages and features on Saksham AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const SectionIcon = section.icon;
          return (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SectionIcon className="w-5 h-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.links.map((link, linkIdx) => {
                    const LinkIcon = link.icon;
                    const content = (
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <LinkIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">{link.label}</div>
                          <div className="text-xs text-muted-foreground">{link.description}</div>
                        </div>
                      </div>
                    );

                    return link.external ? (
                      <a
                        key={linkIdx}
                        href={link.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      <Link key={linkIdx} to={link.to} className="block">
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Can't find what you're looking for? <Link to="/report-issue" className="text-primary hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}
