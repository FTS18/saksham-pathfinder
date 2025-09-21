import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { GitCompare } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import { ComparisonModal } from './ComparisonModal';

interface ComparisonButtonProps {
  userProfile?: any;
}

export const ComparisonButton = ({ userProfile }: ComparisonButtonProps) => {
  const { selectedInternships } = useComparison();
  const [showModal, setShowModal] = useState(false);

  if (selectedInternships.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={() => setShowModal(true)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-3 text-base font-semibold"
          size="lg"
        >
          <GitCompare className="w-5 h-5 mr-2" />
          Compare ({selectedInternships.length})
          {selectedInternships.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-red-500 text-white border-0 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {selectedInternships.length}
            </Badge>
          )}
        </Button>
      </div>

      <ComparisonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userProfile={userProfile}
      />
    </>
  );
};