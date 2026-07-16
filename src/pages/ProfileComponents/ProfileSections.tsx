// Lazy-loaded sections to reduce Profile.tsx bundle size
import { lazy, Suspense } from 'react';

export const ProfileBasicInfo = lazy(() => 
  import('../ProfileSections/BasicInfoSection').then(m => ({ default: m.BasicInfoSection }))
);

export const ProfileEducation = lazy(() => 
  import('../ProfileSections/EducationSection').then(m => ({ default: m.EducationSection }))
);

export const ProfileExperience = lazy(() => 
  import('../ProfileSections/ExperienceSection').then(m => ({ default: m.ExperienceSection }))
);

export const ProfileSkills = lazy(() => 
  import('../ProfileSections/SkillsSection').then(m => ({ default: m.SkillsSection }))
);

export const ProfileSecurity = lazy(() => 
  import('../ProfileSections/SecuritySection').then(m => ({ default: m.SecuritySection }))
);

export const ProfileSettings = lazy(() => 
  import('../ProfileSections/SettingsSection').then(m => ({ default: m.SettingsSection }))
);

export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
    {children}
  </Suspense>
);
