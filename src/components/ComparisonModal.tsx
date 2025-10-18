import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, Sparkles, Building2, MapPin, IndianRupee, Loader2, Download, Share2, Copy, Check } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { localAIService } from '@/lib/localAI';
import { exportComparisonAsPDF } from '@/lib/pdfExporter';
import { useToast } from '@/hooks/use-toast';


interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

export const ComparisonModal = ({ isOpen, onClose, userProfile }: ComparisonModalProps) => {
  const { selectedInternships, removeFromComparison, clearComparison } = useComparison();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  useScrollLock(isOpen);

  const calculateScore = (internship: any) => {
    if (!userProfile) return Math.floor(Math.random() * 30) + 60;
    
    let score = 0;
    const weights = { skills: 50, stipend: 30, location: 15, sector: 5 };
    
    // Skills matching
    const matchedSkills = internship.required_skills?.filter((skill: string) =>
      userProfile.skills?.some((userSkill: string) =>
        userSkill.toLowerCase() === skill.toLowerCase()
      )
    ) || [];
    score += (matchedSkills.length / (internship.required_skills?.length || 1)) * weights.skills;
    
    // Stipend scoring
    const stipendNum = parseInt(internship.stipend.replace(/[^\d]/g, '')) || 0;
    if (stipendNum >= 12000) score += weights.stipend;
    else if (stipendNum >= 8000) score += weights.stipend * 0.7;
    else score += weights.stipend * 0.4;
    
    // Location matching
    const internLocation = typeof internship.location === 'string' ? 
      internship.location : internship.location.city;
    if (userProfile.desiredLocation?.city === internLocation) {
      score += weights.location;
    }
    
    // Sector matching
    const matchedSectors = internship.sector_tags?.filter((sector: string) =>
      userProfile.sectors?.includes(sector)
    ) || [];
    score += (matchedSectors.length / (internship.sector_tags?.length || 1)) * weights.sector;
    
    return Math.min(95, Math.max(45, Math.round(score)));
  };

  const generateComparison = async () => {
    if (selectedInternships.length < 2) return;
    
    setLoading(true);
    
    try {
      const internshipsWithScores = selectedInternships.map(internship => ({
        ...internship,
        calculatedScore: calculateScore(internship)
      })).sort((a, b) => b.calculatedScore - a.calculatedScore);
      
      // Create personalized prompt for Gemini AI
      const comparisonPrompt = `You are analyzing internships for a student. Make it personal and well-formatted.

**Your Profile:**
${userProfile ? `• **Skills:** ${userProfile.skills?.join(', ') || 'Not specified'}\n• **Preferred Location:** ${userProfile.desiredLocation?.city || userProfile.location || 'Any location'}\n• **Interests:** ${userProfile.interests?.join(', ') || 'Open to opportunities'}` : '• Profile being analyzed'}

**Internships to Compare:**
${internshipsWithScores.map((internship, index) => `**${index + 1}. ${internship.title}** at **${internship.company}**\n   📍 ${typeof internship.location === 'string' ? internship.location : internship.location.city} | 💰 ${internship.stipend} | 🤖 **AI Score: ${internship.calculatedScore}%**`).join('\n\n')}

**AI Scoring Breakdown:**
• **Skills Match:** 50% weight - How well your skills align with requirements
• **Stipend Score:** 30% weight - Competitive compensation (₹12k+ gets full points)
• **Location Match:** 15% weight - Distance from your preferred location
• **Sector Alignment:** 5% weight - Match with your interests

**Format your response with:**

## 🏆 **Personalized Ranking**
Explain why each scored what it did based on YOUR profile

## ⭐ **My Recommendation for You**
Which internship YOU should choose and why it's perfect for YOUR goals

## 🤖 **How I Calculated Your Scores**
Brief explanation of the algorithm used for YOUR comparison

Use **bold text**, bullet points, and make it feel personal to the student.`;
      
      // Use dedicated comparison method
      const aiAnalysis = await localAIService.generateInternshipComparison(comparisonPrompt);
      
      setAnalysis(aiAnalysis);
    } catch (error) {
      console.error('AI comparison failed:', error);
      
      // Fallback to local analysis only if completely offline
      if (!navigator.onLine) {
        const internshipsWithScores = selectedInternships.map(internship => ({
          ...internship,
          calculatedScore: calculateScore(internship)
        })).sort((a, b) => b.calculatedScore - a.calculatedScore);
        
        // Don't show offline fallback - just show error
        setAnalysis('**❌ Unable to generate AI analysis**\n\nPlease check your internet connection and try again.');
        
        setAnalysis(fallbackAnalysis);
      } else {
        setAnalysis('**❌ Analysis Failed**\n\nUnable to generate AI comparison. Please try again or check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (selectedInternships.length === 0) return;
    
    try {
      exportComparisonAsPDF(selectedInternships);
      toast({
        title: 'PDF Exported',
        description: `Comparison of ${selectedInternships.length} internships exported successfully!`,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShareLink = async () => {
    if (selectedInternships.length === 0) return;
    
    try {
      const internshipIds = selectedInternships.map(i => i.id).join(',');
      const shareUrl = `${window.location.origin}/shared-comparison?ids=${internshipIds}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      toast({
        title: 'Link Copied!',
        description: 'Share this link with friends to show your comparison.',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not copy link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Internship Comparison ({selectedInternships.length}/3)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedInternships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No internships selected for comparison</p>
              <p className="text-sm">Add internships using the compare button on cards</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedInternships.map((internship, index) => (
                  <Card key={internship.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeFromComparison(internship.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{internship.title}</h4>
                          <p className="text-xs text-muted-foreground">{internship.company}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{typeof internship.location === 'string' ? internship.location : internship.location.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          <span>{internship.stipend}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">AI Score</span>
                          <Badge variant="secondary" className="text-xs">
                            {calculateScore(internship)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateComparison}
                  disabled={selectedInternships.length < 2 || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Compare
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearComparison}>
                  Clear All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportPDF}
                  disabled={selectedInternships.length === 0}
                  title="Export comparison as PDF"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShareLink}
                  disabled={selectedInternships.length === 0}
                  title="Copy shareable link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Link
                    </>
                  )}
                </Button>
              </div>

              {analysis && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      AI Analysis & Recommendations
                    </h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div 
                        className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: analysis
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};