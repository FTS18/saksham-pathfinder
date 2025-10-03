import { useState } from 'react';
import { InternshipDetailsModal } from './InternshipDetailsModal';

interface InternshipModalProps {
  internships: any[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

export const InternshipModal = ({
  internships,
  currentIndex,
  isOpen,
  onClose,
  userProfile
}: InternshipModalProps) => {
  const [modalIndex, setModalIndex] = useState(currentIndex);

  const handleNext = () => {
    if (modalIndex < internships.length - 1) {
      setModalIndex(modalIndex + 1);
    }
  };

  const handlePrev = () => {
    if (modalIndex > 0) {
      setModalIndex(modalIndex - 1);
    }
  };

  const currentInternship = internships[modalIndex];
  if (!currentInternship) return null;

  return (
    <InternshipDetailsModal
      internship={currentInternship.internship || currentInternship}
      isOpen={isOpen}
      onClose={onClose}
      matchExplanation={currentInternship.explanation}
      userProfile={userProfile}
      onNext={modalIndex < internships.length - 1 ? handleNext : undefined}
      onPrev={modalIndex > 0 ? handlePrev : undefined}
      currentIndex={modalIndex}
      totalCount={internships.length}
    />
  );
};