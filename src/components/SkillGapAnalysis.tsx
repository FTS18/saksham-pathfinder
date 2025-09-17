import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, ExternalLink, BookOpen, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SkillGap {
  skill: string;
  frequency: number;
  resources: { title: string; url: string; type: 'course' | 'tutorial' | 'practice' }[];
}

interface SkillGapAnalysisProps {
  userProfile: any;
  internships: any[];
}

const learningResources: Record<string, { title: string; url: string; type: 'course' | 'tutorial' | 'practice' }[]> = {
  'React': [
    { title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'tutorial' },
    { title: 'React Course - freeCodeCamp', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', type: 'course' },
    { title: 'React Challenges', url: 'https://www.codewars.com/kata/search/react', type: 'practice' }
  ],
  'Python': [
    { title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'tutorial' },
    { title: 'Python for Everybody', url: 'https://www.coursera.org/specializations/python', type: 'course' },
    { title: 'Python Practice', url: 'https://www.hackerrank.com/domains/python', type: 'practice' }
  ],
  'JavaScript': [
    { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'tutorial' },
    { title: 'JavaScript Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', type: 'course' },
    { title: 'JS Practice Problems', url: 'https://www.codewars.com/kata/search/javascript', type: 'practice' }
  ],
  'Node.js': [
    { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs/', type: 'tutorial' },
    { title: 'Node.js Course', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', type: 'course' }
  ],
  'Java': [
    { title: 'Oracle Java Tutorial', url: 'https://docs.oracle.com/javase/tutorial/', type: 'tutorial' },
    { title: 'Java Programming', url: 'https://www.coursera.org/learn/java-programming', type: 'course' },
    { title: 'Java Practice', url: 'https://www.hackerrank.com/domains/java', type: 'practice' }
  ]
};

export const SkillGapAnalysis = ({ userProfile, internships }: SkillGapAnalysisProps) => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    analyzeSkillGaps();
    calculateProfileCompletion();
  }, [userProfile, internships]);

  const analyzeSkillGaps = () => {
    if (!userProfile?.skills || !internships.length) return;

    const userSkills = userProfile.skills.map((s: string) => s.toLowerCase());
    const skillFrequency: Record<string, number> = {};

    // Count skill frequency in internships
    internships.forEach(internship => {
      internship.required_skills?.forEach((skill: string) => {
        const skillLower = skill.toLowerCase();
        if (!userSkills.includes(skillLower)) {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        }
      });
    });

    // Convert to array and sort by frequency
    const gaps = Object.entries(skillFrequency)
      .map(([skill, frequency]) => ({
        skill,
        frequency,
        resources: learningResources[skill] || [
          { title: `Learn ${skill}`, url: `https://www.google.com/search?q=learn+${skill}+tutorial`, type: 'tutorial' as const }
        ]
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    setSkillGaps(gaps);
  };

  const calculateProfileCompletion = () => {
    if (!userProfile) return;

    const fields = ['name', 'email', 'skills', 'interests', 'location', 'education'];
    const completed = fields.filter(field => {
      const value = userProfile[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.trim().length > 0);
    }).length;

    setProfileCompletion((completed / fields.length) * 100);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Profile Strength</span>
              <span>{Math.round(profileCompletion)}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {profileCompletion < 80 
                ? 'Complete your profile to get better recommendations'
                : 'Great! Your profile is well-optimized'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Skills to Learn
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top skills missing from your profile that appear in {internships.length} internships
          </p>
        </CardHeader>
        <CardContent>
          {skillGaps.length > 0 ? (
            <div className="space-y-4">
              {skillGaps.map((gap, index) => (
                <div key={gap.skill} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{gap.skill}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Appears in {gap.frequency} internships
                      </span>
                    </div>
                    <div className="text-xs text-primary font-medium">
                      #{index + 1} Priority
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {gap.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
                      >
                        {getResourceIcon(resource.type)}
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {userProfile?.skills?.length > 0 
                  ? 'Great! You have most skills needed for available internships'
                  : 'Add skills to your profile to see personalized recommendations'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};