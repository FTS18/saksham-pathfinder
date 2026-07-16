import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Trophy, Star, Gift, Copy, Share2, Crown, Medal, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PageHeader } from '../components/StickyBreadcrumbHeader';
import { useProfileData } from '../hooks/useProfileData';

interface LeaderboardUser {
  id: string;
  username: string;
  points: number;
  referrals: number;
  photoURL?: string;
}

export default function Referrals() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Use shared cached profile — no extra Firestore read needed
  const { profile: sharedProfile, profileLoading, points, badges } = useProfileData();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadLeaderboard();
    }
  }, [currentUser]);

  // Merge shared profile data into local userProfile when it loads
  useEffect(() => {
    if (!profileLoading && sharedProfile && Object.keys(sharedProfile).length > 0) {
      setUserProfile(prev => ({ ...sharedProfile, ...prev }));
      setLoading(false);
    }
  }, [sharedProfile, profileLoading]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure referral code exists for existing users
        if (!data.referralCode) {
          const updatedProfile = {
            ...data,
            referralCode: generateReferralCode()
          };
          await setDoc(docRef, updatedProfile, { merge: true });
          setUserProfile(updatedProfile);
        } else {
          setUserProfile(data);
        }
      } else {
        // Create initial profile with referral code
        const initialProfile = {
          username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email,
          points: 50, // Welcome bonus
          referrals: 0,
          referralCode: generateReferralCode(),
          photoURL: currentUser.photoURL || '',
          timeSpent: 0,
          lastActive: Date.now()
        };
        await setDoc(docRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'profiles'),
        orderBy('points', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      
      const users: LeaderboardUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.points > 0) {
          users.push({
            id: doc.id,
            username: data.username || 'Anonymous',
            points: data.points || 0,
            referrals: data.referrals || 0,
            photoURL: data.photoURL
          });
        }
      });
      
      setLeaderboard(users);
    } catch (error) {
      // Firestore rules may restrict reading other users' profiles.
      // Fall back to showing only the current user if available.
      if (userProfile) {
        setLeaderboard([{
          id: currentUser?.uid || '',
          username: userProfile.username || 'You',
          points: userProfile.points || 0,
          referrals: userProfile.referrals || 0,
          photoURL: userProfile.photoURL
        }]);
      }
      // Silently ignore — leaderboard is a non-critical feature
    }
  };

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyReferralCode = async () => {
    if (userProfile?.referralCode) {
      try {
        await navigator.clipboard.writeText(userProfile.referralCode);
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
      } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = userProfile.referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
      }
    }
  };

  const shareReferral = async () => {
    const shareText = ` Join Saksham AI - India's #1 AI-powered internship platform!\n\n Find perfect internships with AI matching\n Get personalized career guidance\n Access exclusive opportunities\n\nUse my referral code: ${userProfile?.referralCode}\n\n Sign up now: ${window.location.origin}?ref=${userProfile?.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Saksham AI - AI-Powered Internships',
          text: shareText,
          url: `${window.location.origin}?ref=${userProfile?.referralCode}`
        });
      } catch (err) {
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Referral message copied to clipboard' });
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: 'Copied!', description: 'Referral message copied to clipboard' });
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white shadow-sm';
      case 2: return 'bg-slate-400 text-white shadow-sm';
      case 3: return 'bg-amber-600 text-white shadow-sm';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="bg-background">
        <PageHeader title="Referral Program" subtitle="Invite friends and earn rewards together!" />
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="p-6 border rounded-lg bg-card space-y-6 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto" />
                <div className="h-6 w-32 bg-muted mx-auto rounded" />
                <div className="flex justify-center gap-4">
                  <div className="h-10 w-16 bg-muted rounded" />
                  <div className="h-10 w-16 bg-muted rounded" />
                </div>
                <div className="h-16 w-full bg-muted rounded mt-6" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="p-6 border rounded-lg bg-card space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-6" />
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHeader
        title="Referral Program"
        subtitle="Invite friends and earn rewards together!"
      />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Your Referral Stats */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Referrals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-16 h-16 rounded-full" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {(userProfile?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{userProfile?.username || 'User'}</h3>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{userProfile?.points || 0}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{userProfile?.referrals || 0}</div>
                      <div className="text-xs text-muted-foreground">Referrals</div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Your Referral Code</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-background rounded-lg font-mono text-lg font-bold text-center border">
                      {userProfile?.referralCode || 'Loading...'}
                    </div>
                    <Button variant="outline" size="sm" onClick={copyReferralCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button onClick={shareReferral} className="w-full bg-primary text-primary-foreground">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Referral Code
                </Button>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    How it works
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Share your referral code</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Friend signs up using your code</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> You both earn 100 points!</li>
                    <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Redeem points for rewards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Leaderboard
                  <Badge variant="secondary" className="ml-2">
                    Top {leaderboard.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((user, index) => {
                      const rank = index + 1;
                      const isCurrentUser = user.id === currentUser?.uid;
                      
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isCurrentUser 
                              ? 'bg-primary/10 border-primary/20' 
                              : 'bg-muted/50' 
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadge(rank)}`}>
                            {rank <= 3 ? getRankIcon(rank) : rank}
                          </div>
                          
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full" />
                            ) : (
                              <span className="font-bold text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-semibold flex items-center gap-2">
                              {user.username}
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.referrals} referrals
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-primary">{user.points}</div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users on leaderboard yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to earn points!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rewards Section */}
            <Card className="shadow-sm border-border/40 mt-6 lg:mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Rewards Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Premium Profile Badge</h4>
                      <Badge variant="outline">500 pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Stand out with a premium badge on your profile</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Priority Support</h4>
                      <Badge variant="outline">1000 pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Get faster response times for support queries</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Resume Review</h4>
                      <Badge variant="outline">1500 pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Professional resume review by experts</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Interview Prep Session</h4>
                      <Badge variant="outline">2500 pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">1-on-1 interview preparation with mentors</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" disabled>
                    <Gift className="w-4 h-4 mr-2" />
                    Redeem Rewards (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}