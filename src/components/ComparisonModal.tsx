import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { X, Sparkles, Building2, MapPin, IndianRupee, Loader2 } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

export const ComparisonModal = ({ isOpen, onClose, userProfile }: ComparisonModalProps) => {
  const { selectedInternships, removeFromComparison, clearComparison } = useComparison();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
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
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const internshipsWithScores = selectedInternships.map(internship => ({
        ...internship,
        calculatedScore: calculateScore(internship)
      })).sort((a, b) => b.calculatedScore - a.calculatedScore);
      
      const prompt = `
      As an AI career advisor, analyze and compare these ${selectedInternships.length} internships for a student:

      USER PROFILE:
      - Skills: ${userProfile?.skills?.join(', ') || 'Not specified'}
      - Preferred Sectors: ${userProfile?.sectors?.join(', ') || 'Not specified'}
      - Location: ${userProfile?.desiredLocation?.city || 'Not specified'}
      - Min Stipend: ₹${userProfile?.minStipend || 'Not specified'}

      INTERNSHIPS TO COMPARE (ranked by AI score):
      ${internshipsWithScores.map((internship, index) => `
      ${index + 1}. ${internship.title} at ${internship.company}
         - AI Score: ${internship.calculatedScore}%
         - Location: ${typeof internship.location === 'string' ? internship.location : internship.location.city}
         - Stipend: ${internship.stipend}
         - Skills Required: ${internship.required_skills?.join(', ') || 'Not specified'}
         - Sectors: ${internship.sector_tags?.join(', ') || 'Not specified'}
      `).join('\n')}

      SCORING ALGORITHM EXPLANATION:
      - Skills Match: 50% weight (matched skills / total required skills)
      - Stipend: 30% weight (₹12k+ = full points, ₹8k+ = 70%, below = 40%)
      - Location: 15% weight (exact match with preference)
      - Sector: 5% weight (matched sectors / total sectors)

      Please provide a detailed analysis with **bold formatting** for headings:
      
      **1. Ranking Explanation** 🏆
      Why each internship is ranked in this specific order based on the AI algorithm
      
      **2. Score Breakdown** 📊
      Detailed breakdown of how each internship achieved its AI score:
      - Skills Match (50% weight)
      - Stipend Score (30% weight for 12k+, 20% for lower)
      - Location Match (15% weight)
      - Sector Alignment (5% weight)
      - Company Tier Bonus (if applicable)
      
      **3. Best Match Analysis** ⭐
      Which internship is the optimal choice and comprehensive reasoning
      
      **4. Personalized Recommendations** 💡
      Specific actionable advice for the student's career growth
      
      **5. Skill Gap Analysis** 🎯
      What skills to develop for better matches in the future
      
      Use **bold text** for all section headers and key points. Include emojis and clear formatting.
      `;

      const result = await model.generateContent(prompt);
      setAnalysis(result.response.text());
    } catch (error) {
      setAnalysis('❌ Failed to generate comparison. Please try again.');
    } finally {
      setLoading(false);
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