import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

import { SocialLinksInput } from '@/components/SocialLinksInput';
import { checkUsernameAvailability, reserveUsername, generateUniqueUsername } from '@/lib/username';
import { extractAllSkills, extractAllSectors } from '@/lib/dataExtractor';
import { t } from '@/lib/translation';

interface UserProfile {
  username: string;
  displayUsername: string;
  email: string;
  phone: string;
  photoURL: string;
  studentId: string;
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
    setProfile(prev => ({ ...prev, sectors: prev.sectors.filter(s => s !== sector) }));
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
      // Delete profile from Firestore first
      try {
        const docRef = doc(db, 'profiles', currentUser.uid);
        await setDoc(docRef, {}, { merge: false }); // Clear the document
      } catch (error) {
        console.log('Profile data will be cleaned up when database is available');
      }
      
      // Delete the user account
      await deleteUser(currentUser);
      
      toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted' });
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
    <div className="container mx-auto p-6 max-w-4xl pt-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : t('profile.save')}
          </Button>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('profile.basicInfo')}
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
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">{t('profile.username')}</Label>
                <Input
                  id="username"
                  value={profile.username}
                  onChange={(e) => {
                    const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setProfile(prev => ({ ...prev, username: newUsername }));
                    checkUsername(newUsername);
                  }}
                  placeholder="coolcoder123"
                />
                {usernameChecking && <p className="text-xs text-muted-foreground mt-1">Checking...</p>}
                {usernameAvailable === true && <p className="text-xs text-green-600 mt-1">✓ Available</p>}
                {usernameAvailable === false && <p className="text-xs text-red-600 mt-1">✗ Already taken</p>}
                <p className="text-xs text-muted-foreground mt-1">Your profile will be at: /u/{profile.username}</p>
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={profile.studentId}
                  onChange={(e) => setProfile(prev => ({ ...prev, studentId: e.target.value }))}
                  placeholder="e.g., 25034096"
                />
              </div>
              <div>
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <PhoneInput
                  value={profile.phone}
                  onChange={(value) => setProfile(prev => ({ ...prev, phone: value }))}
                  country="India"
                  label={t('profile.phone')}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <CitySelector
                  value={profile.location}
                  onChange={(location) => setProfile(prev => ({ ...prev, location }))}
                  label="Current Location"
                />
              </div>
              <div>
                <CitySelector
                  value={profile.desiredLocation}
                  onChange={(desiredLocation) => setProfile(prev => ({ ...prev, desiredLocation }))}
                  label="Preferred Location *"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <CurrencyInput
                  value={profile.minStipend}
                  onChange={(minStipend) => setProfile(prev => ({ ...prev, minStipend }))}
                  country="India"
                  label={`${t('profile.minStipend')} (per month)`}
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
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sectors - Now comes first */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.sectors')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={newSector}
                  onChange={(e) => handleSectorInput(e.target.value)}
                  placeholder="Type to search sectors..."
                  onKeyPress={(e) => e.key === 'Enter' && addSector()}
                />
                <Button onClick={() => addSector()} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {sectorSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                  {sectorSuggestions.map((sector, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => addSector(sector)}
                    >
                      {sector}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.sectors.map((sector, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {sector}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeSector(sector)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills - Now comes after sectors */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.skills')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="relative">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => handleSkillInput(e.target.value)}
                  placeholder="Type to search skills..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={() => addSkill()} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {skillSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                  {skillSuggestions.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
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
              />
              <Input
                value={newEducation.institution}
                onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="Institution"
              />
              <Input
                value={newEducation.year}
                onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                placeholder="Year"
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
                placeholder="Job Title"
              />
              <Input
                value={newExperience.company}
                onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
              />
              <Input
                value={newExperience.duration}
                onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Duration"
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
                placeholder="https://yourportfolio.com"
                platform="portfolio"
              />
              <SocialLinksInput
                value={profile.socialLinks.linkedin}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, linkedin: value } }))}
                label="LinkedIn"
                placeholder="username"
                platform="linkedin"
              />
              <SocialLinksInput
                value={profile.socialLinks.github}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, github: value } }))}
                label="GitHub"
                placeholder="username"
                platform="github"
              />
              <SocialLinksInput
                value={profile.socialLinks.twitter}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, twitter: value } }))}
                label="Twitter/X"
                placeholder="username"
                platform="twitter"
              />
              <SocialLinksInput
                value={profile.socialLinks.codechef}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, codechef: value } }))}
                label="CodeChef"
                placeholder="username"
                platform="codechef"
              />
              <SocialLinksInput
                value={profile.socialLinks.leetcode}
                onChange={(value) => setProfile(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, leetcode: value } }))}
                label="LeetCode"
                placeholder="username"
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
                placeholder="https://drive.google.com/file/d/your-resume.pdf"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload your resume to Google Drive and paste the shareable link here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Password Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Password Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.linkedAccounts.google ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    You're signed in with Google. Set a password to also login with email.
                  </p>
                </div>
                <div>
                  <Label htmlFor="newPassword">Set Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={changePassword} 
                  disabled={changingPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                >
                  {changingPassword ? 'Setting...' : 'Set Password'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={changePassword} 
                  disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
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
                >
                  {linking ? 'Unlinking...' : 'Unlink'}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={linkGoogleAccount}
                  disabled={linking}
                >
                  {linking ? 'Linking...' : 'Link Account'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={deleteAccount}
                disabled={deleting}
                className="w-full sm:w-auto"
              >
                {deleting ? 'Deleting Account...' : 'Delete My Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;