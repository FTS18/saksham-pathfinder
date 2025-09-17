import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';

export const ResumeParser = ({ onSkillsExtracted }: { onSkillsExtracted: (skills: string[]) => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Simulate AI processing (replace with actual API call)
    setTimeout(() => {
      const mockSkills = ['Python', 'JavaScript', 'React', 'Machine Learning', 'SQL'];
      setExtractedSkills(mockSkills);
      onSkillsExtracted(mockSkills);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AI Resume Parser
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload">
            <Button variant="outline" className="cursor-pointer" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Upload Resume'}
            </Button>
          </label>
          {extractedSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Extracted Skills:</p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-primary/10 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};