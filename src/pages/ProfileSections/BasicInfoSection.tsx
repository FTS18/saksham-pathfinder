import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhoneInput } from '@/components/PhoneInput';
import { StateSelector } from '@/components/StateSelector';
import { CitySelector } from '@/components/CitySelector';

interface BasicInfoSectionProps {
  profile: any;
  onUpdate: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

export const BasicInfoSection = ({ profile, onUpdate, isLoading }: BasicInfoSectionProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    
    setIsSaving(true);
    try {
      // TODO: Implement Firebase storage upload
      // For now, using data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        await onUpdate('photoURL', reader.result as string);
        toast({ title: 'Photo updated successfully' });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: 'Failed to upload photo', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (field: string, value: any) => {
    try {
      setIsSaving(true);
      await onUpdate(field, value);
      toast({ title: 'Saved successfully' });
    } catch (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Photo */}
        <div className="space-y-4">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.photoURL} alt={profile?.displayUsername} />
              <AvatarFallback className="text-2xl">
                {profile?.displayUsername?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <label className="flex items-center gap-2 cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={profile?.displayUsername || ''}
            onChange={(e) => handleSave('displayUsername', e.target.value)}
            disabled={isSaving}
            placeholder="Your name"
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ''}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <PhoneInput
            value={profile?.phone || ''}
            onChange={(phone) => handleSave('phone', phone)}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile?.bio || ''}
            onChange={(e) => handleSave('bio', e.target.value)}
            disabled={isSaving}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>

        {/* Current Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Location - State</Label>
            <StateSelector
              value={profile?.location?.state || ''}
              onChange={(state) => handleSave('location', { ...profile?.location, state })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label>Current Location - City</Label>
            <CitySelector
              state={profile?.location?.state || ''}
              value={profile?.location?.city || ''}
              onChange={(city) => handleSave('location', { ...profile?.location, city })}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Desired Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Desired Location - State</Label>
            <StateSelector
              value={profile?.desiredLocation?.state || ''}
              onChange={(state) => handleSave('desiredLocation', { ...profile?.desiredLocation, state })}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label>Desired Location - City</Label>
            <CitySelector
              state={profile?.desiredLocation?.state || ''}
              value={profile?.desiredLocation?.city || ''}
              onChange={(city) => handleSave('desiredLocation', { ...profile?.desiredLocation, city })}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
