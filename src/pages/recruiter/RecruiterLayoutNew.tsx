import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RecruiterTopNav } from '@/components/recruiter/RecruiterTopNav';
import { RecruiterSidebar } from '@/components/recruiter/RecruiterSidebar';
import { Menu } from 'lucide-react';

export const RecruiterLayoutNew: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <RecruiterTopNav />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden pt-14 md:pt-16">
        {/* Left Sidebar - Fixed Expanded */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto">
          <RecruiterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
          <Outlet />
        </main>

        {/* Right Sidebar - Icons Only (Reserved for future use) */}
        <aside className="hidden lg:flex lg:flex-col w-20 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 items-center py-4 gap-4">
          {/* Right sidebar icons can be added here */}
          <div className="text-gray-400 text-xs text-center">More tools coming</div>
        </aside>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-xl z-40 overflow-y-auto pt-20">
            <RecruiterSidebar />
          </aside>
        </>
      )}
    </div>
  );
};
