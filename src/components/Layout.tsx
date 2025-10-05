import { ReactNode, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { AccessibilitySidebar } from './AccessibilitySidebar';
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

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <TopNavigation />
      
      <div className="flex flex-1">
        <div className="hidden md:block fixed left-0 top-16 bottom-16 z-30">
          <CollapsibleSidebar />
        </div>
        <div className="hidden md:block fixed right-0 top-16 bottom-0 z-20">
          <AccessibilitySidebar />
        </div>
        
        <MobileSidebar />
        
        <main 
          className={`flex-1 transition-all duration-300 pt-16 overflow-x-hidden mobile-content ${
            sidebarExpanded 
              ? 'md:ml-[280px] md:mr-[60px]' 
              : 'md:ml-[60px] md:mr-[60px]'
          }`}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('collapseSidebar'));
          }}
        >
          {children || <Outlet />}
        </main>
      </div>
      
      <Footer />
      <Chatbot />
      <KeyboardShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
};
