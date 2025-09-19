import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, User, Lightbulb, MessageCircle, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'career' | 'interview' | 'skill' | 'support';
}

const AIAssistant = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI Career Assistant. I can help you with career guidance, interview preparation, skill recommendations, and platform navigation. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'support'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { text: "Career guidance for tech roles", type: "career", icon: Lightbulb },
    { text: "Mock interview questions", type: "interview", icon: MessageCircle },
    { text: "Skill learning path", type: "skill", icon: BookOpen },
    { text: "Platform help", type: "support", icon: Bot }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string, type?: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Career guidance responses
    if (type === 'career' || lowerMessage.includes('career') || lowerMessage.includes('guidance')) {
      const careerResponses = [
        "Based on current market trends, here are some high-demand career paths:\n\n🚀 **Technology**: Full-stack development, AI/ML, cybersecurity, cloud computing\n\n💼 **Business**: Product management, digital marketing, data analysis\n\n🎨 **Creative**: UI/UX design, content creation, digital marketing\n\nWhich field interests you most? I can provide specific guidance!",
        "For a successful tech career:\n\n1. **Build a strong foundation** in programming fundamentals\n2. **Create projects** to showcase your skills\n3. **Network actively** through LinkedIn and tech communities\n4. **Stay updated** with latest technologies\n5. **Practice coding** regularly on platforms like LeetCode\n\nWhat specific tech role are you targeting?",
        "Career growth tips:\n\n✅ **Set clear goals** - Define where you want to be in 2-5 years\n✅ **Continuous learning** - Take online courses, attend workshops\n✅ **Seek mentorship** - Find experienced professionals in your field\n✅ **Build your brand** - Maintain an active LinkedIn profile\n✅ **Take on challenges** - Volunteer for difficult projects\n\nNeed help with any specific area?"
      ];
      return careerResponses[Math.floor(Math.random() * careerResponses.length)];
    }
    
    // Interview preparation responses
    if (type === 'interview' || lowerMessage.includes('interview') || lowerMessage.includes('mock')) {
      const interviewResponses = [
        "Here are common interview questions to practice:\n\n**Behavioral Questions:**\n• Tell me about yourself\n• Why do you want this role?\n• Describe a challenge you overcame\n• Where do you see yourself in 5 years?\n\n**Technical Questions:**\n• Explain your recent project\n• How do you handle debugging?\n• What's your development process?\n\nWould you like me to ask you a mock question?",
        "**Interview Preparation Checklist:**\n\n📋 **Before Interview:**\n• Research the company thoroughly\n• Practice common questions\n• Prepare your own questions\n• Test your tech setup (for virtual interviews)\n\n💼 **During Interview:**\n• Arrive 10 minutes early\n• Maintain eye contact\n• Use STAR method for behavioral questions\n• Ask thoughtful questions\n\nNeed help with any specific aspect?",
        "**Mock Interview Question:**\n\n*\"Tell me about a time when you had to learn a new technology quickly for a project. How did you approach it?\"*\n\n**Tips for answering:**\n• Use the STAR method (Situation, Task, Action, Result)\n• Be specific about the technology and timeline\n• Highlight your learning process\n• Mention the positive outcome\n\nWant to practice your answer?"
      ];
      return interviewResponses[Math.floor(Math.random() * interviewResponses.length)];
    }
    
    // Skill recommendations
    if (type === 'skill' || lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      const skillResponses = [
        "**Trending Skills for 2024:**\n\n🔥 **High Demand:**\n• Python & JavaScript\n• React & Node.js\n• Cloud platforms (AWS, Azure)\n• Data Science & AI/ML\n• Cybersecurity\n\n📈 **Emerging:**\n• Blockchain development\n• IoT programming\n• DevOps & containerization\n• Mobile app development\n\nWhich area interests you most?",
        "**Learning Path Recommendation:**\n\n**For Web Development:**\n1. HTML, CSS, JavaScript (2-3 months)\n2. React or Vue.js (1-2 months)\n3. Node.js & databases (1-2 months)\n4. Build 3-5 projects\n5. Deploy and showcase your work\n\n**Resources:**\n• FreeCodeCamp, MDN Web Docs\n• YouTube tutorials\n• Practice on CodePen\n\nNeed a customized learning plan?",
        "**Skill Development Tips:**\n\n🎯 **Focus on fundamentals** first\n🏗️ **Build projects** while learning\n👥 **Join communities** (Discord, Reddit)\n📚 **Use multiple resources** (videos, docs, courses)\n⏰ **Practice daily** - consistency is key\n🔄 **Get feedback** from experienced developers\n\nWhat skill would you like to start with?"
      ];
      return skillResponses[Math.floor(Math.random() * skillResponses.length)];
    }
    
    // Platform support
    if (type === 'support' || lowerMessage.includes('help') || lowerMessage.includes('how')) {
      const supportResponses = [
        "**Platform Navigation Help:**\n\n🏠 **Dashboard**: View personalized internship recommendations\n🔍 **Search**: Filter internships by location, stipend, skills\n❤️ **Wishlist**: Save interesting internships for later\n📊 **Analytics**: Track your application progress\n⚙️ **Settings**: Update profile and preferences\n\nWhat specific feature do you need help with?",
        "**How to Find Better Matches:**\n\n1. **Complete your profile** with accurate skills and preferences\n2. **Update your location** and desired work location\n3. **Set realistic stipend expectations**\n4. **Add relevant skills** from your experience\n5. **Use filters** to narrow down results\n\nYour match score will improve as you complete more profile details!",
        "**Application Tips:**\n\n✅ **Customize your application** for each internship\n✅ **Highlight relevant skills** mentioned in the job description\n✅ **Write a compelling cover letter**\n✅ **Follow up** after 1-2 weeks\n✅ **Keep track** of your applications in the dashboard\n\nNeed help with any specific application?"
      ];
      return supportResponses[Math.floor(Math.random() * supportResponses.length)];
    }
    
    // General responses
    const generalResponses = [
      "I'm here to help with your career journey! I can assist with:\n\n🎯 Career guidance and planning\n🎤 Interview preparation\n📚 Skill development recommendations\n🛠️ Platform navigation help\n\nWhat would you like to explore?",
      "That's a great question! Let me help you with that. Could you be more specific about what you'd like to know? I'm here to assist with career advice, interview prep, learning paths, or platform features.",
      "I'd be happy to help! For the best assistance, try asking about:\n\n• Career paths in specific fields\n• Interview preparation tips\n• Skill learning recommendations\n• How to use platform features\n\nWhat interests you most?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSendMessage = async (message: string, type?: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(message, type),
        sender: 'bot',
        timestamp: new Date(),
        type: type as any
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: any) => {
    handleSendMessage(action.text, action.type);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'career': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'interview': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'skill': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'support': return <Bot className="w-4 h-4 text-purple-500" />;
      default: return <Bot className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen hero-gradient pt-16 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-racing font-bold mb-2">AI Career Assistant</h1>
          <p className="text-muted-foreground">Your 24/7 career guidance companion</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Features Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-sm">Career Counselor</p>
                      <p className="text-xs text-muted-foreground">AI-powered guidance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">Interview Prep</p>
                      <p className="text-xs text-muted-foreground">Mock questions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">Skill Recommendations</p>
                      <p className="text-xs text-muted-foreground">Learning paths</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">24/7 Support</p>
                      <p className="text-xs text-muted-foreground">Instant help</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="glass-card h-[70vh] lg:h-[600px] flex flex-col relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.sender === 'bot' && getMessageIcon(message.type)}
                          <div className="flex-1 min-w-0">
                            <div className="whitespace-pre-wrap text-sm break-words">{message.text}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="mb-4 flex-shrink-0">
                  <p className="text-sm text-muted-foreground mb-2">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                        className="text-xs flex-shrink-0"
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{action.text}</span>
                        <span className="sm:hidden">{action.text.split(' ')[0]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-2 flex-shrink-0">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    className="flex-1 min-w-0"
                  />
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;