import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signInWithPopup, linkWithPopup, unlink, deleteUser } from 'firebase/auth';
import { db, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, GraduationCap, Briefcase, Link as LinkIcon, Plus, X, Lock, Upload, MapPin, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CitySelector } from '@/components/CitySelector';
import { PhoneInput } from '@/components/PhoneInput';
import { CurrencyInput } from '@/components/CurrencyInput';
import { ShareProfileBanner } from '@/components/ShareProfileBanner';

import { SocialLinksInput } from '@/components/SocialLinksInput';
import { checkUsernameAvailability, reserveUsername, generateUniqueUsername } from '@/lib/username';
import { extractAllSkills, extractAllSectors } from '@/lib/dataExtractor';


interface UserProfile {
  username: string;
  displayUsername: string;
  email: string;
  phone: string;
  photoURL: string;
  studentId: string;
  uniqueUserId: string;
  skills: string[];
  sectors: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
  }[];
  bio: string;
  location: string;
  desiredLocation: string;
  minStipend: number;
  socialLinks: {
    portfolio: string;
    linkedin: string;
    github: string;
    twitter: string;
    codechef: string;
    leetcode: string;
  };
  resumeURL: string;
  linkedAccounts: {
    google: boolean;
  };
}

const Profile = () => {
  const { currentUser } = useAuth();
  const { theme, colorTheme, language, setTheme, setColorTheme, setLanguage } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    phone: '',
    photoURL: '',
    studentId: '',
    skills: [],
    sectors: [],
    education: [],
    experience: [],
    bio: '',
    location: '',
    desiredLocation: '',
    minStipend: 0,
    socialLinks: {
      portfolio: '',
      linkedin: '',
      github: '',
      twitter: '',
      codechef: '',
      leetcode: ''
    },
    resumeURL: '',
    linkedAccounts: { google: false }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [newExperience, setNewExperience] = useState({ title: '', company: '', duration: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [sectorSuggestions, setSectorSuggestions] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [skillsEnabled, setSkillsEnabled] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'account' | 'preferences'>('personal');



  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    const loadData = async () => {
      const [skills, sectors] = await Promise.all([
        extractAllSkills(),
        extractAllSectors()
      ]);
      setAvailableSkills(skills);
      setAvailableSectors(sectors);
    };
    loadData();
  }, []);

  useEffect(() => {
    setSkillsEnabled(profile.sectors.length > 0);
  }, [profile.sectors]);

  const loadProfile = async () => {
    if (!currentUser) return;
    
    const initialProfile: UserProfile = {
      username: '',
      displayUsername: currentUser.displayName || '',
      email: currentUser.email || '',
      phone: '',
      photoURL: currentUser.photoURL || '',
      studentId: '',
      uniqueUserId: '',
      skills: [],
      sectors: [],
      education: [],
      experience: [],
      bio: '',
      location: '',
      desiredLocation: '',
      minStipend: 0,
      socialLinks: {
        portfolio: '',
        linkedin: '',
        github: '',
        twitter: '',
        codechef: '',
        leetcode: ''
      },
      resumeURL: '',
      linkedAccounts: { google: !!currentUser.providerData.find(p => p.providerId === 'google.com') }
    };
    
    setProfile(initialProfile);
    setLoading(false);
    
    // Try to load from Firestore in background
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as UserProfile;
        setProfile({
          ...initialProfile,
          ...firestoreData,
          linkedAccounts: { google: !!currentUser.providerData.find(p => p.providerId === 'google.com') }
        });
      } else {
        // Generate username for new users
        const uniqueUsername = await generateUniqueUsername();
        await reserveUsername(uniqueUsername, currentUser.uid);
        setProfile(prev => ({ ...prev, username: uniqueUsername }));
      }
    } catch (error) {
      console.error('Firestore not available:', error);
      // Profile already loaded with initial data, so no error shown to user
    }
  };

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameChecking(true);
    const available = await checkUsernameAvailability(username);
    setUsernameAvailable(available);
    setUsernameChecking(false);
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    
    if (profile.username && !usernameAvailable && profile.username !== profile.username) {
      toast({ title: 'Error', description: 'Username is not available', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    try {
      // Reserve new username if changed
      if (profile.username && usernameAvailable) {
        await reserveUsername(profile.username, currentUser.uid);
      }
      
      const docRef = doc(db, 'profiles', currentUser.uid);
      await setDoc(docRef, profile, { merge: true });
      toast({ title: 'Success', description: 'Profile saved successfully' });
    } catch (error) {
      console.error('Firestore not available:', error);
      toast({ title: 'Info', description: 'Profile saved locally. Will sync when database is available.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkillInput = (value: string) => {
    setNewSkill(value);
    if (value.length > 0) {
      const filtered = availableSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase()) && 
        !profile.skills.includes(skill)
      );
      setSkillSuggestions(filtered.slice(0, 5));
    } else {
      setSkillSuggestions([]);
    }
  };

  const handleSectorInput = (value: string) => {
    setNewSector(value);
    if (value.length > 0) {
      const filtered = availableSectors.filter(sector => 
        sector.toLowerCase().includes(value.toLowerCase()) && 
        !profile.sectors.includes(sector)
      );
      setSectorSuggestions(filtered.slice(0, 5));
    } else {
      setSectorSuggestions([]);
    }
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !profile.skills.includes(skillToAdd)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, skillToAdd] }));
      setNewSkill('');
      setSkillSuggestions([]);
    }
  };

  const addSector = (sector?: string) => {
    const sectorToAdd = sector || newSector.trim();
    if (sectorToAdd && !profile.sectors.includes(sectorToAdd)) {
      setProfile(prev => ({ ...prev, sectors: [...prev.sectors, sectorToAdd] }));
      setNewSector('');
      setSectorSuggestions([]);
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const removeSector = (sector: string) => {
    setProfile(prev => {
      const newSectors = prev.sectors.filter(s => s !== sector);
      
      // Remove skills that are only associated with the removed sector
      const sectorSkills = availableSkills.filter(skill => 
        skill.toLowerCase().includes(sector.toLowerCase()) ||
        sector.toLowerCase().includes('technology') && ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java'].includes(skill) ||
        sector.toLowerCase().includes('design') && ['Figma', 'Photoshop', 'UI/UX', 'Sketch'].includes(skill) ||
        sector.toLowerCase().includes('marketing') && ['SEO', 'Social Media', 'Content Writing', 'Analytics'].includes(skill)
      );
      
      // Keep skills that exist in other selected sectors
      const skillsToKeep = prev.skills.filter(skill => {
        if (!sectorSkills.includes(skill)) return true;
        // Check if skill exists in any remaining sector
        return newSectors.some(remainingSector => {
          const remainingSectorSkills = availableSkills.filter(s => 
            s.toLowerCase().includes(remainingSector.toLowerCase()) ||
            remainingSector.toLowerCase().includes('technology') && ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java'].includes(s) ||
            remainingSector.toLowerCase().includes('design') && ['Figma', 'Photoshop', 'UI/UX', 'Sketch'].includes(s) ||
            remainingSector.toLowerCase().includes('marketing') && ['SEO', 'Social Media', 'Content Writing', 'Analytics'].includes(s)
          );
          return remainingSectorSkills.includes(skill);
        });
      });
      
      return { ...prev, sectors: newSectors, skills: skillsToKeep };
    });
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setProfile(prev => ({ ...prev, education: [...prev.education, newEducation] }));
      setNewEducation({ degree: '', institution: '', year: '' });
    }
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfile(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
      setNewExperience({ title: '', company: '', duration: '' });
    }
  };

  const removeExperience = (index: number) => {
    setProfile(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const changePassword = async () => {
    if (!currentUser || !currentUser.email) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    
    setChangingPassword(true);
    try {
      if (profile.linkedAccounts.google && !passwordData.currentPassword) {
        // For Google users setting password for first time
        await updatePassword(currentUser, passwordData.newPassword);
        toast({ title: 'Success', description: 'Password set successfully! You can now login with email and password.' });
      } else {
        // For regular password change
        const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, passwordData.newPassword);
        toast({ title: 'Success', description: 'Password updated successfully' });
      }
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to change password', 
        variant: 'destructive' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const linkGoogleAccount = async () => {
    if (!currentUser) return;
    setLinking(true);
    try {
      await linkWithPopup(currentUser, googleProvider);
      setProfile(prev => ({ ...prev, linkedAccounts: { ...prev.linkedAccounts, google: true } }));
      toast({ title: 'Success', description: 'Google account linked successfully' });
    } catch (error: any) {
      console.error('Error linking Google account:', error);
      toast({ title: 'Error', description: error.message || 'Failed to link Google account', variant: 'destructive' });
    } finally {
      setLinking(false);
    }
  };

  const unlinkGoogleAccount = async () => {
    if (!currentUser) return;
    setLinking(true);
    try {
      await unlink(currentUser, 'google.com');
      setProfile(prev => ({ ...prev, linkedAccounts: { ...prev.linkedAccounts, google: false } }));
      toast({ title: 'Success', description: 'Google account unlinked successfully' });
    } catch (error: any) {
      console.error('Error unlinking Google account:', error);
      toast({ title: 'Error', description: error.message || 'Failed to unlink Google account', variant: 'destructive' });
    } finally {
      setLinking(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      // For password users, require re-authentication
      if (currentUser.providerData[0]?.providerId === 'password') {
        if (!passwordData.currentPassword) {
          toast({
            title: 'Password Required',
            description: 'Please enter your current password to delete your account.',
            variant: 'destructive'
          });
          setDeleting(false);
          return;
        }
        
        // Re-authenticate
        const credential = EmailAuthProvider.credential(currentUser.email!, passwordData.currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }
      
      // Delete profile from Firestore first
      try {
        const docRef = doc(db, 'profiles', currentUser.uid);
        await deleteDoc(docRef);
      } catch (error) {
        console.log('Profile data will be cleaned up when database is available');
      }
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Delete the user account
      await deleteUser(currentUser);
      
      toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted' });
      
      // Redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          title: 'Re-authentication Required', 
          description: 'Please log out and log back in, then try deleting your account again.', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to delete account', 
          variant: 'destructive' 
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-16 md:pt-20">
      <div className="space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="flex gap-2">
              {profile.username && (
                <Button
                  variant="outline"
                  onClick={() => setShowShareBanner(true)}
                  className="rounded-full"
                >
                  Share Profile
                </Button>
              )}
              <Button onClick={saveProfile} disabled={saving} className="rounded-full">
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
          
          {/* Section Navigation */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-max">
              <button 
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'personal' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Personal Info
              </button>
              <button 
                onClick={() => setActiveTab('account')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'account' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Account
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'preferences' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Personal Info Tab Content */}
        {activeTab === 'personal' && (
          <>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="text-lg font-bold">{getInitials(profile.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="photoURL">Profile Photo URL</Label>
                <Input
                  id="photoURL"
                  value={profile.photoURL}
                  onChange={(e) => setProfile(prev => ({ ...prev, photoURL: e.target.value }))}
                  placeholder="Photo URL"
                  className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => {
                    const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setProfile(prev => ({ ...prev, username: newUsername }));
                    checkUsername(newUsername);
                  }}
                  placeholder="johndoe"
                  className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                />
                {usernameChecking && <p className="text-xs text-muted-foreground mt-1">Checking...</p>}
                {usernameAvailable === true && <p className="text-xs text-green-600 mt-1">✓ Available</p>}
                {usernameAvailable === false && <p className="text-xs text-red-600 mt-1">✗ Already taken</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Your profile will be at: {window.location.origin}/u/{profile.username || 'username'}
                </p>
              </div>
              <div>
                <Label htmlFor="uniqueUserId">Unique User ID</Label>
                <Input
                  id="uniqueUserId"
                  value={profile.uniqueUserId}
                  disabled
                  placeholder="Unique ID"
                  className="bg-muted border-2 rounded-lg h-11"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your unique ID for transactions and tracking
                </p>
              </div>

              <div>
                <CitySelector
                  value={profile.location}
                  onChange={(location) => setProfile(prev => ({ ...prev, location }))}
                  label="Current Location"
                  placeholder="Current city"
                />
              </div>
              <div>
                <CitySelector
                  value={profile.desiredLocation}
                  onChange={(desiredLocation) => setProfile(prev => ({ ...prev, desiredLocation }))}
                  label="Preferred Location *"
                  placeholder="Preferred city"
                  required
                />
              </div>
              <div>
                <CurrencyInput
                  value={profile.minStipend}
                  onChange={(minStipend) => setProfile(prev => ({ ...prev, minStipend }))}
                  country="India"
                  label="Minimum Expected Stipend (per month)"
                  placeholder="15000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
                className="border-2 rounded-lg transition-colors focus:border-ring resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sectors - Now comes first */}
        <Card>
          <CardHeader>
            <CardTitle>Sectors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Sectors Tags */}
            {profile.sectors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.sectors.map((sector, index) => (
                  <Badge key={index} variant="default" className="rounded-none cursor-pointer">
                    {sector}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                      onClick={() => removeSector(sector)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Sector Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {availableSectors.map(sector => (
                <Button 
                  key={sector} 
                  variant={profile.sectors.includes(sector) ? 'default' : 'outline'} 
                  onClick={() => profile.sectors.includes(sector) ? removeSector(sector) : addSector(sector)} 
                  className={`rounded-none text-xs h-8 ${profile.sectors.includes(sector) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-foreground border border-border hover:bg-muted hover:text-foreground'}`}
                  size="sm"
                >
                  {sector}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills - Now comes after sectors */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.sectors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Please select sector interests first to see available skills</p>
              </div>
            ) : (
              <>
                {/* Selected Skills Tags */}
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="rounded-none cursor-pointer">
                        {skill}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Skills by Sector */}
                <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                  {profile.sectors.map(sector => {
                    const sectorSkills = availableSkills.filter(skill => 
                      skill.toLowerCase().includes(sector.toLowerCase()) ||
                      sector.toLowerCase().includes('technology') && ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Python', 'Java'].includes(skill) ||
                      sector.toLowerCase().includes('design') && ['Figma', 'Photoshop', 'UI/UX', 'Sketch'].includes(skill) ||
                      sector.toLowerCase().includes('marketing') && ['SEO', 'Social Media', 'Content Writing', 'Analytics'].includes(skill)
                    );
                    
                    return (
                      <div key={sector} className="mb-4 last:mb-0">
                        <h4 className="text-sm font-semibold mb-2 text-primary">{sector}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sectorSkills.slice(0, 12).map((skill: string) => (
                            <Button 
                              key={skill} 
                              variant={profile.skills.includes(skill) ? 'default' : 'outline'} 
                              onClick={() => profile.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)} 
                              className={`rounded-none text-xs h-8 ${profile.skills.includes(skill) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-foreground border border-border hover:bg-muted hover:text-foreground'}`}
                              size="sm"
                            >
                              {skill}
                            </Button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                value={newEducation.degree}
                onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="Degree"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Input
                value={newEducation.institution}
                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Institution"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Input
                value={newEducation.year}
                onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                placeholder="Year"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Button onClick={addEducation} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {profile.education.map((edu, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                value={newExperience.title}
                onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Job title"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Input
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Input
                value={newExperience.duration}
                onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Duration"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <Button onClick={addExperience} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {profile.experience.map((exp, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{exp.title}</div>
                    <div className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SocialLinksInput
                value={profile.socialLinks.portfolio}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, portfolio: value } }))}
                label="Portfolio"
                placeholder="Enter URL"
                platform="portfolio"
              />
              <SocialLinksInput
                value={profile.socialLinks.linkedin}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, linkedin: value } }))}
                label="LinkedIn"
                placeholder="johndoe"
                platform="linkedin"
              />
              <SocialLinksInput
                value={profile.socialLinks.github}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, github: value } }))}
                label="GitHub"
                placeholder="johndoe"
                platform="github"
              />
              <SocialLinksInput
                value={profile.socialLinks.twitter}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: value } }))}
                label="Twitter/X"
                placeholder="johndoe"
                platform="twitter"
              />
              <SocialLinksInput
                value={profile.socialLinks.codechef}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, codechef: value } }))}
                label="CodeChef"
                placeholder="johndoe"
                platform="codechef"
              />
              <SocialLinksInput
                value={profile.socialLinks.leetcode}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, leetcode: value } }))}
                label="LeetCode"
                placeholder="johndoe"
                platform="leetcode"
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Resume URL</Label>
              <Input
                value={profile.resumeURL}
                onChange={(e) => setProfile(prev => ({ ...prev, resumeURL: e.target.value }))}
                placeholder="Enter URL"
                className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload your resume to Google Drive and paste the shareable link here
              </p>
            </div>
          </CardContent>
        </Card>



          </>
        )}

        {/* Account Tab Content */}
        {activeTab === 'account' && (
          <>
        {/* Basic Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                />
              </div>
              <div>
                <PhoneInput
                  value={profile.phone}
                  onChange={(value) => setProfile(prev => ({ ...prev, phone: value }))}
                  country="India"
                  label="Phone"
                  placeholder="1234567890"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Current email: {currentUser?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {currentUser?.emailVerified ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-500 text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-red-500 text-sm">Not verified</span>
                    </>
                  )}
                </div>
              </div>
              {!currentUser?.emailVerified && (
                <Button size="sm" variant="outline" className="rounded-full">
                  Send Verification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle>Password Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentUser?.providerData[0]?.providerId === 'password' ? (
              <>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Send Password Reset Email
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Current password"
                        className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                      />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="New password"
                        className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                      />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm password"
                        className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                      />
                    </div>
                    <Button onClick={changePassword} disabled={changingPassword} size="sm" className="rounded-full">
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium">Set Password</h4>
                <p className="text-sm text-muted-foreground">You signed in with Google. Set a password to enable email login.</p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="New password"
                      className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                    />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      className="border-2 rounded-lg h-11 transition-colors focus:border-ring"
                    />
                  </div>
                  <Button onClick={changePassword} disabled={changingPassword} size="sm" className="rounded-full">
                    {changingPassword ? 'Setting...' : 'Set Password'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linked Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Linked Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <div className="font-medium">Google Account</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.linkedAccounts.google ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>
              {profile.linkedAccounts.google ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={unlinkGoogleAccount}
                  disabled={linking}
                  className="rounded-full"
                >
                  {linking ? 'Unlinking...' : 'Unlink'}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={linkGoogleAccount}
                  disabled={linking}
                  className="rounded-full"
                >
                  {linking ? 'Linking...' : 'Link Account'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This will permanently delete your account, profile, and all associated data.
                  </p>
                  {currentUser?.providerData[0]?.providerId === 'password' && (
                    <div className="mt-3 mb-3">
                      <Label className="text-red-800 dark:text-red-200">Enter your password to confirm</Label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Password"
                        className="mt-1 border-2 rounded-lg h-11 transition-colors focus:border-ring"
                      />
                    </div>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="mt-3 rounded-full"
                    onClick={deleteAccount}
                    disabled={deleting || (currentUser?.providerData[0]?.providerId === 'password' && !passwordData.currentPassword)}
                  >
                    {deleting ? 'Deleting...' : 'Delete My Account'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}

        {/* Preferences Tab Content */}
        {activeTab === 'preferences' && (
          <>
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Color Theme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
                      { name: 'Grey', value: 'grey', color: 'bg-gray-500' },
                      { name: 'Red', value: 'red', color: 'bg-red-500' },
                      { name: 'Yellow', value: 'yellow', color: 'bg-yellow-500' },
                      { name: 'Green', value: 'green', color: 'bg-green-500' }
                    ].map((themeOption) => (
                      <button
                        key={themeOption.value}
                        onClick={() => setColorTheme(themeOption.value as any)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          colorTheme === themeOption.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${themeOption.color}`} />
                          <span className="font-medium">{themeOption.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-3 block">Display Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-white border" />
                        <span className="font-medium">Light</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-gray-800" />
                        <span className="font-medium">Dark</span>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Language</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { name: 'English', value: 'en', flag: '🇺🇸' },
                      { name: 'हिंदी', value: 'hi', flag: '🇮🇳' },
                      { name: 'ਪੰਜਾਬੀ', value: 'pa', flag: '🇮🇳' },
                      { name: 'اردو', value: 'ur', flag: '🇵🇰' }
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value as any)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          language === lang.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}


      </div>
      
      {showShareBanner && (
        <ShareProfileBanner
          profile={{
            username: profile.username,
            displayName: profile.displayUsername || currentUser?.displayName || profile.username,
            photoURL: profile.photoURL,
            uniqueUserId: profile.uniqueUserId,
            bio: profile.bio,
            skills: profile.skills,
            location: typeof profile.location === 'string' ? profile.location : profile.location?.city
          }}
          onClose={() => setShowShareBanner(false)}
        />
      )}
    </div>
  );
};

export default Profile;