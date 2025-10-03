import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Key, AlertTriangle } from 'lucide-react';

export const AccountSettings = () => {
  const { currentUser, updateUserPassword, deleteUserAccount } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isGoogleUser = currentUser?.providerData.some(provider => provider.providerId === 'google.com');

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateUserPassword(newPassword, isGoogleUser ? undefined : currentPassword);
      setMessage('✅ Password updated successfully!');
      setNewPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('❌ Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('❌ Password should be at least 6 characters');
      } else {
        setError('❌ Error updating password: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    const confirmText = 'DELETE MY ACCOUNT';
    const userInput = prompt(
      `⚠️ This will permanently delete your account and all data!\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      alert('❌ Account deletion cancelled');
      return;
    }

    const password = isGoogleUser ? undefined : prompt('Enter your current password:');
    if (!isGoogleUser && !password) {
      alert('❌ Password required for account deletion');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteUserAccount(password || undefined);
      alert('✅ Account deleted successfully');
      window.location.href = '/';
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('❌ Current password is incorrect');
      } else {
        setError('❌ Error deleting account: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGoogleUser ? (
            <Alert>
              <AlertDescription>
                You signed in with Google. You can set a password for email/password login.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}

          {isGoogleUser && (
            <div className="mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Set Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set a password for email login (min 6 characters)"
                  minLength={6}
                />
              </div>
              <Button 
                onClick={() => handlePasswordUpdate(new Event('submit') as any)}
                disabled={loading || !newPassword}
                className="mt-2"
              >
                {loading ? 'Setting...' : 'Set Password'}
              </Button>
            </div>
          )}

          {message && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="destructive" 
            onClick={handleAccountDeletion}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Button>
          
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

    </div>
  );
};