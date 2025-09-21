import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Mail, Lock, Phone, AlertTriangle } from 'lucide-react';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleEmailVerification = async () => {
    if (!user) return;
    setLoading(true);
    const result = await AuthService.sendVerificationEmail(user);
    if (result.success) {
      setMessage(result.message);
      setError('');
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    const result = await AuthService.resetPassword(user.email);
    if (result.success) {
      setMessage(result.message);
      setError('');
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  const handleEmailChange = async () => {
    if (!user || !newEmail) return;
    setLoading(true);
    const result = await AuthService.changeEmail(user, newEmail);
    if (result.success) {
      setMessage(result.message);
      setError('');
      setNewEmail('');
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!user || !newPassword) return;
    setLoading(true);
    const result = await AuthService.changePassword(user, newPassword);
    if (result.success) {
      setMessage(result.message);
      setError('');
      setNewPassword('');
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  const handleSMSVerification = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    const result = await AuthService.sendSMSVerification(phoneNumber);
    if (result.success) {
      setMessage(result.message);
      setError('');
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm('Are you sure? This will permanently delete your account and all data.')) return;
    
    setLoading(true);
    const result = await AuthService.deleteAccount(user);
    if (result.success) {
      logout();
    } else {
      setError(result.error);
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current email: {user?.email}
            {user?.emailVerified ? ' ✅ Verified' : ' ❌ Not verified'}
          </p>
          {!user?.emailVerified && (
            <Button onClick={handleEmailVerification} disabled={loading}>
              Send Verification Email
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            📧 Check your spam/junk folder if you don't see the email in your inbox
          </p>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Reset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePasswordReset} disabled={loading} variant="outline">
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="New email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Button onClick={handleEmailChange} disabled={loading || !newEmail}>
            Update Email
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="New password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button onClick={handlePasswordChange} disabled={loading || !newPassword}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* SMS Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            SMS Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="tel"
            placeholder="+91 9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button onClick={handleSMSVerification} disabled={loading || !phoneNumber}>
            Send SMS Code
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete your account, profile, and all associated data.
          </p>
          <Button 
            onClick={handleDeleteAccount} 
            disabled={loading} 
            variant="destructive"
          >
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}