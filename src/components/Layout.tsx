import { ReactNode, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { MobileSidebar } from './MobileSidebar';
import { TopNavigation } from './TopNavigation';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardShortcuts({
    onToggleSidebar: () => {
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    },
    onShowHelp: () => setShowShortcuts(true),
  });

  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarExpanded(e.detail.expanded);
    };
    
    const controller = new AbortController();
    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener, {
      signal: controller.signal
    });
    
    return () => controller.abort();
  }, []);

  const [chatbotActive, setChatbotActive] = useState(false);

  useEffect(() => {
    const handleChatbotState = (e: CustomEvent) => {
      const { isOpen, isSidebar } = e.detail;
      setChatbotActive(isOpen && isSidebar);
    };
    
    window.addEventListener('chatbotStateChange', handleChatbotState as EventListener);
    return () => {
      window.removeEventListener('chatbotStateChange', handleChatbotState as EventListener);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background dark:bg-[#05050A] flex overflow-hidden z-0">
      {/* Global Ambient Background Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 dark:bg-blue-600/40 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-primary/20 dark:bg-primary/40 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/15 dark:bg-purple-600/30 blur-[100px] pointer-events-none -z-10" />
      
      {/* Fixed Sidebar */}
      <div className={`hidden md:block fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out overflow-hidden border-r ${
        sidebarExpanded 
          ? 'w-[280px] bg-transparent border-transparent'
          : 'w-[80px] hover:w-[280px] group bg-transparent hover:bg-background/95 hover:backdrop-blur-xl hover:shadow-[10px_0_30px_-15px_rgba(0,0,0,0.5)] border-transparent hover:border-border/50'
      }`}>
        <CollapsibleSidebar 
          isExpanded={sidebarExpanded} 
          onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
        />
      </div>
      <MobileSidebar />
      
      {/* App Shell Wrapper — fixed-positioned to exactly fill viewport with margins */}
      <div className={`fixed top-0 bottom-0 flex flex-col md:top-3 md:bottom-3 md:rounded-3xl bg-background dark:bg-background/80 dark:supports-[backdrop-filter]:bg-background/60 dark:backdrop-blur-3xl z-10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(99,102,241,0.12)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-black/10 dark:border-primary/30 transform-gpu origin-right ${
        sidebarExpanded ? 'left-0 md:left-[292px] md:scale-[0.97] md:rounded-[2.5rem]' : 'left-0 md:left-[92px] md:scale-100'
      } ${
        chatbotActive ? 'right-0 md:right-[432px]' : 'right-0 md:right-3'
      }`}>
        <TopNavigation />
        
        <main 
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/10 hover:[&::-webkit-scrollbar-thumb]:bg-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('collapseSidebar'));
          }}
        >
          <div key={location.pathname} className="mobile-content min-h-full flex flex-col pt-0 animate-page-entry">
            {children || <Outlet />}
            <Footer />
          </div>
        </main>
      </div>
      
      <Chatbot />
      <KeyboardShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
};
