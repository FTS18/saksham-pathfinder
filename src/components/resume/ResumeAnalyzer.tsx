import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromPdf } from "@/lib/pdfExtractor";
import { localAIService } from "@/lib/localAI";
import { AnalysisResults, AnalysisData } from "./AnalysisResults";
import { Loader2, Upload, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setResults(null); // Clear previous results
    } else if (selectedFile) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // 1. Extract text
      const resumeText = await extractTextFromPdf(file);
      
      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error("Could not extract enough text from the PDF. Is it an image-based PDF?");
      }

      // 2. Send to Gemini for ATS Analysis
      const analysisJson = await localAIService.analyzeResumeATS(resumeText, jdText);
      setResults(analysisJson);
      
      toast({
        title: "Analysis Complete",
        description: "Your resume has been successfully evaluated.",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong during analysis.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {!results ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Resume (PDF)
            </h3>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf" 
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Click to upload your resume</p>
                  <p className="text-sm text-muted-foreground">PDF files only, max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* JD Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Target Job Description (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Paste the job description you are applying for. Our AI will tailor the keywords and ATS score against these specific requirements.
            </p>
            <Textarea 
              placeholder="Paste job description here..." 
              className="h-48 resize-none"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2 flex justify-end pt-4 border-t border-border">
            <Button 
              size="lg" 
              className="w-full md:w-auto font-semibold"
              disabled={!file || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze My Resume
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Analysis Complete</h3>
                <p className="text-sm text-muted-foreground">File: {file?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { setResults(null); setFile(null); }}>
              Analyze Another
            </Button>
          </div>
          
          <AnalysisResults data={results} />
        </div>
      )}
    </div>
  );
};
