import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, ExternalLink, IndianRupee, Calendar, Users, Clock, Briefcase, BookOpen, Loader2, Bookmark, Volume2, X, BookmarkCheck, ChevronLeft, ChevronRight, Sparkles, Share2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useApplication } from '@/contexts/ApplicationContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { ReadingAssistant } from './ReadingAssistant';
import { SectorIcon } from './SectorIcons';
import { useState, useEffect } from 'react';


interface Internship {
  id: string;
  title: string;
  role: string;
  company: string;
  location: { city: string; lat?: number; lng?: number; } | string;
  stipend: string;
  duration?: string;
  sector_tags: string[];
  required_skills: string[];
  preferred_education_levels?: string[];
  description?: string;
  responsibilities?: string[];
  perks?: string[];
  work_mode?: string;
  type?: string;
  openings?: number;
  application_deadline?: string;
  posted_date?: string;
  apply_link?: string;
}

interface InternshipDetailsModalProps {
  internship: Internship;
  isOpen: boolean;
  onClose: () => void;
  matchExplanation?: string;
  userProfile?: any;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

const translations = {
  en: {
    apply: 'Apply Now',
    description: 'Description',
    responsibilities: 'Responsibilities',
    perks: 'Perks & Benefits',
    requirements: 'Requirements',
    details: 'Details',
    duration: 'Duration',
    type: 'Type',
    openings: 'Openings',
    deadline: 'Application Deadline',
    posted: 'Posted On',
    skills: 'Required Skills',
    education: 'Education Level',
    sectors: 'Sectors'
  },
  hi: {
    apply: 'अभी आवेदन करें',
    description: 'विवरण',
    responsibilities: 'जिम्मेदारियां',
    perks: 'लाभ और सुविधाएं',
    requirements: 'आवश्यकताएं',
    details: 'विवरण',
    duration: 'अवधि',
    type: 'प्रकार',
    openings: 'रिक्तियां',
    deadline: 'आवेदन की अंतिम तिथि',
    posted: 'पोस्ट किया गया',
    skills: 'आवश्यक कौशल',
    education: 'शिक्षा स्तर',
    sectors: 'क्षेत्र'
  }
};

export const InternshipDetailsModal = ({
  internship,
  isOpen,
  onClose,
  matchExplanation,
  userProfile,
  onNext,
  onPrev,
  currentIndex,
  totalCount
}: InternshipDetailsModalProps) => {
  const { language } = useTheme();
  const wishlistContext = useWishlist();
  const { applyToInternship, hasApplied } = useApplication();
  const t = translations[language];
  const [showReadingAssistant, setShowReadingAssistant] = useState(false);
  const [prepGuide, setPrepGuide] = useState<string>('');
  const [loadingPrep, setLoadingPrep] = useState(false);
  
  const isWishlisted = wishlistContext?.isInWishlist ? wishlistContext.isInWishlist(internship.id) : false;
  
  // Make applyToInternship available globally for the button
  useEffect(() => {
    window.applyToInternship = applyToInternship;
    return () => {
      delete window.applyToInternship;
    };
  }, [applyToInternship]);
  
  // Make addNotification available globally
  useEffect(() => {
    const notificationContext = document.querySelector('[data-notification-context]');
    if (notificationContext && notificationContext.addNotification) {
      window.addNotification = notificationContext.addNotification;
    }
  }, []);
  
  useScrollLock(isOpen);
  
  const handleWishlistToggle = () => {
    if (!wishlistContext) return;
    
    if (isWishlisted) {
      wishlistContext.removeFromWishlist(internship.id);
    } else {
      wishlistContext.addToWishlist(internship.id);
    }
  };
  
  const locationText = typeof internship.location === 'string' ? internship.location : internship.location.city;
  
  const getModalText = () => {
    let text = `${internship.title} at ${internship.company}. Location: ${locationText}. Stipend: ${internship.stipend}.`;
    if (internship.description) text += ` Description: ${internship.description}`;
    if (internship.responsibilities) text += ` Responsibilities: ${internship.responsibilities.join(', ')}`;
    if (internship.required_skills) text += ` Required skills: ${internship.required_skills.join(', ')}`;
    return text;
  };

  const generatePrepGuide = async () => {
    setLoadingPrep(true);
    
    // Generate local preparation guide
    const guide = `**1. Interview Process Overview** 🎯

Typical interview rounds for ${internship.title} at ${internship.company}:
- Online Assessment (coding/aptitude)
- Technical Phone/Video Screen
- Onsite/Virtual Technical Rounds
- HR/Behavioral Round

**2. Technical Questions for ${internship.title}** 💻

Common questions for this role:
- **Programming Fundamentals**: "Explain OOP concepts", "What is polymorphism?"
- **Data Structures**: "Implement a stack/queue", "Explain time complexity"
- **Algorithms**: "Write a binary search", "Explain sorting algorithms"
- **Problem Solving**: "How would you debug a slow application?"
- **Role-Specific**: Questions about ${internship.required_skills?.slice(0, 3).join(', ') || 'core skills'}

**3. Algorithm Problems by Difficulty** 🧩

**Easy Level (Start Here)**:
- Two Sum, Reverse String, Valid Parentheses
- Array manipulation, Basic string operations
- Simple recursion problems

**Medium Level (Core Focus)**:
- Binary Tree Traversal, Merge Intervals
- Dynamic Programming basics
- Graph traversal (BFS/DFS)

**4. Company-Specific Insights** 🏢

**${internship.company} Interview Culture**:
- Focus on problem-solving approach
- Values clean, readable code
- Emphasizes explaining thought process
- Looks for learning mindset

**Common Questions**:
- "Why do you want to work at ${internship.company}?"
- "How do you handle tight deadlines?"
- "Describe a challenging project you worked on"

**5. Preparation Timeline** ⏰

**Week 1-2: Foundation Building**
- Review basic data structures and algorithms
- Solve 20-30 easy LeetCode problems
- Research ${internship.company}'s products and culture

**Week 3-4: Skill Enhancement**
- Tackle medium-level problems
- Practice system design basics
- Mock interviews with peers

**Final Week: Polish & Practice**
- Review common interview questions
- Practice coding on whiteboard/paper
- Prepare thoughtful questions to ask

**6. Key Skills to Focus On** 🎯

Based on the role requirements:
${internship.required_skills?.map(skill => `- **${skill}**: Practice problems and build projects`).join('\n') || '- Focus on core programming skills'}

**7. Success Tips** ✨

- Practice explaining your code out loud
- Focus on understanding patterns, not memorizing
- Show enthusiasm for learning and growth
- Prepare specific examples from your projects
- Ask thoughtful questions about the role and team`;
    
    setPrepGuide(guide);
    setLoadingPrep(false);
  };

  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 rounded-none md:rounded-lg z-50 bg-background border w-full h-full max-w-none max-h-none md:max-w-[500px] md:max-h-[85vh] [&>button]:hidden">
        {/* Left Navigation Arrow */}
        {onPrev && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-2 shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Button>
        )}
        
