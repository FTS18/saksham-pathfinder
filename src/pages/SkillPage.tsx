import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InternshipCard } from '@/components/InternshipCard';
import { LazyComponent } from '@/components/LazyComponent';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code, AlertCircle } from 'lucide-react';
import { FirestoreService } from '@/services/firestoreService';

export const SkillPage = () => {
  const { skill } = useParams<{ skill: string }>();
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const decodedSkill = decodeURIComponent(skill || '');
  const displaySkill = decodedSkill.charAt(0).toUpperCase() + decodedSkill.slice(1);

  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/internships.json');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setAllInternships(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load internships:', error);
        setError('Failed to load internships data');
      } finally {
        setLoading(false);
      }
    };
    
    loadInternships();
    
    // Set search value to skill name when page loads
    if (decodedSkill) {
      const searchEvent = new CustomEvent('globalSearch', {
        detail: { query: decodedSkill }
      });
      window.dispatchEvent(searchEvent);
    }
  }, [decodedSkill]);

  const internships = useMemo(() => {
    if (!decodedSkill || allInternships.length === 0) {
      return allInternships;
    }
    
    const normalizedSkill = decodedSkill.toLowerCase().trim();
    
    // Only match exact skills in required_skills array
    return allInternships.filter((internship: any) => {
      const skills = internship.required_skills || [];
      return skills.some((skill: string) => 
        skill.toLowerCase().trim() === normalizedSkill
      );
    });
  }, [decodedSkill, allInternships]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6 px-4">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs />
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground animate-pulse">Loading {displaySkill} internships...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        
        <Breadcrumbs />
        
        <div className="flex items-center gap-3 mb-2 mt-4">
          <Code className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {displaySkill} Internships
          </h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Found {internships.length} internships requiring {displaySkill} skills
        </p>

        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Error Loading Internships
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship, index) => (
              <div key={internship.id || index} className="animate-in fade-in-50 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <LazyComponent 
                  fallback={<SkeletonCard />}
                  rootMargin="200px"
                >
                  <InternshipCard 
                    internship={internship}
                    matchExplanation=""
                    aiTags={[]}
                    aiScore={0}
                  />
                </LazyComponent>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No internships found
            </h3>
            <p className="text-muted-foreground mb-4">
              No internships found requiring {displaySkill} skills
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="hover:scale-105 transition-transform mr-2">
                Browse All Internships
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};