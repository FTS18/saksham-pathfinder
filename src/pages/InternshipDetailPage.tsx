import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, MapPin, IndianRupee, Clock, Users, Share2, Bookmark, AlertCircle } from 'lucide-react';
import { Internship } from '@/types';
import { fetchInternships } from '@/lib/dataExtractor';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { injectOGTags, generateInternshipOGTags } from '@/lib/ogTagInjector';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';

export const InternshipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInternship = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          setError('No internship ID provided');
          setLoading(false);
          return;
        }

        const allInternships = await fetchInternships();
        
        if (allInternships.length === 0) {
          setError('Data temporarily unavailable - our database is being optimized. Please try again in a few moments.');
          setLoading(false);
          return;
        }
        
        const found = allInternships.find((int: Internship) => int.id === id);

        if (!found) {
          setError('Internship not found. Please check the ID and try again.');
        } else {
          setInternship(found);
          
          // Inject OG tags for social sharing
          const ogConfig = generateInternshipOGTags(found);
          injectOGTags(ogConfig);
        }
      } catch (err) {
        console.error('Failed to load internship:', err);
        setError('Failed to load internship data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInternship();
  }, [id]);

  const handleShare = async () => {
    if (!internship) return;

    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share this link with friends.',
      });
    } catch (err) {
      console.error('Share failed:', err);
      toast({
        title: 'Share Failed',
        description: 'Could not copy link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="border-destructive mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Error Loading Internship</h3>
                  <p className="text-muted-foreground">{error || 'Internship not found'}</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    Browse Internships
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const location =
    typeof internship.location === 'string' ? internship.location : internship.location?.city || 'N/A';
  const isWishlisted_ = isWishlisted(internship.id);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant={isWishlisted_ ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (isWishlisted_) {
                  removeFromWishlist(internship.id);
                  toast({ title: 'Removed from wishlist' });
                } else {
                  addToWishlist(internship.id);
                  toast({ title: 'Added to wishlist' });
                }
              }}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {isWishlisted_ ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{internship.title}</CardTitle>
                <p className="text-lg text-muted-foreground">{internship.company}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IndianRupee className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Stipend</p>
                  <p className="font-medium">{internship.stipend}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{internship.duration}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Work Mode</p>
                  <p className="font-medium">{internship.work_mode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {internship.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Internship</h3>
                <p className="text-muted-foreground leading-relaxed">{internship.description}</p>
              </div>
            )}

            {/* Sectors */}
            {internship.sector_tags?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.sector_tags.map((sector, idx) => (
                    <Badge key={idx} variant="default">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {internship.required_skills?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.required_skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education Levels */}
            {internship.preferred_education_levels?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Preferred Education Levels</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.preferred_education_levels.map((level, idx) => (
                    <Badge key={idx} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Deadline */}
            {internship.deadline && (
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Application Deadline</p>
                <p className="font-semibold text-amber-900 dark:text-amber-100">{internship.deadline}</p>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={() => {
                if (internship.apply_link) {
                  window.open(internship.apply_link, '_blank');
                }
              }}
              disabled={!internship.apply_link}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {internship.apply_link ? '✨ Apply Now' : 'Link Unavailable'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
