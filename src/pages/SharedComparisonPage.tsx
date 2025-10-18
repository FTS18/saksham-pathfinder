import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, MapPin, IndianRupee, Clock, AlertCircle } from 'lucide-react';
import { Internship } from '@/types';
import { fetchInternships } from '@/lib/dataExtractor';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { exportComparisonAsPDF } from '@/lib/pdfExporter';
import { useToast } from '@/hooks/use-toast';

export const SharedComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ids = searchParams.get('ids')?.split(',') || [];

  useEffect(() => {
    const loadComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        if (ids.length === 0) {
          setError('No internships to compare. Please use a valid share link.');
          setLoading(false);
          return;
        }

        const allInternships = await fetchInternships();
        const selectedInternships = allInternships.filter((int: Internship) =>
          ids.includes(int.id)
        );

        if (selectedInternships.length === 0) {
          setError('No matching internships found. The data may have been updated.');
        } else {
          setInternships(selectedInternships);
        }
      } catch (err) {
        console.error('Failed to load shared comparison:', err);
        setError('Failed to load comparison data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [ids]);

  const handleExportPDF = () => {
    try {
      exportComparisonAsPDF(internships);
      toast({
        title: 'PDF Exported',
        description: `Comparison of ${internships.length} internships exported successfully!`,
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      toast({
        title: 'Export Failed',
        description: 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <h1 className="text-4xl font-bold text-foreground mt-4 mb-2">
            Shared Internship Comparison
          </h1>
          <p className="text-muted-foreground">
            {internships.length} internship{internships.length !== 1 ? 's' : ''} being compared
          </p>
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Error Loading Comparison</h3>
                  <p className="text-muted-foreground">{error}</p>
                  <Button className="mt-4" onClick={() => navigate('/')}>
                    Browse Internships
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : internships.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">No internships found in this comparison.</p>
              <Button onClick={() => navigate('/')}>Browse All Internships</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="mb-8 flex gap-2 flex-wrap">
              <Button onClick={handleExportPDF} variant="default">
                📥 Download as PDF
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: 'Link Copied!',
                    description: 'Share this link with others.',
                  });
                }}
                variant="outline"
              >
                🔗 Copy Link
              </Button>
            </div>

            {/* Internship Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <Card key={internship.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">
                      {internship.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{internship.company}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">
                          {typeof internship.location === 'string'
                            ? internship.location
                            : internship.location?.city || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Stipend */}
                    <div className="flex items-start gap-2">
                      <IndianRupee className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Stipend</p>
                        <p className="text-sm font-medium">{internship.stipend}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">{internship.duration}</p>
                      </div>
                    </div>

                    {/* Work Mode */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Work Mode</p>
                      <Badge variant="secondary">{internship.work_mode || 'N/A'}</Badge>
                    </div>

                    {/* Sectors */}
                    {internship.sector_tags?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Sectors</p>
                        <div className="flex flex-wrap gap-1">
                          {internship.sector_tags.slice(0, 3).map((sector, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                          {internship.sector_tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{internship.sector_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deadline */}
                    {internship.deadline && (
                      <div>
                        <p className="text-xs text-muted-foreground">Application Deadline</p>
                        <p className="text-sm font-medium">{internship.deadline}</p>
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
                      className="w-full mt-4"
                    >
                      {internship.apply_link ? 'Apply Now' : 'Link Unavailable'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
