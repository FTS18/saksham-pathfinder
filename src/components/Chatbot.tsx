import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageCircle, Send, X, Bot, User, Minimize2, Sparkles, HelpCircle, Sidebar, ExternalLink } from 'lucide-react';
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
          content: `🚀 **Navigating to ${type} page**\n\nTaking you to ${type === 'city' ? 'internships in' : type === 'company' ? 'internships at' : type === 'skill' ? 'internships requiring' : type === 'sector' ? 'internships in' : ''} **${rawValue}**...\n\n*You'll be redirected in a moment!*`,
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

  // Hide floating button on desktop
  if (!isOpen) {
    if (!isMobile) {
      return null;
    }
    
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

  return (
    <TooltipProvider>
      {isSidebar && !isMobile && <div className="fixed inset-0 bg-black/30 z-[9997]" onClick={() => setIsOpen(false)} />}
      <div className={getChatContainerClass()}>
        <div className={`flex items-center justify-between p-4 border-b bg-gradient-to-r ${colorTheme === 'blue' ? 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900' : colorTheme === 'grey' ? 'from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900' : colorTheme === 'red' ? 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900' : colorTheme === 'yellow' ? 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900' : colorTheme === 'green' ? 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900' : 'from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getThemeGradient()} flex items-center justify-center`}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Saksham AI</h3>
              <p className="text-sm text-muted-foreground">Your Career Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebar(!isSidebar)}
                    className="h-8 w-8"
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
                  className="h-8 w-8"
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
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getThemeGradient()} flex items-center justify-center flex-shrink-0`}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === 'user'
                      ? `bg-gradient-to-r ${getThemeGradient()} text-white`
                      : 'bg-muted border'
                  )}
                >
                  <div 
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/&#39;/g, "'")
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline inline-flex items-center gap-1">$1 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>')
                    }}
                  />
                  {message.role === 'assistant' && message.suggestions && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">💡 Follow-up questions:</div>
                        <button
                          onClick={() => setShowQuickActions(true)}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          ← Back to menu
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(suggestion)}
                            className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {showQuickActions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Quick Actions</span>
                  </div>
                  {messages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickActions(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Hide
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (action.action) {
                          action.action(navigate);
                          setIsOpen(false);
                        } else {
                          handleQuickAction(action.prompt);
                          setShowQuickActions(false);
                        }
                      }}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <span className="text-xs">{action.label}</span>
                      {action.action && <ExternalLink className="h-3 w-3 ml-1" />}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    <span>Interview Practice</span>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => {
                      const [role, difficulty] = value.split('|');
                      handleInterviewQuestions(role, difficulty as 'easy' | 'medium' | 'hard');
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Generate interview questions" />
                      </SelectTrigger>
                      <SelectContent>
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
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getThemeGradient()} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted border rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          {autosuggestions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {autosuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                    setAutosuggestions([]);
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="rounded-full flex-shrink-0"
              title="Toggle quick actions menu"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Try: 'Show Google internships' or 'Internships in Mumbai'..."
              disabled={isLoading}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className={`rounded-full bg-gradient-to-r ${getThemeGradient()} ${getThemeHoverGradient()}`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};