        {/* Right Navigation Arrow */}
        {onNext && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={currentIndex !== undefined && totalCount !== undefined && currentIndex >= totalCount - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border-2 shadow-xl hover:bg-white hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </Button>
        )}

        {/* Fixed Header */}
        <div className="sticky top-0 bg-background border-b z-10 shrink-0">
          {/* Single row: Sector icon + Title, Close button */}
          <div className="flex items-center justify-between p-3">
            {/* Left: Sector icon + Title and Company */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                {internship.sector_tags && internship.sector_tags.length > 0 ? (
                  <SectorIcon sector={internship.sector_tags[0]} className="w-5 h-5 text-primary" />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <DialogHeader className="flex-1">
                <DialogTitle className="text-left">
                  <div className="text-lg font-racing font-bold text-foreground leading-tight">{internship.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{internship.company}</div>
                  {internship.pmis_id && (
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      ID: {internship.pmis_id}
                    </div>
                  )}
                </DialogTitle>
              </DialogHeader>
            </div>
            
            {/* Right: Close button */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {showReadingAssistant && (
            <div className="px-4 pb-2 border-t border-border/50">
              <ReadingAssistant text={getModalText()} isVisible={showReadingAssistant} />
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-40 space-y-4 text-left min-h-0 max-h-[calc(85vh-200px)]">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{locationText}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{internship.stipend}</span>
            </div>
            {internship.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{internship.duration}</span>
              </div>
            )}
            {internship.work_mode && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{internship.work_mode}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {internship.description && (
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-left">{t.description}</h3>
              <p className="text-sm text-muted-foreground text-left">{internship.description}</p>
            </div>
          )}

          {/* Responsibilities */}
          {internship.responsibilities && internship.responsibilities.length > 0 && (
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-left">{t.responsibilities}</h3>
              <ul className="list-disc list-inside space-y-1">
                {internship.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-sm text-muted-foreground text-left">{responsibility}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {internship.required_skills && internship.required_skills.length > 0 && (
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-left">{t.skills}</h3>
              <div className="flex flex-wrap gap-2 justify-start">
                {internship.required_skills.map((skill, index) => {
                  const hasSkill = userProfile?.skills?.some((userSkill: string) => 
                    userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                    skill.toLowerCase().includes(userSkill.toLowerCase())
                  ) || Math.random() > 0.5; // Random for demo
                  
                  return (
                    <a 
                      key={index}
                      href={`/skill/${encodeURIComponent(skill.toLowerCase())}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Badge 
                        variant="secondary" 
                        className={`cursor-pointer hover:opacity-80 transition-colors text-xs py-1 px-2 whitespace-nowrap ${
                          hasSkill 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {skill}
                      </Badge>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Perks */}
          {internship.perks && internship.perks.length > 0 && (
            <div className="text-left">
              <h3 className="font-semibold mb-2 text-left">{t.perks}</h3>
              <div className="flex flex-wrap gap-2 justify-start">
                {internship.perks.map((perk, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {perk}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {internship.type && (
              <div>
                <span className="text-sm font-medium">{t.type}:</span>
                <span className="text-sm text-muted-foreground ml-2">{internship.type}</span>
              </div>
            )}
            {internship.openings && (
              <div>
                <span className="text-sm font-medium">{t.openings}:</span>
                <span className="text-sm text-muted-foreground ml-2">{internship.openings}</span>
              </div>
            )}
            {internship.application_deadline && (
              <div>
                <span className="text-sm font-medium">{t.deadline}:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(internship.application_deadline).toLocaleDateString()}
                </span>
              </div>
            )}
            {internship.posted_date && (
              <div>
                <span className="text-sm font-medium">{t.posted}:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(internship.posted_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>


          
          {/* Interview Preparation Guide */}
          {prepGuide && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Interview Preparation Guide
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div 
                    className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: prepGuide
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Practice Platforms
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer">
                          LeetCode
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.hackerrank.com/domains" target="_blank" rel="noopener noreferrer">
                          HackerRank
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer">
                          GeeksforGeeks
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.codechef.com/practice" target="_blank" rel="noopener noreferrer">
                          CodeChef
                        </a>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Community Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://www.reddit.com/r/cscareerquestions/search/?q=${encodeURIComponent(internship.company + ' interview')}`} target="_blank" rel="noopener noreferrer">
                          r/cscareerquestions
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://www.reddit.com/r/leetcode/search/?q=${encodeURIComponent(internship.company + ' interview')}`} target="_blank" rel="noopener noreferrer">
                          r/leetcode
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://www.geeksforgeeks.org/company-interview-corner/?search=${encodeURIComponent(internship.company)}`} target="_blank" rel="noopener noreferrer">
                          GFG Interviews
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-background border-t p-3 z-20 shrink-0">
          <div className="flex gap-2 mb-2">
            <Button 
              onClick={generatePrepGuide}
              disabled={loadingPrep}
              variant="outline"
              className="flex-1 h-10 rounded-full"
            >
              {loadingPrep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span className="text-sm">More</span>
                </>
              )}
            </Button>
            
            {onPrev && (
              <Button
                variant="outline"
                onClick={onPrev}
                className="h-10 w-10 p-0 disabled:opacity-30"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleWishlistToggle}
              className={`h-10 w-10 p-0 transition-all duration-200 ${isWishlisted ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-10 p-0"
              onClick={(e) => {
                e.stopPropagation();
                const shareUrl = `${window.location.origin}/internship/${internship.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: internship.title,
                    text: `Check out this internship: ${internship.title} at ${internship.company}`,
                    url: shareUrl
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                }
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReadingAssistant(!showReadingAssistant)}
              className="h-10 w-10 p-0"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            {onNext && (
              <Button
                variant="outline"
                onClick={onNext}
                className="h-10 w-10 p-0 disabled:opacity-30"
                disabled={currentIndex !== undefined && totalCount !== undefined && currentIndex >= totalCount - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          {hasApplied(internship.id) ? (
            <Button 
              disabled
              className="w-full bg-green-100 text-green-700 rounded-none h-12 cursor-not-allowed"
            >
              <span>Applied Successfully</span>
            </Button>
          ) : (
            <Button 
              onClick={async () => {
                try {
                  await applyToInternship(internship);
                  // External link opens automatically in context
                  if (internship.apply_link) {
                    window.open(internship.apply_link, '_blank', 'noopener,noreferrer');
                  }
                } catch (error) {
                  console.error('Apply button error:', error);
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 active:scale-95 transition-all duration-150"
            >
              <span>{t.apply}</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};