import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp, Hash } from "lucide-react";

export interface AnalysisData {
  score: number;
  strengths: string[];
  missingKeywords: string[];
  actionableFeedback: string[];
  metricsFound: number;
}

export const AnalysisResults = ({ data }: { data: AnalysisData }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/30 rounded-lg border border-border">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-muted stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className={`${data.score >= 80 ? 'text-green-500' : data.score >= 60 ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-1000 ease-in-out`}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * data.score) / 100}
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-racing">{data.score}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ATS Score</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-xl font-semibold">
            {data.score >= 80 ? 'Excellent Resume!' : data.score >= 60 ? 'Good, but needs work.' : 'Needs Significant Revision'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.score >= 80 
              ? 'Your resume is highly optimized for Applicant Tracking Systems and matches standard industry requirements very well.' 
              : 'Your resume might get filtered out by standard ATS systems. Pay attention to the missing keywords and actionable feedback below.'}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {data.metricsFound} Metrics Found
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Keywords */}
        <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
          <h4 className="font-semibold flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" /> Missing Keywords
          </h4>
          <p className="text-xs text-muted-foreground">Adding these terms (if relevant to your experience) will drastically improve your ATS match rate.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {data.missingKeywords?.length > 0 ? (
              data.missingKeywords.map((kw, i) => (
                <Badge key={i} variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">{kw}</Badge>
              ))
            ) : (
              <span className="text-sm text-green-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> No critical missing keywords!</span>
            )}
          </div>
        </div>

        {/* Key Strengths */}
        <div className="space-y-3 p-4 border border-border rounded-lg bg-card shadow-sm">
          <h4 className="font-semibold flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" /> Key Strengths
          </h4>
          <ul className="space-y-2 pt-2">
            {data.strengths?.map((strength, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Feedback */}
      <div className="space-y-3 p-5 border border-border rounded-lg bg-primary/5">
        <h4 className="font-semibold flex items-center gap-2 text-primary">
          <TrendingUp className="w-5 h-5" /> Actionable Improvements
        </h4>
        <ul className="space-y-3 pt-2">
          {data.actionableFeedback?.map((feedback, i) => (
            <li key={i} className="text-sm flex items-start gap-3 bg-background p-3 rounded border border-border/50">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
              <span className="text-foreground/90 mt-0.5 leading-relaxed">{feedback}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
