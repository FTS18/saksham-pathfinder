import { ResumeData } from "@/components/resume/ResumePreview";

export const generateLatexCode = (data: ResumeData): string => {
  // Extract and sanitize data
  const escapeLatex = (str: string) => {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/\$/g, "\\$")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}");
  };

  const name = escapeLatex(data.personalInfo.name || "First Last");
  const email = escapeLatex(data.personalInfo.email);
  const phone = escapeLatex(data.personalInfo.phone);
  const linkedinUrl = data.personalInfo.linkedin;
  const linkedinDisplay = escapeLatex(linkedinUrl.replace(/^https?:\/\/(www\.)?/, ""));
  const githubUrl = data.personalInfo.github;
  const githubDisplay = escapeLatex(githubUrl.replace(/^https?:\/\/(www\.)?/, ""));

  let contactInfo = [];
  if (phone) contactInfo.push(phone);
  if (email) contactInfo.push(`\\href{mailto:${email}}{\\underline{${email}}}`);
  if (linkedinUrl) contactInfo.push(`\\href{${linkedinUrl}}{\\underline{${linkedinDisplay}}}`);
  if (githubUrl) contactInfo.push(`\\href{${githubUrl}}{\\underline{${githubDisplay}}}`);
  
  const contactString = contactInfo.join(" $|$ ");

  let latex = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

% Font options
\\usepackage[T1]{fontenc}
% \\usepackage[sfdefault]{roboto}  % Optional sans-serif font
% \\usepackage{charter}            % Optional serif font

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small ${contactString}
\\end{center}
`;

  // EDUCATION
  if (data.education.length > 0) {
    latex += `
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
`;
    data.education.forEach(edu => {
      latex += `    \\resumeSubheading
      {${escapeLatex(edu.school)}}{${escapeLatex(edu.location)}}
      {${escapeLatex(edu.degree)}${edu.gpa ? ` $|$ GPA: ${escapeLatex(edu.gpa)}` : ''}}{${escapeLatex(edu.date)}}
`;
    });
    latex += `  \\resumeSubHeadingListEnd\n`;
  }

  // EXPERIENCE
  if (data.experience.length > 0) {
    latex += `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
`;
    data.experience.forEach(exp => {
      latex += `    \\resumeSubheading
      {${escapeLatex(exp.role)}}{${escapeLatex(exp.date)}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      \\resumeItemListStart
`;
      exp.bullets.forEach(bullet => {
        latex += `        \\resumeItem{${escapeLatex(bullet)}}\n`;
      });
      latex += `      \\resumeItemListEnd\n`;
    });
    latex += `  \\resumeSubHeadingListEnd\n`;
  }

  // PROJECTS
  if (data.projects.length > 0) {
    latex += `
%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
`;
    data.projects.forEach(proj => {
      latex += `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.technologies)}}}{${escapeLatex(proj.date)}}
          \\resumeItemListStart
`;
      proj.bullets.forEach(bullet => {
        latex += `            \\resumeItem{${escapeLatex(bullet)}}\n`;
      });
      latex += `          \\resumeItemListEnd\n`;
    });
    latex += `    \\resumeSubHeadingListEnd\n`;
  }

  // SKILLS
  if (data.skills.languages || data.skills.frameworks || data.skills.tools) {
    latex += `
%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    if (data.skills.languages) {
      latex += `     \\textbf{Languages}{: ${escapeLatex(data.skills.languages)}} \\\\\n`;
    }
    if (data.skills.frameworks) {
      latex += `     \\textbf{Frameworks}{: ${escapeLatex(data.skills.frameworks)}} \\\\\n`;
    }
    if (data.skills.tools) {
      latex += `     \\textbf{Developer Tools}{: ${escapeLatex(data.skills.tools)}}\n`;
    }
    latex += `    }}
 \\end{itemize}\n`;
  }

  latex += `
%-------------------------------------------
\\end{document}
`;

  return latex;
};
