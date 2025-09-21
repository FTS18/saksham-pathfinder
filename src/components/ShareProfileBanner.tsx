import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Copy, Share2, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ShareProfileBannerProps {
  profile: {
    username: string;
    displayName: string;
    photoURL: string;
    uniqueUserId: string;
    bio: string;
    skills: string[];
    sectors: string[];
    location: string;
    age: number | null;
  };
  onClose: () => void;
}

export const ShareProfileBanner = ({ profile, onClose }: ShareProfileBannerProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  useScrollLock(true);
  
  const profileUrl = `${window.location.origin}/u/${profile.username}`;
  
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast({ title: 'Copied!', description: 'Profile URL copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy URL', variant: 'destructive' });
    }
  };
  
  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName}'s Profile - Saksham AI`,
          text: `Check out ${profile.displayName}'s profile on Saksham AI`,
          url: profileUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Share Your Profile</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Profile Preview */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{profile.displayName}</div>
                <div className="text-sm text-muted-foreground">@{profile.username}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {profile.location && (
                <p className="text-xs text-muted-foreground">📍 {profile.location}</p>
              )}
              {profile.age && (
                <p className="text-xs text-muted-foreground">🎂 {profile.age} years old</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
            
            {profile.sectors.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium mb-1">Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.sectors.slice(0, 2).map((sector, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                  {profile.sectors.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.sectors.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {profile.skills.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* URL Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={shareProfile} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
              <Button variant="outline" asChild>
                <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};