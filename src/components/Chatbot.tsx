import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageCircle, Send, X, Bot, User, Minimize2, Sparkles, HelpCircle, Sidebar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useChatbot } from '@/hooks/useChatbot';
import { quickActions } from '@/lib/gemini';
import { cn } from '@/lib/utils';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [input, setInput] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const { messages, isLoading, sendMessage, generateInterviewQuestions } = useChatbot();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    setShowQuickActions(false);
    await sendMessage(message);
  };

  const handleQuickAction = async (prompt: string) => {
    setShowQuickActions(false);
    await sendMessage(prompt);
  };

  const handleInterviewQuestions = async (role: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setShowQuickActions(false);
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
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="icon"
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
    if (isMobile) return "fixed inset-0 z-50 bg-background";
    if (isSidebar) return "fixed top-0 right-0 h-full w-96 z-40 bg-background border-l shadow-xl";
    return "fixed bottom-6 right-6 w-96 h-[600px] shadow-xl z-50 bg-background border rounded-lg";
  };

  return (
    <TooltipProvider>
      {isSidebar && !isMobile && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
      <div className={getChatContainerClass()}>
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-muted border'
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {showQuickActions && messages.length <= 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.prompt)}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <span className="text-xs">{action.label}</span>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about internships, get career advice, or practice interviews..."
              disabled={isLoading}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};