import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Palette, Globe, Settings as SettingsIcon, Share2, Copy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useToast } from '../hooks/use-toast';
import { ShareProfileBanner } from '@/components/ShareProfileBanner';

const colorThemes = [
  { id: 'green', name: 'Green', color: 'bg-green-500' },
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'red', name: 'Red', color: 'bg-red-500' },
  { id: 'gold', name: 'Gold', color: 'bg-yellow-500' },
  { id: 'duochrome', name: 'White Black Grey', color: 'bg-gray-900' }
];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' }
];

interface SettingsProps {
  dashboardProfile: any;
  onProfileUpdate: (profile: any) => void;
}

export const Settings = ({ dashboardProfile, onProfileUpdate }: SettingsProps) => {
  const { theme, colorTheme, setTheme, setColorTheme, language, setLanguage, getColorThemeName } = useTheme();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState(dashboardProfile || {});
  const [savingProfile, setSavingProfile] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);

  // Generate random 5-character referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Ensure user has a referral code
  const ensureReferralCode = async () => {
    if (!currentUser || dashboardProfile?.referralCode) return;
    
    const newCode = generateReferralCode();
    const docRef = doc(db, 'profiles', currentUser.uid);
    await setDoc(docRef, { referralCode: newCode }, { merge: true });
    onProfileUpdate({ ...dashboardProfile, referralCode: newCode });
  };

  // Initialize referral code on mount
  React.useEffect(() => {
    if (currentUser && dashboardProfile && !dashboardProfile.referralCode) {
      ensureReferralCode();
    }
  }, [currentUser, dashboardProfile]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSavingProfile(true);
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, editedProfile, { merge: true });
      onProfileUpdate(editedProfile);
      setIsEditingProfile(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-racing font-bold">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/profile'}
              >
                Edit Profile
              </Button>
              {!isEditingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const profileUrl = dashboardProfile?.username ? 
                      `${window.location.origin}/u/${dashboardProfile.username}` : 
                      `${window.location.origin}/profile`;
                    if (navigator.share) {
                      navigator.share({
                        title: `${dashboardProfile?.username || 'User'}'s Profile`,
                        text: 'Check out my profile on Saksham AI',
                        url: profileUrl
                      });
                    } else {
                      navigator.clipboard.writeText(profileUrl);
                    }
                  }}
                >
                  Share Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingProfile ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editedProfile.username || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={editedProfile.studentId || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, studentId: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editedProfile.email || currentUser?.email || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-foreground">{dashboardProfile?.username || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unique User ID</Label>
                  <p className="text-foreground font-mono">{dashboardProfile?.uniqueUserId || 'Loading...'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student ID</Label>
                  <p className="text-foreground">{dashboardProfile?.studentId || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-foreground">{dashboardProfile?.phone || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-foreground">{dashboardProfile?.email || currentUser?.email}</p>
                </div>
              </div>
              {dashboardProfile?.username && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Public Profile URL</Label>
                  <p className="text-foreground text-sm font-mono bg-muted px-2 py-1 rounded">
                    {window.location.origin}/u/{dashboardProfile.username}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Light/Dark Mode */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Mode</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                } bg-card`}
              >
                <div className="bg-white h-8 rounded mb-2"></div>
                <p className="text-sm font-medium">Light Mode</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                } bg-card`}
              >
                <div className="bg-gray-900 h-8 rounded mb-2"></div>
                <p className="text-sm font-medium">Dark Mode</p>
              </button>
            </div>
          </div>
          
          {/* Color Themes */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Colors</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {colorThemes.map((colorThemeOption) => (
                <button
                  key={colorThemeOption.id}
                  onClick={() => setColorTheme(colorThemeOption.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    colorTheme === colorThemeOption.id 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  } bg-card`}
                >
                  <div className={`h-8 rounded mb-2 ${colorThemeOption.color}`}></div>
                  <p className="text-xs font-medium text-center">{colorThemeOption.name}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Your Referral Code</Label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg font-bold text-center">
                {dashboardProfile?.referralCode || 'Loading...'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (dashboardProfile?.referralCode) {
                    navigator.clipboard.writeText(dashboardProfile.referralCode);
                    toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!currentUser || !dashboardProfile?.referralCode) return;
                  try {
                    const docRef = doc(db, 'referrals', dashboardProfile.referralCode);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                      toast({ title: 'Debug', description: `Referral code ${dashboardProfile.referralCode} exists in database` });
                    } else {
                      toast({ title: 'Debug', description: `Referral code ${dashboardProfile.referralCode} NOT found in database`, variant: 'destructive' });
                    }
                  } catch (error) {
                    toast({ title: 'Debug Error', description: 'Failed to check referral code', variant: 'destructive' });
                  }
                }}
              >
                Test
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Share your referral code with friends to earn rewards when they sign up!
          </div>
        </CardContent>
      </Card>
      
      {showShareBanner && dashboardProfile?.username && (
        <ShareProfileBanner
          profile={{
            username: dashboardProfile.username,
            displayName: dashboardProfile.displayUsername || currentUser?.displayName || dashboardProfile.username,
            photoURL: dashboardProfile.photoURL,
            uniqueUserId: dashboardProfile.uniqueUserId,
            bio: dashboardProfile.bio,
            skills: dashboardProfile.skills,
            location: typeof dashboardProfile.location === 'string' ? dashboardProfile.location : dashboardProfile.location?.city
          }}
          onClose={() => setShowShareBanner(false)}
        />
      )}
    </div>
  );
};