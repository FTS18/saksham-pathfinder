import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const translations = {
  en: {
    title: 'Share Your Feedback',
    subtitle: 'Help us improve your experience',
    helpful: 'Was this helpful?',
    placeholder: 'Tell us more about your experience...',
    submit: 'Submit Feedback',
    thanks: 'Thank you for your feedback!',
    positive: 'Yes, helpful',
    negative: 'Needs improvement'
  },
  hi: {
    title: 'अपनी फीडबैक साझा करें',
    subtitle: 'अपने अनुभव को बेहतर बनाने में हमारी सहायता करें',
    helpful: 'क्या यह सहायक था?',
    placeholder: 'अपने अनुभव के बारे में और बताएं...',
    submit: 'फीडबैक भेजें',
    thanks: 'आपकी फीडबैक के लिए धन्यवाद!',
    positive: 'हाँ, सहायक',
    negative: 'सुधार की जरूरत'
  }
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // e.g., "internship_recommendation", "profile_form"
}

export const FeedbackModal = ({ isOpen, onClose, context }: FeedbackModalProps) => {
  const { language } = useTheme();
  const { toast } = useToast();
  const t = translations[language];
  
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store feedback locally for demo
    const feedback = {
      rating,
      comment,
      context,
      timestamp: new Date().toISOString()
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('feedback', JSON.stringify(existingFeedback));

    toast({
      title: t.thanks,
      description: "Your input helps us improve our recommendations.",
    });

    setIsSubmitting(false);
    setRating(null);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-semibold text-foreground">
            {t.title}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {t.subtitle}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              {t.helpful}
            </label>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant={rating === 'positive' ? 'default' : 'outline'}
                onClick={() => setRating('positive')}
                className={`flex-1 flex items-center justify-center space-x-2 ${
                  rating === 'positive' 
                    ? 'bg-success hover:bg-success/90 text-white' 
                    : 'hover:bg-success/10 hover:text-success hover:border-success'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{t.positive}</span>
              </Button>
              
              <Button
                type="button"
                variant={rating === 'negative' ? 'default' : 'outline'}
                onClick={() => setRating('negative')}
                className={`flex-1 flex items-center justify-center space-x-2 ${
                  rating === 'negative' 
                    ? 'bg-destructive hover:bg-destructive/90 text-white' 
                    : 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{t.negative}</span>
              </Button>
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-2">
            <Textarea
              placeholder={t.placeholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none bg-background/50 border-border focus:border-primary"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!rating || isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>{t.submit}</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};