import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Code, LayoutTemplate } from "lucide-react";
import { ResumePreview, ResumeData } from "./ResumePreview";
import { LatexEditor } from "./LatexEditor";
import { generateLatexCode } from "@/lib/latexGenerator";
import { useAuth } from "@/contexts/AuthContext";

const defaultData: ResumeData = {
  personalInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (123) 456-7890",
    github: "github.com/johndoe",
    linkedin: "linkedin.com/in/johndoe",
  },
  education: [
    {
      school: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      location: "San Francisco, CA",
      date: "Aug 2018 - May 2022",
      gpa: "3.8/4.0",
    },
  ],
  experience: [
    {
      company: "Tech Innovations Inc",
      role: "Software Engineering Intern",
      location: "Seattle, WA",
      date: "Jun 2021 - Aug 2021",
      bullets: [
        "Developed and maintained scalable backend services using Node.js and Express.",
        "Improved database query performance by 30% through index optimization.",
        "Collaborated with cross-functional teams to deliver features on schedule.",
      ],
    },
  ],
  projects: [
    {
      name: "Portfolio Website",
      technologies: "React, Vite, Tailwind CSS",
      date: "Jan 2022 - Present",
      bullets: [
        "Built a highly responsive portfolio website to showcase personal projects.",
        "Implemented continuous integration and deployment using GitHub Actions.",
      ],
    },
  ],
  skills: {
    languages: "Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R",
    frameworks: "React, Node.js, Express, JUnit, WordPress, Material-UI, FastAPI",
    tools: "Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse",
  },
};

