import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Heart, Calendar, Building2, Sparkles, MapPin, IndianRupee } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { InternshipCard } from '../components/InternshipCard';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    // Load internships data
    fetch('/internships.json')
      .then(response => response.json())
      .then(data => setAllInternships(data))
      .catch(error => console.error("Failed to load internships:", error));

    // Load profile data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    if (allInternships.length > 0 && wishlist.length > 0) {
      const wishlistedInternships = allInternships.filter(internship => 
        wishlist.includes(internship.id)
      );
      
      // Extract skills and sectors from wishlisted items
      const sectors = [...new Set(wishlistedInternships.flatMap(i => i.sector_tags || []))];
      const skills = [...new Set(wishlistedInternships.flatMap(i => i.required_skills || []))];
      const companies = [...new Set(wishlistedInternships.map(i => i.company))];
      const locations = [...new Set(wishlistedInternships.map(i => 
        typeof i.location === 'string' ? i.location : i.location?.city
      ).filter(Boolean))];
      
      // Score and rank similar internships
      const scored = allInternships
        .filter(internship => !wishlist.includes(internship.id))
        .map(internship => {
          let score = 0;
          
          // Sector match (40%)
          const sectorMatches = internship.sector_tags?.filter(tag => sectors.includes(tag)).length || 0;
          score += (sectorMatches / Math.max(sectors.length, 1)) * 40;
          
          // Skill match (35%)
          const skillMatches = internship.required_skills?.filter(skill => skills.includes(skill)).length || 0;
          score += (skillMatches / Math.max(skills.length, 1)) * 35;
          
          // Location match (15%)
          const internshipLocation = typeof internship.location === 'string' ? internship.location : internship.location?.city;
          if (locations.includes(internshipLocation)) score += 15;
          
          // Company similarity (10%)
          if (companies.includes(internship.company)) score += 10;
          
          return { internship, score };
        })
        .filter(item => item.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.internship);
      
      setRecommendations(scored);
    }
  }, [allInternships, wishlist]);

  const wishlistedInternships = allInternships.filter(internship => 
    wishlist.includes(internship.id)
  );

  return (
    <div className="min-h-screen hero-gradient pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-racing font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-muted-foreground">
            Your saved internships and personalized recommendations
          </p>
        </div>

        {wishlistedInternships.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {wishlistedInternships.map((internship) => (
                <InternshipCard 
                  key={internship.id}
                  internship={internship}
                  userProfile={profileData}
                  matchScore={Math.floor(Math.random() * 15) + 85} // High match for wishlisted items
                />
              ))}
            </div>
            
            {recommendations.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Recommended for You</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  Based on your wishlist preferences, we found these similar opportunities
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((internship) => (
                    <InternshipCard 
                      key={internship.id}
                      internship={internship}
                      userProfile={profileData}
                      matchScore={Math.floor(Math.random() * 20) + 70}
                      aiTags={['Recommended']}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring internships and save the ones you like!
              </p>
              <Button asChild>
                <a href="/">Browse Internships</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}