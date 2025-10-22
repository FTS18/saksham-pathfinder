import { lazy, Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, BookOpen, Briefcase, Zap, FileText } from 'lucide-react';
import {
  BasicInfoSkeleton,
  EducationSkeleton,
  ExperienceSkeleton,
  SkillsSkeleton,
  SecuritySkeleton,
  ResumeSkeleton,
  ProfileSectionSkeleton,
} from '@/components/SkeletonLoaders';

// Lazy load profile sections
const BasicInfoSection = lazy(() => import('./ProfileSections/BasicInfoSection'));
const EducationSection = lazy(() => import('./ProfileSections/EducationSection'));
const ExperienceSection = lazy(() => import('./ProfileSections/ExperienceSection'));
const SkillsSection = lazy(() => import('./ProfileSections/SkillsSection'));
const SecuritySection = lazy(() => import('./ProfileSections/SecuritySection'));
const ResumeSection = lazy(() => import('./ProfileSections/ResumeSection'));

interface UserProfile {
  username: string;
  displayUsername: string;
  email: string;
  phone: string;
  photoURL: string;
  bio: string;
  location: {
    state: string;
    city: string;
  };
  desiredLocation: {
    state: string;
    city: string;
  };
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
}

const defaultProfile: UserProfile = {
  username: '',
  displayUsername: '',
  email: '',
  phone: '',
  photoURL: '',
  bio: '',
  location: { state: '', city: '' },
  desiredLocation: { state: '', city: '' },
  skills: [],
  education: [],
  experience: [],
};

export const ProfileLazy = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile({
            ...defaultProfile,
            ...profileSnap.data(),
          });
        } else {
          // Initialize profile with email
          setProfile({
            ...defaultProfile,
            email: currentUser.email || '',
            displayUsername: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, toast]);

  // Update profile field
  const handleUpdate = async (key: string, value: any) => {
    if (!currentUser) return;

    try {
      setIsSaving(true);
      const updated = { ...profile, [key]: value };
      setProfile(updated);

      // Save to Firebase
      const profileRef = doc(db, 'users', currentUser.uid);
      await setDoc(profileRef, updated, { merge: true });

      toast({
        title: 'Saved successfully',
        description: `${key} updated`,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container py-8">
        <p className="text-center text-muted-foreground">
          Please log in to view your profile
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>

      {/* Horizontal Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:flex glass-card">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Resume</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Suspense fallback={<BasicInfoSkeleton />}>
            <BasicInfoSection
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <Suspense fallback={<EducationSkeleton />}>
            <EducationSection
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <Suspense fallback={<ExperienceSkeleton />}>
            <ExperienceSection
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Suspense fallback={<SkillsSkeleton />}>
            <SkillsSection
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-4">
          <Suspense fallback={<ResumeSkeleton />}>
            <ResumeSection
              profile={profile}
              onUpdate={handleUpdate}
              isLoading={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Suspense fallback={<SecuritySkeleton />}>
            <SecuritySection profile={profile} isLoading={isSaving} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Loading State Info */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Saving changes...
        </div>
      )}
    </div>
  );
};

export default ProfileLazy;
