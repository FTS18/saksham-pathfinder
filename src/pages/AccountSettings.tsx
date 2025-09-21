import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateEmail, 
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Mail, Shield, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AccountSettings() {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSendVerification = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(currentUser);
      toast({
        title: "Verification email sent!",
        description: "Check your inbox and spam folder.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      toast({
        title: "Password reset email sent!",
        description: "Check your inbox for reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdateEmail = async () => {
    if (!currentUser || !newEmail || !currentPassword) return;
    setLoading(true);
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updateEmail(currentUser, newEmail);
      toast({
        title: "Email updated successfully!",
        description: "Please verify your new email address.",
      });
      setNewEmail('');
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentUser || !newPassword || !currentPassword || newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all fields and ensure passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      await updatePassword(currentUser, newPassword);
      toast({
        title: "Password updated successfully!",
      });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // For Google users, no password needed
      if (currentUser.providerData[0]?.providerId === 'password' && !currentPassword) {
        toast({
          title: "Error",
          description: "Password required for email/password accounts",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Reauthenticate if password user
      if (currentUser.providerData[0]?.providerId === 'password') {
        const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }
      
      // Delete user data from Firestore
      try {
        await deleteDoc(doc(db, 'profiles', currentUser.uid));
      } catch (firestoreError) {
        console.log('Firestore deletion error (continuing):', firestoreError);
      }
      
      // Clear localStorage
      localStorage.clear();
      
      // Delete user account
      await deleteUser(currentUser);
      
      toast({
        title: "Account deleted successfully",
        description: "All your data has been permanently removed.",
      });
      
      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete account',
        variant: "destructive",
      });
    }
    setLoading(false);
    setShowDeleteConfirm(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen hero-gradient pt-16 flex items-center justify-center">
        <p>Please log in to access account settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-racing font-bold text-foreground mb-8">Account Settings</h1>
        
        {/* Email Verification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current email: {currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {currentUser.emailVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500 text-sm">Not verified</span>
                    </>
                  )}
                </div>
              </div>
              {!currentUser.emailVerified && (
                <Button onClick={handleSendVerification} disabled={loading}>
                  Send Verification Email
                </Button>
              )}
            </div>
            {!currentUser.emailVerified && (
              <p className="text-xs text-muted-foreground">
                📧 Check your spam/junk folder if you don't see the email in your inbox
              </p>
            )}
          </CardContent>
        </Card>

        {/* Password Reset */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePasswordReset} disabled={loading} variant="outline">
              Send Password Reset Email
            </Button>
          </CardContent>
        </Card>

        {/* Change Email */}
        {currentUser.providerData[0]?.providerId === 'password' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change Email Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                />
              </div>
              <div>
                <Label htmlFor="currentPasswordEmail">Current password</Label>
                <Input
                  id="currentPasswordEmail"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <Button onClick={handleUpdateEmail} disabled={loading || !newEmail || !currentPassword}>
                Update Email
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Change Password */}
        {currentUser.providerData[0]?.providerId === 'password' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPasswordChange">Current password</Label>
                <Input
                  id="currentPasswordChange"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New password (min 6 characters)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={loading}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  This will permanently delete your account, profile, and all associated data.
                </p>
              </div>
            </div>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete My Account
              </Button>
            ) : (
              <div className="space-y-4">
                {currentUser.providerData[0]?.providerId === 'password' && (
                  <div>
                    <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={loading || (currentUser.providerData[0]?.providerId === 'password' && !currentPassword)}
                  >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setCurrentPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}