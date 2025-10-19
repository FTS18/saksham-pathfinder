import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, GitCompare, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Public Features Showcase
 * Shows unauthenticated users what they can do without login
 */

export const PublicFeaturesShowcase = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Explore Without Login</h2>
        <p className="text-muted-foreground text-lg">
          Start exploring internships, compare opportunities, and more - all without signing up
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1: Browse Internships */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Browse & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Search through thousands of internship opportunities by title, company, location, and more.
            </p>
            <Link to="/?search=true">
              <Button variant="outline" size="sm" className="w-full">
                Start Browsing
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 2: Advanced Filtering */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Smart Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Filter by sectors, skills, locations, stipend, and more to find exactly what you're looking for.
            </p>
            <Link to="/?filters=true">
              <Button variant="outline" size="sm" className="w-full">
                Try Filters
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 3: Compare Internships */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-500" />
              Compare Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Side-by-side comparison of multiple internships to help you make the best choice.
            </p>
            <Link to="/internships">
              <Button variant="outline" size="sm" className="w-full">
                Start Comparing
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 4: Trending */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Discover the most popular internships and trending companies in the market right now.
            </p>
            <Link to="/?sort=trending">
              <Button variant="outline" size="sm" className="w-full">
                See Trending
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 5: City & Sector Pages */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏙️ City & Sector
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Browse internships by your city or favorite sector/industry.
            </p>
            <Link to="/sitemap">
              <Button variant="outline" size="sm" className="w-full">
                Explore Pages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Feature 6: Public Profiles */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Success Stories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Read success stories from other students and see where they got their internships.
            </p>
            <Button variant="outline" size="sm" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="mt-12 bg-primary/10 border border-primary/20 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold mb-3">Ready to Take Action?</h3>
        <p className="text-muted-foreground mb-6">
          Sign up to apply to internships, save your favorites, and get personalized recommendations.
        </p>
        <Link to="/login">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Sign Up Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PublicFeaturesShowcase;
