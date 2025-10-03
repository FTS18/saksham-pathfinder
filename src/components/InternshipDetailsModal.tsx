import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, ExternalLink, IndianRupee, Calendar, Users, Clock, Briefcase, BookOpen, Loader2, Bookmark, Volume2, X, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { ReadingAssistant } from './ReadingAssistant';
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
  const t = translations[language];
  const [showReadingAssistant, setShowReadingAssistant] = useState(false);
  const [prepGuide, setPrepGuide] = useState<string>('');
  const [loadingPrep, setLoadingPrep] = useState(false);
  
  const isWishlisted = wishlistContext?.isInWishlist ? wishlistContext.isInWishlist(internship.id) : false;
  
  useScrollLock(isOpen);
  
  const handleWishlistToggle = () => {
    if (!wishlistContext) return;
    
    if (isWishlisted) {
      wishlistContext.removeFromWishlist(internship.id);
    } else {
      wishlistContext.addToWishlist(internship);
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
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
      Generate a comprehensive interview preparation guide for:
      **Role**: ${internship.title}
      **Company**: ${internship.company}
      **Required Skills**: ${internship.required_skills?.join(', ') || 'Not specified'}
      **Location**: ${locationText}
      **Stipend**: ${internship.stipend}
      
      Provide detailed preparation guide with **bold formatting**:
      
      **1. Interview Process Overview** 🎯
      Typical interview rounds for ${internship.title} at ${internship.company}:
      - Online Assessment (if applicable)
      - Technical Phone/Video Screen
      - Onsite/Virtual Technical Rounds
      - HR/Behavioral Round
      
      **2. Specific Technical Questions** 💻
      Actual questions commonly asked for this role:
      - **Programming Fundamentals**: "Explain OOP concepts", "What is polymorphism?"
      - **Data Structures**: "Implement a stack/queue", "Explain time complexity"
      - **Algorithms**: "Write a binary search", "Explain sorting algorithms"
      - **System Design**: "Design a simple web application" (for senior roles)
      - **Database**: "Write SQL queries", "Explain normalization"
      - **Problem Solving**: "How would you debug a slow application?"
      
      **3. Algorithm Problems by Difficulty** 🧩
      **Easy Level (Start Here)**:
      - Two Sum, Reverse String, Valid Parentheses
      - Array manipulation, Basic string operations
      - Simple recursion problems
      
      **Medium Level (Core Focus)**:
      - Binary Tree Traversal, Merge Intervals
      - Dynamic Programming basics
      - Graph traversal (BFS/DFS)
      
      **Hard Level (If Time Permits)**:
      - Advanced DP, Complex graph problems
      - System design components
      
      **Platform-Specific Recommendations**:
      - **LeetCode**: Focus on Top 100 Liked Questions
      - **HackerRank**: Complete ${internship.required_skills?.join(', ') || 'programming'} skill assessments
      - **GeeksforGeeks**: Read interview experiences for ${internship.company}
      - **CodeChef**: Practice contest problems for logical thinking
      
      **4. Company-Specific Insights** 🏢
      **${internship.company} Interview Culture**:
      - Known for asking practical coding problems
      - Values clean, readable code over complex solutions
      - Emphasizes problem-solving approach over perfect answers
      - Looks for candidates who can explain their thought process
      
      **Common ${internship.company} Questions**:
      - "Why do you want to work at ${internship.company}?"
      - "How do you handle tight deadlines?"
      - "Describe a challenging project you worked on"
      
      **5. Community Insights from Reddit & Forums** 💬
      **r/cscareerquestions insights**:
      - "Practice explaining your code out loud"
      - "${internship.company} interviews focus more on problem-solving than memorization"
      - "Be prepared to write code on a whiteboard or shared screen"
      - Search: https://www.reddit.com/r/cscareerquestions/search/?q=${encodeURIComponent(internship.company + ' interview')}
      
      **r/leetcode community tips**:
      - "Start with easy problems and gradually increase difficulty"
      - "Focus on understanding patterns rather than memorizing solutions"
      - "Practice mock interviews with friends or online platforms"
      - Search: https://www.reddit.com/r/leetcode/search/?q=${encodeURIComponent(internship.company + ' interview')}
      
      **GeeksforGeeks Interview Experiences**:
      - Candidates report ${internship.company} asks about projects in detail
      - Technical rounds usually include 2-3 coding problems
      - HR round focuses on cultural fit and long-term goals
      - Search: https://www.geeksforgeeks.org/company-interview-corner/?search=${encodeURIComponent(internship.company)}
      
      **6. Preparation Timeline** ⏰
      **Week 1-2: Foundation Building**
      - Review basic data structures and algorithms
      - Solve 20-30 easy LeetCode problems
      - Read about ${internship.company}'s products and culture
      
      **Week 3-4: Skill Enhancement**
      - Tackle medium-level problems
      - Practice system design basics
      - Mock interviews with peers
      
      **Final Week: Polish & Practice**
      - Review common interview questions
      - Practice coding on whiteboard/paper
      - Prepare thoughtful questions to ask interviewer
      
      **7. Salary Negotiation Strategy** 💰
      **Current Offer**: ${internship.stipend}
      - Research market rates for similar roles
      - Highlight your unique skills and projects
      - Be prepared to discuss value you bring
      - Consider total compensation (learning opportunities, mentorship)
      
      **8. Red Flags to Avoid** ⚠️
      - Don't say "I don't know" without trying to think through the problem
      - Avoid writing code without explaining your approach first
      - Don't focus only on getting the right answer; explain your process
      - Never badmouth previous employers or experiences
      
      **9. Success Stories & Tips** ✨
      **From Reddit Success Posts**:
      - "I got the ${internship.company} internship by focusing on fundamentals"
      - "Practice explaining complex concepts in simple terms"
      - "Show enthusiasm for learning and growth"
      
      Use **bold text** for all headers and key points. Include specific, actionable examples.
      `;

      const result = await model.generateContent(prompt);
      setPrepGuide(result.response.text());
    } catch (error) {
      setPrepGuide('❌ Failed to generate preparation guide. Please try again.');
    } finally {
      setLoadingPrep(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-full !h-full md:!max-w-2xl md:!w-[768px] md:!max-h-[90vh] md:!h-auto flex flex-col p-0 md:rounded-lg rounded-none !fixed !inset-0 md:!top-[50%] md:!left-[50%] md:!translate-x-[-50%] md:!translate-y-[-50%] z-[100] bg-background border [&>button]:hidden mobile-modal landscape-modal">
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
        <div className="sticky top-0 bg-background border-b p-4 z-10 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-left">
                  <div className="text-lg font-bold">{internship.title}</div>
                  <div className="text-sm font-normal text-muted-foreground">{internship.company}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onPrev && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrev}
                    className="w-8 h-8 p-0"
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                {onNext && totalCount && currentIndex !== undefined && (
                  <span className="text-xs text-muted-foreground px-2">
                    {currentIndex + 1} / {totalCount}
                  </span>
                )}
                {onNext && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNext}
                    className="w-8 h-8 p-0"
                    disabled={currentIndex !== undefined && totalCount !== undefined && currentIndex >= totalCount - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className={`w-8 h-8 p-0 transition-all duration-200 ${isWishlisted ? 'bg-primary/10' : ''}`}
                >
                  {isWishlisted ? (
                    <Bookmark className="w-4 h-4 text-primary fill-current" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReadingAssistant(!showReadingAssistant)}
                  className="w-8 h-8 p-0"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
            {showReadingAssistant && (
              <ReadingAssistant text={getModalText()} isVisible={showReadingAssistant} />
            )}
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 text-left min-h-0">
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
                {internship.required_skills.map((skill, index) => (
                  <a 
                    key={index}
                    href={`/skill/${encodeURIComponent(skill.toLowerCase())}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {skill}
                    </Badge>
                  </a>
                ))}
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
          <div className="flex gap-3 button-group-mobile">
            <Button 
              onClick={generatePrepGuide}
              disabled={loadingPrep}
              variant="outline"
              className="flex-1 rounded-full h-12"
            >
              {loadingPrep ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  More
                </>
              )}
            </Button>
            <a 
              href={internship.apply_link || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1"
            >
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12">
                <span>{t.apply}</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};