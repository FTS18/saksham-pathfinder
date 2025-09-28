import { useState } from 'react';
import { Button } from './ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { deleteUserAccount } from '@/services/accountDeletion';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

export const DeleteAccountButton = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUserAccount(currentUser.uid);
      toast({
        title: 'Account Deleted',
        description: 'Your account and all data have been permanently deleted.',
      });
      await logout();
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data including:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Profile information</li>
              <li>Application history</li>
              <li>Referral data</li>
              <li>Saved internships</li>
              <li>All uploaded files</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Forever'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};