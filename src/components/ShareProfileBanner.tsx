import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Download, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareProfileBannerProps {
  profile: {
    username: string;
    displayName?: string;
    photoURL?: string;
    uniqueUserId?: string;
    bio?: string;
    skills?: string[];
    location?: string;
  };
  onClose: () => void;
}

export const ShareProfileBanner = ({ profile, onClose }: ShareProfileBannerProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const generateBanner = () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += 60) {
      for (let j = 0; j < canvas.height; j += 60) {
        ctx.fillRect(i, j, 30, 30);
      }
    }

    const centerX = 200;
    const centerY = canvas.height / 2;
    const radius = 80;

    // Profile circle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Initials
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getInitials(profile.displayName || profile.username), centerX, centerY);

    // Name
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(profile.displayName || profile.username || 'User', 320, 180);

    // Username
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '32px Arial';
    ctx.fillText(`@${profile.username || 'username'}`, 320, 240);

    // User ID
    if (profile.uniqueUserId) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '24px Arial';
      ctx.fillText(`ID: ${profile.uniqueUserId}`, 320, 290);
    }

    // Bio
    if (profile.bio) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '28px Arial';
      ctx.fillText(profile.bio.substring(0, 50) + '...', 320, 340);
    }

    // Skills
    if (profile.skills && profile.skills.length > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '20px Arial';
      ctx.fillText(profile.skills.slice(0, 3).join(' • '), 320, 380);
    }

    // URL
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '24px Arial';
    ctx.fillText(`saksham-pathfinder.com/u/${profile.username}`, 320, 550);

    // Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Saksham Pathfinder', canvas.width - 50, 80);

    setIsGenerating(false);
  };

  const downloadBanner = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `${profile.username}-profile-banner.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast({ title: 'Downloaded!', description: 'Profile banner saved to your device' });
  };

  const shareBanner = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const profileUrl = `${window.location.origin}/u/${profile.username}`;
      const shareData = {
        title: `${profile.displayName || profile.username}'s Profile - Saksham Pathfinder`,
        text: `Check out ${profile.displayName || profile.username}'s profile on Saksham Pathfinder!`,
        url: profileUrl
      };

      if (navigator.share) {
        // Try sharing with image first
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `${profile.username}-profile.png`, { type: 'image/png' });
            try {
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ ...shareData, files: [file] });
              } else {
                await navigator.share(shareData);
              }
            } catch (shareError) {
              // Fallback to URL only
              await navigator.share(shareData);
            }
          } else {
            await navigator.share(shareData);
          }
        });
      } else {
        // Fallback: copy URL
        await navigator.clipboard.writeText(profileUrl);
        toast({ title: 'Link Copied!', description: 'Profile link copied to clipboard' });
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
        toast({ title: 'Link Copied!', description: 'Profile link copied to clipboard' });
      } catch (clipboardError) {
        toast({ title: 'Share Failed', description: 'Could not share or copy link', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Share Your Profile</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={generateBanner} disabled={isGenerating} className="bg-primary">
                {isGenerating ? 'Generating...' : 'Generate Banner'}
              </Button>
              <Button onClick={downloadBanner} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareBanner} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
                  toast({ title: 'Copied!', description: 'Profile link copied to clipboard' });
                }}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Share your professional profile with friends and recruiters!</p>
              <p className="mt-1">Profile URL: <span className="font-mono">{window.location.origin}/u/{profile.username}</span></p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};