import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageCircle, Send, X, Bot, User, Minimize2, Sparkles, HelpCircle, Sidebar, ExternalLink, Search, FileText, Heart, Briefcase, BookOpen, Activity, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useChatbot } from '@/hooks/useChatbot';
import { localAIService, quickActions } from '@/lib/localAI';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [input, setInput] = useState('');
  const [autosuggestions, setAutosuggestions] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { messages, isLoading, sendMessage, generateInterviewQuestions } = useChatbot();
  const { colorTheme } = useTheme();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const debouncedInput = useDebounce(input, 500);
  const [width, setWidth] = useState(384);
  const navigate = useNavigate();

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      if (newWidth >= 300 && newWidth <= 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [width]);

  useEffect(() => {
    if (debouncedInput) {
      localAIService.generateAutosuggestions(debouncedInput).then(setAutosuggestions);
    } else {
      setAutosuggestions([]);
    }
  }, [debouncedInput]);

  useEffect(() => {
    const openChatbot = () => setIsOpen(true);
    window.addEventListener('openChatbot', openChatbot);
    
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };
    
    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('openChatbot', openChatbot);
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);
  
  const getThemeGradient = () => {
    switch (colorTheme) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'grey': return 'from-gray-500 to-gray-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'yellow': return 'from-yellow-500 to-yellow-600';
      case 'green': return 'from-green-500 to-green-600';
      default: return 'from-blue-500 to-purple-600';
    }
  };
  
  const getThemeHoverGradient = () => {
    switch (colorTheme) {
      case 'blue': return 'hover:from-blue-600 hover:to-blue-700';
      case 'grey': return 'hover:from-gray-600 hover:to-gray-700';
      case 'red': return 'hover:from-red-600 hover:to-red-700';
      case 'yellow': return 'hover:from-yellow-600 hover:to-yellow-700';
      case 'green': return 'hover:from-green-600 hover:to-green-700';
      default: return 'hover:from-blue-600 hover:to-purple-700';
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    setAutosuggestions([]);
    setShowQuickActions(false);
    
    // Check for navigation commands
    const navigationResult = handleNavigationCommand(message);
    if (navigationResult) {
      return;
    }
    
    await sendMessage(message);
  };
  
  const handleNavigationCommand = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    // Navigation patterns
    const patterns = [
      { pattern: /show.*internships?.*(in|at|from)\s+([\w\s]+)/i, type: 'company', group: 2 },
      { pattern: /internships?.*(in|at)\s+([\w\s]+)/i, type: 'city', group: 2 },
      { pattern: /show.*([\w\s]+)\s+internships?/i, type: 'skill', group: 1 },
      { pattern: /(find|show|search).*internships?.*(with|having|for)\s+([\w\s]+)/i, type: 'skill', group: 3 },
      { pattern: /internships?.*(sector|field|domain)\s+([\w\s]+)/i, type: 'sector', group: 2 },
      { pattern: /([\w\s]+)\s+(internships?|jobs?)/i, type: 'title', group: 1 }
    ];
    
    for (const { pattern, type, group } of patterns) {
      const match = message.match(pattern);
      if (match && match[group]) {
        const rawValue = match[group].trim();
        
        // Proper URL encoding for different types
        let encodedValue: string;
        if (type === 'company') {
          // For companies, replace spaces with dashes and lowercase
          encodedValue = rawValue.replace(/\s+/g, '-').toLowerCase();
        } else if (type === 'city') {
          // For cities, replace spaces with dashes and lowercase
          encodedValue = rawValue.replace(/\s+/g, '-').toLowerCase();
        } else {
          // For skills, sectors, titles - use URL encoding
          encodedValue = encodeURIComponent(rawValue.toLowerCase());
        }
        
        const route = `/${type}/${encodedValue}`;
        
        // Send confirmation message
        const confirmationMessage = {
          id: Date.now().toString(),
          role: 'assistant' as const,
          content: ` **Navigating to ${type} page**\n\nTaking you to ${type === 'city' ? 'internships in' : type === 'company' ? 'internships at' : type === 'skill' ? 'internships requiring' : type === 'sector' ? 'internships in' : ''} **${rawValue}**...\n\n*You'll be redirected in a moment!*`,
          timestamp: new Date(),
          suggestions: [
            'Show me more filters',
            'Help me compare internships',
            'Back to search tips'
          ]
        };
        
        // Add message to chat
        window.dispatchEvent(new CustomEvent('addChatMessage', { detail: confirmationMessage }));
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate(route);
          setIsOpen(false);
        }, 1500);
        
        return true;
      }
    }
    
    return false;
  };

  const handleQuickAction = async (prompt: string) => {
    setShowQuickActions(false);
    setAutosuggestions([]);
    await sendMessage(prompt);
  };

  const handleInterviewQuestions = async (role: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setShowQuickActions(false);
    setAutosuggestions([]);
    await generateInterviewQuestions(role, difficulty);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !isMobile) {
      setIsSidebar(true);
    }
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleChatbot}
              className={`fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-2xl z-[9999] bg-gradient-to-r ${getThemeGradient()} ${getThemeHoverGradient()} hover:scale-110 transition-all duration-200`}
              size="icon"
              data-chatbot-trigger
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Open AI Career Assistant
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getChatContainerClass = () => {
    if (isMobile) return "fixed inset-0 z-[9999] bg-background";
    if (isSidebar) return "fixed top-0 right-0 h-full w-[420px] z-[9998] bg-background border-l shadow-2xl";
    return "fixed bottom-4 right-4 w-[400px] h-[650px] shadow-2xl z-[9999] bg-background border rounded-xl";
  };

  const getActionIcon = (id: string) => {
    switch (id) {
      case 'search': return <Search className="h-4 w-4 text-blue-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'resume': return <FileText className="h-4 w-4 text-amber-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'interview': return <HelpCircle className="h-4 w-4 text-emerald-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'skills': return <BookOpen className="h-4 w-4 text-violet-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'profile': return <User className="h-4 w-4 text-indigo-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'wishlist': return <Heart className="h-4 w-4 text-rose-500 mr-2.5 shrink-0 fill-rose-500/10 group-hover:scale-110 transition-transform duration-200" />;
      case 'applications': return <Briefcase className="h-4 w-4 text-sky-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      case 'compare': return <Activity className="h-4 w-4 text-teal-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />;
      default: return <Sparkles className="h-4 w-4 text-primary mr-2.5 shrink-0" />;
    }
  };

  return (
    <TooltipProvider>
      {isSidebar && !isMobile && <div className="fixed inset-0 bg-black/30 z-[9997]" onClick={() => setIsOpen(false)} />}
      <div className={cn(
        getChatContainerClass(),
        "flex flex-col border border-border/80 bg-background/95 backdrop-blur-md transition-all duration-200 overflow-hidden"
      )}>
        {/* Professional Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getThemeGradient()} flex items-center justify-center shadow-md shadow-primary/10`}>
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground tracking-tight">UpSkillers</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI Career Co-Pilot
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebar(!isSidebar)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    {isSidebar ? <Minimize2 className="h-4 w-4" /> : <Sidebar className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSidebar ? 'Switch to popup mode' : 'Switch to sidebar mode'}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Close chat
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messaging Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} style={{ height: isMobile || isSidebar ? 'calc(100vh - 140px)' : 'calc(100% - 140px)' }}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-full",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getThemeGradient()} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.role === 'user'
                      ? `bg-gradient-to-tr ${getThemeGradient()} text-white`
                      : 'bg-muted/50 border border-border/40 text-foreground'
                  )}
                >
                  <div 
                    className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/&#39;/g, "'")
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary font-medium hover:underline inline-flex items-center gap-0.5">$1<svg class="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
                    }}
                  />
                  {message.role === 'assistant' && message.suggestions && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Suggested Questions</div>
                        <button
                          onClick={() => setShowQuickActions(true)}
                          className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          ← Back to menu
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(suggestion)}
                            className="text-xs text-left px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted border flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="h-4 w-4 text-foreground/80" />
                  </div>
                )}
              </div>
            ))}
            
            {showQuickActions && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Quick Tools</span>
                  </div>
                  {messages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(false)}
                      className="text-xs text-muted-foreground hover:text-foreground h-6 px-1.5"
                    >
                      Hide
                    </Button>
                  )}
                </div>
                
                {/* Premium Card Tiles */}
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (action.action) {
                          action.action(navigate);
                          setIsOpen(false);
                        } else {
                          handleQuickAction(action.prompt);
                          setShowQuickActions(false);
                        }
                      }}
                      className="flex items-center w-full text-left p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 group"
                    >
                      {getActionIcon(action.id)}
                      <span className="text-xs font-medium text-foreground tracking-tight select-none">
                        {action.label.replace(/[❤️⚖️]/g, '').trim()}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
                
                {/* Interview Practice Selection */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Interview Simulator</span>
                  </div>
                  <div className="w-full">
                    <Select onValueChange={(value) => {
                      const [role, difficulty] = value.split('|');
                      handleInterviewQuestions(role, difficulty as 'easy' | 'medium' | 'hard');
                    }}>
                      <SelectTrigger className="w-full rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors py-5 text-xs text-foreground font-medium">
                        <SelectValue placeholder="Select topic & start practice..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Software Developer|easy">💻 Software Dev (Easy)</SelectItem>
                        <SelectItem value="Software Developer|medium">💻 Software Dev (Medium)</SelectItem>
                        <SelectItem value="Software Developer|hard">💻 Software Dev (Hard)</SelectItem>
                        <SelectItem value="Data Analyst|easy">📊 Data Analyst (Easy)</SelectItem>
                        <SelectItem value="Data Analyst|medium">📊 Data Analyst (Medium)</SelectItem>
                        <SelectItem value="Marketing|easy">📈 Marketing (Easy)</SelectItem>
                        <SelectItem value="Marketing|medium">📈 Marketing (Medium)</SelectItem>
                        <SelectItem value="Design|easy">🎨 Design (Easy)</SelectItem>
                        <SelectItem value="Design|medium">🎨 Design (Medium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${getThemeGradient()} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Command Bar Unified Input */}
        <div className="p-4 border-t bg-background/95 backdrop-blur-md">
          {autosuggestions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {autosuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                    setAutosuggestions([]);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors select-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="relative flex items-center bg-muted/40 border border-border/80 rounded-2xl px-2 py-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={cn(
                "h-8 w-8 rounded-lg flex-shrink-0 text-muted-foreground hover:text-primary transition-all duration-200",
                showQuickActions && "text-primary bg-primary/10"
              )}
              title="Toggle quick actions menu"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything or try 'Show Google internships'..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm px-3.5 placeholder:text-muted-foreground/50 text-foreground disabled:opacity-50"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg flex-shrink-0 transition-all duration-200",
                input.trim() 
                  ? `bg-gradient-to-tr ${getThemeGradient()} ${getThemeHoverGradient()} text-white scale-100` 
                  : "bg-muted text-muted-foreground scale-95"
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};