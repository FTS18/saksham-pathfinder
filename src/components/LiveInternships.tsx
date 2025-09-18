import { useState, useEffect } from 'react';
import { fetchAllInternships } from '@/lib/jobApi';
import { InternshipCard } from './InternshipCard';

interface LiveInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  url: string;
  posted_date: string;
}

export const LiveInternships = () => {
  const [internships, setInternships] = useState<LiveInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInternships = async () => {
      try {
        const data = await fetchAllInternships();
        setInternships(data);
      } catch (err) {
        setError('Failed to load live internships');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <p className="text-gray-600 mt-2">Showing static internships instead</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Internships</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          {internships.length} Live Openings
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <div key={internship.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">{internship.title}</h3>
            <p className="text-gray-600 mb-1">{internship.company}</p>
            <p className="text-gray-500 text-sm mb-2">{internship.location}</p>
            {internship.salary && (
              <p className="text-green-600 font-medium mb-2">{internship.salary}</p>
            )}
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{internship.description}</p>
            <a 
              href={internship.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
            >
              Apply Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};