import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageCircle, MapPin, Briefcase, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FollowButton } from '@/components/FollowButton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserProfile } from '@/services/socialService';

interface UserCardProps {
  user: UserProfile;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  showStats?: boolean;
  followerCount?: number;
  followingCount?: number;
  profileViewCount?: number;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showFollowButton = true,
  showMessageButton = true,
  showStats = true,
  followerCount = 0,
  followingCount = 0,
  profileViewCount = 0,
}) => {
  const initials = user.username
    .split(' ')
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <Link
          to={`/users/${user.username}`}
          className="flex items-start gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.photoURL} alt={user.username} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate hover:underline">{user.username}</h3>
            {user.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1">{user.bio}</p>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info */}
        <div className="space-y-2 text-sm">
          {user.sector && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{user.sector}</span>
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {showStats && (
          <div className="flex gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{followerCount}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{followingCount}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="text-lg font-semibold">{profileViewCount}</span>
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showFollowButton && (
            <FollowButton targetUserId={user.uid} size="sm" className="flex-1" />
          )}
          {showMessageButton && (
            <Link to={`/messages/${user.uid}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
