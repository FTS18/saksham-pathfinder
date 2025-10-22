import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, FileText, Plus, Trash2 } from 'lucide-react';

interface ResumeSectionProps {
  profile: any;
  onUpdate: (key: string, value: any) => void;
  isLoading: boolean;
}

export const ResumeSection = ({ profile, onUpdate, isLoading }: ResumeSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeTitle, setResumeTitle] = useState(profile?.resumeTitle || '');
  const [resumeUrl, setResumeUrl] = useState(profile?.resumeUrl || '');
  const [resumeDescription, setResumeDescription] = useState(profile?.resumeDescription || '');

  const handleSave = async () => {
    await onUpdate('resume', {
      title: resumeTitle,
      url: resumeUrl,
      description: resumeDescription,
      uploadedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setResumeTitle(profile?.resumeTitle || '');
    setResumeUrl(profile?.resumeUrl || '');
    setResumeDescription(profile?.resumeDescription || '');
    setIsEditing(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Edit Resume
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            {/* Resume Title */}
            <div className="space-y-2">
              <Label htmlFor="resumeTitle">Resume Title</Label>
              <Input
                id="resumeTitle"
                placeholder="e.g., Software Engineer Resume 2024"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Resume URL */}
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                placeholder="https://example.com/my-resume.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Provide a link to your resume (PDF, Google Drive, etc.)
              </p>
            </div>

            {/* Resume Description */}
            <div className="space-y-2">
              <Label htmlFor="resumeDescription">Description</Label>
              <Textarea
                id="resumeDescription"
                placeholder="Brief description of your resume content..."
                value={resumeDescription}
                onChange={(e) => setResumeDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            {/* Upload Hint */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Drag and drop your resume</p>
              <p className="text-xs text-muted-foreground">or paste the link above</p>
            </div>
          </>
        ) : (
          <>
            {resumeUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{resumeTitle || 'My Resume'}</p>
                      <p className="text-xs text-muted-foreground break-all">{resumeUrl}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                  {resumeDescription && (
                    <p className="text-sm text-foreground">{resumeDescription}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No resume uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add your resume to make it easier for recruiters to review your qualifications</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeSection;
