import { Outlet } from 'react-router-dom';
import { RecruiterTopNavigation } from '@/components/recruiter/RecruiterTopNavigation';
import { RecruiterSidebar } from '@/components/recruiter/RecruiterSidebar';

export const RecruiterLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Top Navigation - hidden on mobile */}
      <div className="hidden md:block">
        <RecruiterTopNavigation />
      </div>
      
      <div className="flex flex-1 pt-0 md:pt-16">
        {/* Sidebar - handles mobile header with hamburger + desktop sidebar */}
        <RecruiterSidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* pt-16 on mobile for sidebar header, pt-0 on desktop */}
          <div className="pt-16 md:pt-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};