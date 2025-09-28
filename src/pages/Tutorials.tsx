import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, ExternalLink } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function Tutorials() {
  const tutorialVideos = [
    {
      title: 'Candidate Registration & e-EYC',
      hindi: 'https://youtu.be/74qVydBeUeM',
      english: 'https://www.youtube.com/watch?v=0QQjAvzXX1M&t=9s',
      description: 'Learn how to register and complete e-EYC process'
    },
    {
      title: 'Profile Completion after Login',
      hindi: 'https://www.youtube.com/watch?v=3bAsDCgcpCY',
      english: 'https://www.youtube.com/watch?v=Xd47t5qGiUE&t=1s',
      description: 'Complete your profile after successful login'
    },
    {
      title: 'Candidate Dashboard Explained',
      hindi: 'https://youtu.be/mC1__GAlKeY',
      english: 'https://www.youtube.com/watch?v=z6StILWX0tU&t=16s',
      description: 'Navigate and understand your dashboard features'
    },
    {
      title: 'Candidate Application Process',
      hindi: 'https://youtu.be/apegI4TM0Pk',
      english: 'https://www.youtube.com/watch?v=TSO9DXtnTAs',
      description: 'Step-by-step guide to apply for internships'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Breadcrumbs />
          <div className="mt-4">
            <h1 className="text-3xl font-racing font-bold text-foreground mb-2">
              Tutorials & Guidance
            </h1>
            <p className="text-muted-foreground">
              Step-by-step video guides to help you navigate the internship application process
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 pt-8">

        <div className="grid gap-6">
          {tutorialVideos.map((video, index) => (
            <Card key={index} className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Play className="w-5 h-5 text-primary" />
                  {video.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                  >
                    <a href={video.hindi} target="_blank" rel="noopener noreferrer">
                      🇮🇳 Watch in Hindi
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                  >
                    <a href={video.english} target="_blank" rel="noopener noreferrer">
                      🇬🇧 Watch in English
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="glass-card bg-primary/5 border-primary/20 mt-8">
          <CardContent className="p-6 text-center">
            <Play className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Need More Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These official tutorial videos will guide you through the entire PM Internship Scheme application process.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline" size="sm">
                <a href="https://pminternship.mca.gov.in" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Official Portal
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="tel:18001160900">
                  📞 Call Helpline: 1800 11 6090
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}