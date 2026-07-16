import { useState } from 'react';
import { Eye, MessageCircle, Calendar, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Application {
  id: string;
  candidateName: string;
  position: string;
  smartScore: number;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  resumeUrl?: string;
  email: string;
}

interface ApplicationsTableProps {
  applications: Application[];
  onStatusChange: (id: string, status: Application['status']) => void;
  onViewResume: (application: Application) => void;
  onMessage: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
}

export const ApplicationsTable = ({
  applications,
  onStatusChange,
  onViewResume,
  onMessage,
  onScheduleInterview
}: ApplicationsTableProps) => {
  const [filter, setFilter] = useState<'all' | Application['status']>('all');
  const [sortBy, setSortBy] = useState<'smartScore' | 'appliedDate'>('smartScore');

  const filteredApplications = applications
    .filter(app => filter === 'all' || app.status === filter)
    .sort((a, b) => {
      if (sortBy === 'smartScore') return b.smartScore - a.smartScore;
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">
            Applications ({filteredApplications.length})
          </h3>
          
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
            >
              <option value="smartScore">Smart Score</option>
              <option value="appliedDate">Applied Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Smart Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Applied Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredApplications.map((application) => (
              <tr key={application.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {application.candidateName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {application.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${getScoreColor(application.smartScore)}`}>
                    {application.smartScore}/100
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={application.status}
                    onChange={(e) => onStatusChange(application.id, e.target.value as Application['status'])}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(application.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(application.appliedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewResume(application)}
                      className="p-1"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMessage(application)}
                      className="p-1"
                    >
                      <MessageCircle size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onScheduleInterview(application)}
                      className="p-1"
                    >
                      <Calendar size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplications.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No applications found for the selected filter.
        </div>
      )}
    </div>
  );
};