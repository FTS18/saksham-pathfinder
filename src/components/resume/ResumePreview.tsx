import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Code } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { generateLatexCode } from '@/lib/latexGenerator';
import { useToast } from '@/hooks/use-toast';

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
  };
  education: Array<{
    school: string;
    degree: string;
    location: string;
    date: string;
    gpa: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    technologies: string;
    date: string;
    bullets: string[];
  }>;
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
  };
}

// -----------------------------------------------------------------------------
// This component mimics the exact styling of standard LaTeX "Jake's Resume"
// template, using system serif fonts to closely resemble Computer Modern.
// -----------------------------------------------------------------------------
const PrintableResume = React.forwardRef<HTMLDivElement, { data: ResumeData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white text-black p-[0.75in] w-[8.5in] h-[11in] overflow-hidden box-border print:w-full print:h-full print:p-[0.5in] print:m-0"
        style={{
          fontFamily: "'Computer Modern', 'Times New Roman', serif",
          fontSize: "11pt",
          lineHeight: "1.15",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: "-0.5px" }}>
            {data.personalInfo.name || "First Last"}
          </h1>
          <div className="text-sm flex flex-wrap justify-center gap-2 text-black/80">
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.phone && data.personalInfo.email && <span>|</span>}
            {data.personalInfo.email && (
              <a href={`mailto:${data.personalInfo.email}`} className="underline">
                {data.personalInfo.email}
              </a>
            )}
            {data.personalInfo.email && data.personalInfo.linkedin && <span>|</span>}
            {data.personalInfo.linkedin && (
              <a href={data.personalInfo.linkedin} className="underline">
                {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
            {data.personalInfo.linkedin && data.personalInfo.github && <span>|</span>}
            {data.personalInfo.github && (
              <a href={data.personalInfo.github} className="underline">
                {data.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
          </div>
        </div>

        {/* EDUCATION */}
        {data.education.length > 0 && (
          <div className="mb-3">
            <h2 className="text-lg font-bold uppercase border-b border-black mb-1 pb-0">Education</h2>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{edu.school}</span>
                  <span className="italic">{edu.location}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="italic">{edu.degree}</span>
                  <span className="italic">{edu.date}</span>
                </div>
                {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {/* EXPERIENCE */}
        {data.experience.length > 0 && (
          <div className="mb-3">
            <h2 className="text-lg font-bold uppercase border-b border-black mb-1 pb-0">Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">{exp.role}</span>
                  <span className="italic">{exp.date}</span>
                </div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="italic">{exp.company}</span>
                  <span className="italic">{exp.location}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5pt]">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="pl-1">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS */}
        {data.projects.length > 0 && (
          <div className="mb-3">
            <h2 className="text-lg font-bold uppercase border-b border-black mb-1 pb-0">Projects</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline mb-1">
                  <span>
                    <span className="font-bold">{proj.name}</span>
                    {proj.technologies && (
                      <> | <span className="italic">{proj.technologies}</span></>
                    )}
                  </span>
                  <span className="italic">{proj.date}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5pt]">
                  {proj.bullets.map((bullet, j) => (
                    <li key={j} className="pl-1">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TECHNICAL SKILLS */}
        {(data.skills.languages || data.skills.frameworks || data.skills.tools) && (
          <div className="mb-3">
            <h2 className="text-lg font-bold uppercase border-b border-black mb-1 pb-0">Technical Skills</h2>
            <div className="space-y-1">
              {data.skills.languages && (
                <div><span className="font-bold">Languages:</span> {data.skills.languages}</div>
              )}
              {data.skills.frameworks && (
                <div><span className="font-bold">Frameworks:</span> {data.skills.frameworks}</div>
              )}
              {data.skills.tools && (
                <div><span className="font-bold">Developer Tools:</span> {data.skills.tools}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PrintableResume.displayName = 'PrintableResume';

export const ResumePreview = ({ data }: { data: ResumeData }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume`,
  });

  const handleExportLatex = () => {
    try {
      const texCode = generateLatexCode(data);
      const blob = new Blob([texCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "LaTeX Code Exported!",
        description: "You can upload this .tex file to Overleaf to compile it natively.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Export Failed",
        description: "Failed to generate LaTeX code.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-border">
        <div className="text-sm text-muted-foreground">
          Live Preview (A4 / Letter format)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportLatex}>
            <Code className="w-4 h-4 mr-2" /> Export .tex
          </Button>
          <Button size="sm" onClick={() => handlePrint()}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>
      
      {/* 
        This wrapper creates a scaled-down view for the dashboard so it fits nicely 
        without overflowing horizontally, while the actual PrintableResume stays 8.5x11 inches.
      */}
      <div className="w-full overflow-hidden bg-muted/20 border border-border rounded-lg flex justify-center py-8">
        <div className="shadow-2xl origin-top" style={{ transform: "scale(0.75)" }}>
          <PrintableResume ref={componentRef} data={data} />
        </div>
      </div>
    </div>
  );
};
