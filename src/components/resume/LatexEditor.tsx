import { useState, useRef, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-latex';
import 'prismjs/themes/prism-tomorrow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Play, Download, Code, Sparkles, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { localAIService } from '@/lib/localAI';
import { cn } from '@/lib/utils';

interface LatexEditorProps {
  initialCode: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const LatexEditor = ({ initialCode }: LatexEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [isCompiling, setIsCompiling] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Chat state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm your AI LaTeX assistant. Ask me to change fonts, add sections, or fix formatting!" }
  ]);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCompile = (codeToCompile = code) => {
    // Generate the URL for the latex compiler
    // We set this directly to the object data src to avoid CORS issues
    // The browser natively loads the PDF or shows the compiler error log
    const url = `https://latexonline.cc/compile?text=${encodeURIComponent(codeToCompile)}`;
    setPdfUrl(url);
    
    toast({
      title: "Compilation Started",
      description: "Loading PDF from the compiler...",
    });
  };

  const handleDownloadTex = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChat = async () => {
    if (!aiPrompt.trim()) return;
    
    const userMessage = aiPrompt.trim();
    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    
    setMessages(updatedMessages);
    setAiPrompt("");
    setIsAiProcessing(true);
    
    try {
      const result = await localAIService.chatWithLatexEditor(updatedMessages, code);
      
      setMessages([...updatedMessages, { role: 'assistant', content: result.message }]);
      
      if (result.latexCode !== code) {
        setCode(result.latexCode);
        toast({
          title: "Code Updated",
          description: "AI applied changes. Recompiling PDF...",
        });
        // Automatically compile the new code
        handleCompile(result.latexCode);
      }
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "Failed to process AI request.",
        variant: "destructive"
      });
      // Optionally remove the user message if it failed, or add an error message from assistant
      setMessages([...updatedMessages, { role: 'assistant', content: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-4 h-[800px] w-full max-w-[1600px] mx-auto">
      
      {/* 1. AI Chat Sidebar */}
      <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card h-full shadow-lg">
        <div className="p-3 bg-muted border-b border-border flex items-center gap-2 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-blue-500" />
          AI Assistant
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatScrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-2 text-sm max-w-[85%]",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted text-foreground rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isAiProcessing && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl rounded-tl-sm px-4 py-2 text-sm flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-background border-t border-border">
          <div className="flex gap-2 relative">
            <Input 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to change code..."
              className="bg-muted border-none pr-10 focus-visible:ring-blue-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
              disabled={isAiProcessing}
            />
            <Button 
              size="icon"
              className="absolute right-1 top-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0" 
              onClick={handleChat}
              disabled={!aiPrompt.trim() || isAiProcessing}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Code Editor Side */}
      <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-[#1d1f21] h-full shadow-lg">
        <div className="flex items-center justify-between p-3 bg-[#131415] border-b border-[#2d2f31]">
          <div className="flex items-center gap-2 text-white/80 font-mono text-sm">
            <Code className="w-4 h-4" /> resume.tex
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 bg-transparent text-white border-white/20 hover:bg-white/10" onClick={handleDownloadTex}>
              <Download className="w-3 h-3 mr-2" /> .tex
            </Button>
            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleCompile(code)} disabled={isCompiling || isAiProcessing}>
              {isCompiling ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-2" /> Compile PDF
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => Prism.highlight(code, Prism.languages.latex, 'latex')}
            padding={16}
            className="font-mono text-sm min-h-full"
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              backgroundColor: '#1d1f21',
              color: '#c5c8c6',
            }}
          />
        </div>
      </div>

      {/* 3. PDF Viewer Side */}
      <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-muted/20 h-full shadow-lg">
        <div className="p-3 bg-muted border-b border-border text-sm font-semibold text-muted-foreground">
          PDF Output
        </div>
        <div className="flex-1 relative w-full h-full bg-[#525659] flex items-center justify-center">
          {pdfUrl ? (
            <object 
              data={pdfUrl} 
              type="application/pdf" 
              className="w-full h-full"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-white">
                <p>Your browser doesn't support embedded PDFs.</p>
                <a href={pdfUrl} download="resume.pdf">
                  <Button variant="secondary">Download PDF Instead</Button>
                </a>
              </div>
            </object>
          ) : isCompiling ? (
            <div className="flex flex-col items-center gap-4 text-white/70">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="animate-pulse">Compiling on remote server...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/50">
              <Play className="w-12 h-12 mb-2 opacity-50" />
              <p>Click "Compile PDF" to generate the document</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
