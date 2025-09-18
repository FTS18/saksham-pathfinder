import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, ExternalLink, User, GraduationCap, Briefcase, Share2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserIdByUsername } from '@/lib/username';
import { useToast } from '@/hooks/use-toast';

interface PublicProfile {
  username: string;
  displayUsername: string;
  email: string;
  phone: string;
  photoURL: string;
  bio: string;
  skills: string[];
  sectors: string[];
  location: { country: string; state: string; city: string; };
  education: { degree: string; institution: string; year: string; }[];
  experience: { title: string; company: string; duration: string; }[];
  socialLinks: {
    portfolio: string;
    linkedin: string;
    github: string;
    twitter: string;
    codechef: string;
    leetcode: string;
  };
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      
      try {
        // Get user ID by username
        const userId = await getUserIdByUsername(username);
        if (!userId) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // Get user profile
        const docRef = doc(db, 'profiles', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data() as PublicProfile;
          setProfile(userData);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/u/${username}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayUsername || username}'s Profile`,
          text: `Check out ${profile?.displayUsername || username}'s profile on Saksham AI`,
          url: url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'Profile link copied to clipboard' });
      } catch (error) {
        toast({ title: 'Share', description: url });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-20">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="text-2xl font-bold">{getInitials(profile.username)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{profile.displayUsername || profile.username}</h1>
                    <Button variant="outline" size="sm" onClick={shareProfile}>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  <p className="text-muted-foreground mt-2">{profile.bio}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location.city}, {profile.location.country}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {profile.socialLinks.portfolio && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                  {profile.socialLinks.linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {profile.socialLinks.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noopener noreferrer">
                        GitHub
                      </a>
                    </Button>
                  )}
                  {profile.socialLinks.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                        Twitter
                      </a>
                    </Button>
                  )}
                  {profile.socialLinks.codechef && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://codechef.com/users/${profile.socialLinks.codechef}`} target="_blank" rel="noopener noreferrer">
                        CodeChef
                      </a>
                    </Button>
                  )}
                  {profile.socialLinks.leetcode && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://leetcode.com/${profile.socialLinks.leetcode}`} target="_blank" rel="noopener noreferrer">
                        LeetCode
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sectors & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sectors of Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.sectors.map((sector, index) => (
                  <Badge key={index} variant="outline">{sector}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education */}
        {profile.education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {profile.experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <div className="font-medium">{exp.title}</div>
                    <div className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;