export const ResumeBuilder = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<ResumeData>(defaultData);
  const [mode, setMode] = useState<'form' | 'latex'>('form');

  // Auto-fill from profile data if available
  useEffect(() => {
    if (currentUser) {
      const savedProfile = localStorage.getItem(`profileData_${currentUser.uid}`);
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              name: currentUser.displayName || profile.name || prev.personalInfo.name,
              email: currentUser.email || prev.personalInfo.email,
            }
          }));
        } catch (e) {
          console.error("Failed to parse profile data");
        }
      }
    }
  }, [currentUser]);

  const updatePersonalInfo = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSkills = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  // Generic handlers for arrays (education, experience, projects)
  const addArrayItem = (key: 'education' | 'experience' | 'projects', emptyItem: any) => {
    setData((prev) => ({
      ...prev,
      [key]: [...prev[key], emptyItem],
    }));
  };

  const removeArrayItem = (key: 'education' | 'experience' | 'projects', index: number) => {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (key: 'education' | 'experience' | 'projects', index: number, field: string, value: any) => {
    setData((prev) => {
      const newArr = [...prev[key]] as any[];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...prev, [key]: newArr };
    });
  };

  const updateBullet = (key: 'experience' | 'projects', index: number, bulletIndex: number, value: string) => {
    setData((prev) => {
      const newArr = [...prev[key]] as any[];
      const newBullets = [...newArr[index].bullets];
      newBullets[bulletIndex] = value;
      newArr[index] = { ...newArr[index], bullets: newBullets };
      return { ...prev, [key]: newArr };
    });
  };

  const addBullet = (key: 'experience' | 'projects', index: number) => {
    setData((prev) => {
      const newArr = [...prev[key]] as any[];
      newArr[index] = { ...newArr[index], bullets: [...newArr[index].bullets, ""] };
      return { ...prev, [key]: newArr };
    });
  };

  const removeBullet = (key: 'experience' | 'projects', index: number, bulletIndex: number) => {
    setData((prev) => {
      const newArr = [...prev[key]] as any[];
      newArr[index] = { 
        ...newArr[index], 
        bullets: newArr[index].bullets.filter((_: any, i: number) => i !== bulletIndex) 
      };
      return { ...prev, [key]: newArr };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
          <Button 
            variant={mode === 'form' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-md"
            onClick={() => setMode('form')}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Form Builder
          </Button>
          <Button 
            variant={mode === 'latex' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-md"
            onClick={() => setMode('latex')}
          >
            <Code className="w-4 h-4 mr-2" />
            LaTeX Editor
          </Button>
        </div>
      </div>

      {mode === 'latex' ? (
        <LatexEditor initialCode={generateLatexCode(data)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Form */}
          <div className="space-y-6 h-[800px] overflow-y-auto pr-4 custom-scrollbar">
        
        {/* Personal Info */}
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={data.personalInfo.name} onChange={(e) => updatePersonalInfo("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={data.personalInfo.email} onChange={(e) => updatePersonalInfo("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn URL</Label>
                <Input value={data.personalInfo.linkedin} onChange={(e) => updatePersonalInfo("linkedin", e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>GitHub URL</Label>
                <Input value={data.personalInfo.github} onChange={(e) => updatePersonalInfo("github", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-semibold text-lg">Education</h3>
              <Button size="sm" variant="outline" onClick={() => addArrayItem('education', { school: "", degree: "", location: "", date: "", gpa: "" })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            
            {data.education.map((edu, i) => (
              <div key={i} className="relative space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => removeArrayItem('education', i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>School</Label>
                    <Input value={edu.school} onChange={(e) => updateArrayItem('education', i, 'school', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree / Major</Label>
                    <Input value={edu.degree} onChange={(e) => updateArrayItem('education', i, 'degree', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={edu.location} onChange={(e) => updateArrayItem('education', i, 'location', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date (e.g. Aug 2018 - May 2022)</Label>
                    <Input value={edu.date} onChange={(e) => updateArrayItem('education', i, 'date', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>GPA (Optional)</Label>
                    <Input value={edu.gpa} onChange={(e) => updateArrayItem('education', i, 'gpa', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-semibold text-lg">Experience</h3>
              <Button size="sm" variant="outline" onClick={() => addArrayItem('experience', { company: "", role: "", location: "", date: "", bullets: [""] })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {data.experience.map((exp, i) => (
              <div key={i} className="relative space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => removeArrayItem('experience', i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={exp.company} onChange={(e) => updateArrayItem('experience', i, 'company', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={exp.role} onChange={(e) => updateArrayItem('experience', i, 'role', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={exp.location} onChange={(e) => updateArrayItem('experience', i, 'location', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={exp.date} onChange={(e) => updateArrayItem('experience', i, 'date', e.target.value)} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Bullet Points</Label>
                    <Button size="sm" variant="ghost" onClick={() => addBullet('experience', i)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Bullet
                    </Button>
                  </div>
                  {exp.bullets.map((bullet, j) => (
                    <div key={j} className="flex gap-2">
                      <Textarea 
                        value={bullet} 
                        onChange={(e) => updateBullet('experience', i, j, e.target.value)} 
                        className="min-h-[60px]"
                      />
                      <Button size="icon" variant="ghost" className="text-red-500 shrink-0" onClick={() => removeBullet('experience', i, j)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-semibold text-lg">Projects</h3>
              <Button size="sm" variant="outline" onClick={() => addArrayItem('projects', { name: "", technologies: "", date: "", bullets: [""] })}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {data.projects.map((proj, i) => (
              <div key={i} className="relative space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 h-6 w-6 rounded-full" onClick={() => removeArrayItem('projects', i)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input value={proj.name} onChange={(e) => updateArrayItem('projects', i, 'name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input value={proj.date} onChange={(e) => updateArrayItem('projects', i, 'date', e.target.value)} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Technologies Used (comma separated)</Label>
                    <Input value={proj.technologies} onChange={(e) => updateArrayItem('projects', i, 'technologies', e.target.value)} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Bullet Points</Label>
                    <Button size="sm" variant="ghost" onClick={() => addBullet('projects', i)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Bullet
                    </Button>
                  </div>
                  {proj.bullets.map((bullet, j) => (
                    <div key={j} className="flex gap-2">
                      <Textarea 
                        value={bullet} 
                        onChange={(e) => updateBullet('projects', i, j, e.target.value)} 
                        className="min-h-[60px]"
                      />
                      <Button size="icon" variant="ghost" className="text-red-500 shrink-0" onClick={() => removeBullet('projects', i, j)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card className="border-border/50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Technical Skills</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Languages</Label>
                <Input value={data.skills.languages} onChange={(e) => updateSkills("languages", e.target.value)} placeholder="e.g. Java, Python, C++" />
              </div>
              <div className="space-y-2">
                <Label>Frameworks</Label>
                <Input value={data.skills.frameworks} onChange={(e) => updateSkills("frameworks", e.target.value)} placeholder="e.g. React, Node.js, Spring Boot" />
              </div>
              <div className="space-y-2">
                <Label>Tools</Label>
                <Input value={data.skills.tools} onChange={(e) => updateSkills("tools", e.target.value)} placeholder="e.g. Git, Docker, AWS" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Live Preview */}
        <div className="h-[800px] sticky top-0 overflow-y-auto custom-scrollbar border border-border rounded-lg bg-card shadow-lg hidden lg:block">
          <ResumePreview data={data} />
        </div>
      </div>
      )}
    </div>
  );
};
