import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const RecruiterTopNav: React.FC = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recruiter/manage-internships?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-50 items-center px-6 gap-8">
        {/* Logo */}
        <Link to="/recruiter/dashboard" className="flex items-center gap-2 min-w-fit">
          <img src="/logo.webp" alt="Saksham AI" className="h-8 w-auto" />
          <span className="text-lg font-bold text-gray-900 dark:text-white hidden lg:block">
            Saksham AI
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search jobs, skills, candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Post Job Button */}
          <Link to="/recruiter/post-job">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post Job
            </Button>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.displayName || 'Recruiter'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.email}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 z-50 flex items-center px-4 gap-3">
        <Link to="/recruiter/dashboard" className="flex items-center gap-2">
          <img src="/logo.webp" alt="Saksham AI" className="h-8 w-auto" />
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto p-2"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 space-y-3">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </form>
            <Link to="/recruiter/post-job" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Post Job
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16 md:h-16" />
    </>
  );
};
