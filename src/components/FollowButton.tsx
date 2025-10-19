import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SocialService from '@/services/socialService';

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  onFollowChange,
  variant = 'default',
  size = 'default',
  className,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already following
  useEffect(() => {
    if (!currentUser) return;

    const checkFollowStatus = async () => {
      const following = await SocialService.isFollowing(currentUser.uid, targetUserId);
      setIsFollowing(following);
    };

    checkFollowStatus();
  }, [currentUser, targetUserId]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to follow users',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await SocialService.unfollowUser(currentUser.uid, targetUserId);
        setIsFollowing(false);
        toast({
          title: 'Unfollowed',
          description: 'You have unfollowed this user',
        });
      } else {
        await SocialService.followUser(currentUser.uid, targetUserId);
        setIsFollowing(true);
        toast({
          title: 'Following',
          description: 'You are now following this user',
        });
      }
      onFollowChange?.(isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.uid === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={loading}
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={`gap-2 ${className || ''}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
