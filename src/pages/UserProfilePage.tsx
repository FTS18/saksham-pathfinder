import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Briefcase, Eye, MessageCircle, Share2, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SocialService, { UserProfile } from '@/services/socialService';
import { FollowButton } from '@/components/FollowButton';
import { Loader2 } from 'lucide-react';

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [profileViews, setProfileViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Search for user by username
        const searchResults = await SocialService.searchUsers(username || '');
        const user = searchResults.find(u => u.username.toLowerCase() === username?.toLowerCase());

        if (!user) {
          toast({ title: 'Not found', description: 'User profile not found', variant: 'destructive' });
          navigate('/');
          return;
        }

        setUserProfile(user);

        // Get followers, following, and profile views
        const [followersList, followingList, viewsList] = await Promise.all([
          SocialService.getFollowers(user.uid),
          SocialService.getFollowing(user.uid),
          SocialService.getProfileViews(user.uid),
        ]);

        setFollowers(followersList);
        setFollowing(followingList);
        setProfileViews(viewsList);

        // Record this profile view if not the same user
        if (currentUser && currentUser.uid !== user.uid) {
          await SocialService.recordProfileView(currentUser.uid, user.uid);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, currentUser, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">User not found</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  const initials = userProfile.username
    .split(' ')
    .map(n => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  const isOwnProfile = currentUser?.uid === userProfile.uid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Card */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
                <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold truncate">{userProfile.username}</h1>
                <p className="text-muted-foreground">{userProfile.email}</p>

                {userProfile.bio && (
                  <p className="text-sm mt-2 line-clamp-2">{userProfile.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {userProfile.sector && (
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="w-3 h-3" />
                      {userProfile.sector}
                    </Badge>
                  )}
                  {userProfile.location && (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {userProfile.location}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-col">
                {!isOwnProfile && <FollowButton targetUserId={userProfile.uid} />}
                {!isOwnProfile && (
                  <Button variant="outline" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                )}
                {isOwnProfile && (
                  <Button variant="outline" onClick={() => navigate('/profile')} className="gap-2">
                    Edit Profile
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{followers.length}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{following.length}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{profileViews.length}</div>
                <div className="text-xs text-muted-foreground">Profile Views</div>
              </div>
              <div className="text-center">
                <Eye className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile.sector && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sector</p>
                    <p className="font-medium">{userProfile.sector}</p>
                  </div>
                )}
                {userProfile.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{userProfile.location}</p>
                  </div>
                )}
                {userProfile.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{userProfile.bio}</p>
                  </div>
                )}
                {!userProfile.sector && !userProfile.location && !userProfile.bio && (
                  <p className="text-muted-foreground text-center py-8">No profile information yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers">
            <div className="space-y-4">
              {followers.length > 0 ? (
                followers.map((follower) => (
                  <Card key={follower.uid}>
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div
                        onClick={() => navigate(`/u/${follower.username}`)}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Avatar>
                          <AvatarImage src={follower.photoURL} />
                          <AvatarFallback>
                            {follower.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{follower.username}</p>
                          {follower.sector && (
                            <p className="text-xs text-muted-foreground">{follower.sector}</p>
                          )}
                        </div>
                      </div>
                      <FollowButton targetUserId={follower.uid} size="sm" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No followers yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <div className="space-y-4">
              {following.length > 0 ? (
                following.map((followingUser) => (
                  <Card key={followingUser.uid}>
                    <CardContent className="pt-6 flex items-center justify-between">
                      <div
                        onClick={() => navigate(`/u/${followingUser.username}`)}
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <Avatar>
                          <AvatarImage src={followingUser.photoURL} />
                          <AvatarFallback>
                            {followingUser.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{followingUser.username}</p>
                          {followingUser.sector && (
                            <p className="text-xs text-muted-foreground">{followingUser.sector}</p>
                          )}
                        </div>
                      </div>
                      <FollowButton targetUserId={followingUser.uid} size="sm" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Not following anyone yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;
