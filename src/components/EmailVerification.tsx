import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { sendEmailVerification, User, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

interface EmailVerificationProps {
  user: User;
  onVerified: () => void;
}

export const EmailVerification = ({ user, onVerified }: EmailVerificationProps) => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const sendVerification = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email and click the verification link.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  const checkVerification = async () => {
    setIsChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        toast({
          title: 'Email Verified!',
          description: 'Your email has been successfully verified.'
        });
        onVerified();
      } else {
        toast({
          title: 'Not Verified Yet',
          description: 'Please check your email and click the verification link.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check verification status.',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>We've sent a verification link to:</p>
            <p className="font-medium text-foreground mt-1">{user.email}</p>
            <p className="text-xs mt-2">Wrong email? You can logout and register again.</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={checkVerification} 
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendVerification} 
              disabled={isResending}
              className="w-full"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => signOut(auth)}
              className="w-full text-muted-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout & Use Different Email
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>📧 <strong>Check your spam/junk folder</strong> if you don't see the email</p>
            <p>Add <strong>noreply@saksham-pathfinder.com</strong> to your contacts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};