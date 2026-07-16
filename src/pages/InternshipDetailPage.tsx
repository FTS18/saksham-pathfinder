import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, MapPin, IndianRupee, Clock, Users, Share2, Bookmark, AlertCircle, Briefcase, GraduationCap, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Internship } from '@/types';
import { getInternshipById } from '@/services/internshipService';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { injectOGTags, generateInternshipOGTags } from '@/lib/ogTagInjector';
import { useToast } from '@/hooks/use-toast';
import { useWishlistStore as useWishlist } from '@/store/useWishlistStore';

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

        const found = await getInternshipById(id);

        if (!found) {
          setError('Internship not found. Please check the ID and try again.');
        } else {
          setInternship(found);
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
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link Copied!', description: 'Share this link with friends.' });
    } catch (err) {
      toast({ title: 'Share Failed', description: 'Could not copy link.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error || 'Internship not found'}</p>
        <Button onClick={() => navigate('/')}>Browse Internships</Button>
      </div>
    );
  }

  const location = typeof internship.location === 'string' ? internship.location : internship.location?.city || 'N/A';
  const isWishlisted_ = isWishlisted(internship.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="rounded-full w-10 h-10 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md transition-all"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant={isWishlisted_ ? 'default' : 'outline'}
              size="icon"
              onClick={() => {
                if (isWishlisted_) {
                  removeFromWishlist(internship.id);
                  toast({ title: 'Removed from wishlist' });
                } else {
                  addToWishlist(internship.id);
                  toast({ title: 'Added to wishlist' });
                }
              }}
              className={`rounded-full w-10 h-10 transition-all ${
                isWishlisted_ 
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur-md'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isWishlisted_ ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                <span>Internship</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight mb-4">
                {internship.title}
              </h1>
              <div className="flex items-center gap-3 text-xl text-muted-foreground">
                <Building2 className="w-6 h-6 text-primary" />
                <span className="font-medium text-foreground/80">{internship.company}</span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold text-foreground truncate">{location}</p>
              </div>
              
              <div className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Stipend</p>
                <p className="font-semibold text-foreground truncate">{internship.stipend}</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold text-foreground truncate">{internship.duration}</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Work Mode</p>
                <p className="font-semibold text-foreground truncate">{internship.work_mode || 'N/A'}</p>
              </div>
            </div>

            {/* About Section */}
            {internship.description && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/40">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  About This Role
                </h3>
                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {(() => {
                    let text = internship.description;
                    if (!text) return '';
                    // If the text has no newlines but contains bullets or common headers, format it
                    if (!text.includes('\n')) {
                      text = text
                        .replace(/\s(\*|-|•)\s/g, '\n\n$1 ') // Add newlines before bullets
                        .replace(/(Responsibilities:|Requirements:|Qualifications:|About the role:|What you'll do:|Key Skills:)/gi, '\n\n$1\n'); // Add newlines around headers
                    }
                    return text.trim();
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Apply Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              {/* Apply Card */}
              <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-xl mb-6">
                <Button
                  onClick={() => {
                    if (internship.apply_link) {
                      window.open(internship.apply_link, '_blank');
                    }
                  }}
                  disabled={!internship.apply_link}
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                >
                  {internship.apply_link ? (
                    <>
                      Apply Now <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    'Link Unavailable'
                  )}
                </Button>

                {internship.deadline && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">Application Deadline</p>
                    <p className="font-semibold text-foreground mt-1">{internship.deadline}</p>
                  </div>
                )}
              </div>

              {/* Tags Cards */}
              <div className="space-y-4">
                {internship.required_skills?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-card border border-border/40">
                    <h3 className="font-semibold text-foreground mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {internship.required_skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white/5 hover:bg-white/10 text-foreground/80 border-white/10 font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {internship.sector_tags?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-card border border-border/40">
                    <h3 className="font-semibold text-foreground mb-4">Sectors</h3>
                    <div className="flex flex-wrap gap-2">
                      {internship.sector_tags.map((sector, idx) => (
                        <Badge key={idx} variant="outline" className="border-primary/30 text-primary font-medium bg-primary/5">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {internship.preferred_education_levels?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-card border border-border/40">
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                      Education
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {internship.preferred_education_levels.map((level, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 font-medium">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailPage;
