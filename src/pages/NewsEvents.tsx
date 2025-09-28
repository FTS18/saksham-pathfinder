import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, ExternalLink, Calendar, Users } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function NewsEvents() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Breadcrumbs />
          <div className="mt-4">
            <h1 className="text-3xl font-racing font-bold text-foreground mb-2">
              News & Events
            </h1>
            <p className="text-muted-foreground">
              Stay updated with the latest internship opportunities and career events
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 pt-8">

        <div className="space-y-6">
          {/* PM Internship Scheme News */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <Bell className="w-5 h-5" />
                PM Internship Scheme 2024-25
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest updates on Government of India's flagship internship program
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <blockquote className="text-sm italic text-foreground">
                  "Skill development and employment are crucial needs in India. Our government is consistently working in this direction."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">— Prime Minister Narendra Modi</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Key Highlights</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Target Beneficiaries</h4>
                    <p className="text-sm text-muted-foreground">1.25 lakh youth in pilot phase, 1 crore over 5 years</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Age Criteria</h4>
                    <p className="text-sm text-muted-foreground">21-24 years from low-income households</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Duration</h4>
                    <p className="text-sm text-muted-foreground">12-month internship opportunities</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Companies</h4>
                    <p className="text-sm text-muted-foreground">Top 500 companies across 24 sectors</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Financial Benefits</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">₹5,000</div>
                    <p className="text-sm text-muted-foreground">Monthly Stipend</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹6,000</div>
                    <p className="text-sm text-muted-foreground">One-time Grant</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">Insurance</div>
                    <p className="text-sm text-muted-foreground">Coverage Included</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now on Official Portal
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Virtual Career Fair 2024</h3>
                    <span className="text-sm text-muted-foreground">Dec 15, 2024</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect with top companies and explore internship opportunities across various sectors.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>500+ companies participating</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Resume Building Workshop</h3>
                    <span className="text-sm text-muted-foreground">Dec 20, 2024</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn how to create an impressive resume that stands out to recruiters.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Free for all students</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}