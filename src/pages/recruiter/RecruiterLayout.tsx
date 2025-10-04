import { Outlet } from 'react-router-dom';
import { RecruiterTopNavigation } from '@/components/recruiter/RecruiterTopNavigation';
import { RecruiterSidebar } from '@/components/recruiter/RecruiterSidebar';
import { useState, useEffect } from 'react';

export const RecruiterLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = () => {
      setSidebarExpanded(prev => !prev);
    };
    
    const handleSidebarCollapse = () => {
      setSidebarExpanded(false);
    };
    
    window.addEventListener('toggleRecruiterSidebar', handleSidebarToggle);
    window.addEventListener('collapseRecruiterSidebar', handleSidebarCollapse);
    
    return () => {
      window.removeEventListener('toggleRecruiterSidebar', handleSidebarToggle);
      window.removeEventListener('collapseRecruiterSidebar', handleSidebarCollapse);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RecruiterTopNavigation />
      
      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <div className="hidden md:block fixed left-0 top-16 bottom-0 z-30">
          <RecruiterSidebar />
        </div>
        
        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarExpanded ? 'md:ml-[280px]' : 'md:ml-[60px]'
          }`}
          onClick={() => window.dispatchEvent(new CustomEvent('collapseRecruiterSidebar'))}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};