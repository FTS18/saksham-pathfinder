import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertTriangle } from 'lucide-react';

export default function EmailNotification() {
  return (
    <Alert className="mb-4">
      <Mail className="h-4 w-4" />
      <AlertDescription>
        📧 <strong>Important:</strong> Check your <strong>spam/junk folder</strong> if you don't receive emails from us. 
        Add <strong>noreply@saksham-ai.com</strong> to your contacts to ensure delivery.
      </AlertDescription>
    </Alert>
  );
}