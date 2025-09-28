import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, CloudUpload, Download, Eye, Loader2, Link } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, parseResumeText, fetchGitHubProfile, ResumeData } from '@/services/resumeScanner';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ResumeUploaderProps {
  onDataExtracted: (data: ResumeData) => void;
}

export const ResumeUploader = ({ onDataExtracted }: ResumeUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ResumeData | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file);
      } else if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        throw new Error('Unsupported file type');
      }

      const parsedData = parseResumeText(text);
      setExtractedData(parsedData);
      onDataExtracted(parsedData);
      
      toast({
        title: 'Resume Processed',
        description: 'Successfully extracted information from your resume.',
      });
    } catch (error) {
      toast({
        title: 'Processing Failed',
        description: 'Failed to process resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onDataExtracted, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleGitHubFetch = async () => {
    if (!githubUsername.trim()) return;
    
    setIsProcessing(true);
    try {
      const githubData = await fetchGitHubProfile(githubUsername.trim());
      if (githubData) {
        const enhancedData: ResumeData = {
          ...extractedData,
          name: extractedData?.name || githubData.name,
          github: `github.com/${githubUsername}`,
          skills: [
            ...(extractedData?.skills || []),
            ...githubData.topRepos.map(repo => repo.language).filter(Boolean)
          ],
          rawText: (extractedData?.rawText || '') + `\n\nGitHub: ${githubData.bio || ''}`
        };
        
        setExtractedData(enhancedData);
        onDataExtracted(enhancedData);
        
        toast({
          title: 'GitHub Data Fetched',
          description: 'Successfully imported GitHub profile information.',
        });
      }
    } catch (error) {
      toast({
        title: 'GitHub Fetch Failed',
        description: 'Could not fetch GitHub profile. Check username.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <CloudUpload className="w-16 h-16 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p>Drop your resume here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop your resume here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports PDF, images (PNG, JPG), and text files</p>
              </div>
            )}
          </div>
          
          {isProcessing && (
            <div className="mt-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Processing resume...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Profile Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Import from Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="github">GitHub Username</Label>
              <Input
                id="github"
                placeholder="your-username"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
            <Button onClick={handleGitHubFetch} disabled={isProcessing || !githubUsername.trim()}>
              <Download className="w-4 h-4 mr-2" />
              Fetch
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="linkedin">LinkedIn Username</Label>
              <Input
                id="linkedin"
                placeholder="your-username"
                value={linkedinUsername}
                onChange={(e) => setLinkedinUsername(e.target.value)}
                disabled
              />
            </div>
            <Button disabled>
              <Download className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            LinkedIn integration requires business API access. GitHub is free and available now.
          </p>
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Extracted Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-sm">{extractedData.name || 'Not found'}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm">{extractedData.email || 'Not found'}</p>
              </div>
              <div>
                <Label>Phone</Label>
                <p className="text-sm">{extractedData.phone || 'Not found'}</p>
              </div>
              <div>
                <Label>GitHub</Label>
                <p className="text-sm">{extractedData.github || 'Not found'}</p>
              </div>
            </div>
            
            <div>
              <Label>Skills ({extractedData.skills.length})</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {extractedData.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Raw Text Preview</Label>
              <Textarea
                value={extractedData.rawText.substring(0, 500) + '...'}
                readOnly
                className="h-32"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};