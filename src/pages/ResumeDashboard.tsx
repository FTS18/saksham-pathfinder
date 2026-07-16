import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles } from 'lucide-react';
import { ResumeAnalyzer } from '@/components/resume/ResumeAnalyzer';
import { ResumeBuilder } from '@/components/resume/ResumeBuilder';
import { PageHeader } from '@/components/StickyBreadcrumbHeader';

export const ResumeDashboard = () => {
  const [activeTab, setActiveTab] = useState("analyzer");

  return (
    <div className="bg-background">
      <PageHeader
        title="Resume Hub"
        subtitle="Build a professional LaTeX-style resume or analyze your existing one with AI."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Analyzer
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resume Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyzer" className="mt-0">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>AI Resume Analyzer</CardTitle>
                <CardDescription>
                  Upload your resume and optionally paste a Job Description. Our AI will analyze your resume's ATS compatibility, highlight missing keywords, and suggest improvements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeAnalyzer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="mt-0">
            <Card className="border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>LaTeX Resume Builder</CardTitle>
                <CardDescription>
                  Create a perfectly formatted, ATS-friendly resume using standard LaTeX styling. Export directly to PDF or download the raw .tex code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeBuilder />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResumeDashboard;
