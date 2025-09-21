import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin, Briefcase, GraduationCap, ExternalLink, Github, Linkedin, Globe, Twitter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicUserProfile {
  username: string;
  displayUsername: string;
  photoURL: string;
  dateOfBirth: string;
  skills: string[];
  sectors: string[];
  education: { degree: string; institution: string; year: string; }[];
  experience: { title: string; company: string; duration: string; }[];
  bio: string;
  location: { state: string; city: string; } | string;
  socialLinks: {
    portfolio: string;
    linkedin: string;
    github: string;
    twitter: string;
    codechef: string;
    leetcode: string;
  };
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username) {
      loadPublicProfile(username);
    }
  }, [username]);

  const loadPublicProfile = async (username: string) => {
    setLoading(true);
    setNotFound(false);
    
    try {
      // Query profiles collection by username
      const q = query(collection(db, 'profiles'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setNotFound(true);
        return;
      }
      
      const profileData = querySnapshot.docs[0].data() as PublicUserProfile;
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading public profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'portfolio': return <Globe className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getSocialUrl = (platform: string, value: string) => {
    if (!value) return '';
    
    switch (platform) {
      case 'github': return value.startsWith('http') ? value : `https://github.com/${value}`;
      case 'linkedin': return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
      case 'twitter': return value.startsWith('http') ? value : `https://twitter.com/${value}`;
      case 'codechef': return value.startsWith('http') ? value : `https://codechef.com/users/${value}`;
      case 'leetcode': return value.startsWith('http') ? value : `https://leetcode.com/${value}`;
      case 'portfolio': return value.startsWith('http') ? value : `https://${value}`;
      default: return value;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-20">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl pt-20">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">
            The user @{username} doesn't exist or their profile is private.
          </p>
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
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials(profile.displayUsername || profile.username)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.displayUsername || profile.username}
                </h1>
                <p className="text-muted-foreground mb-1">@{profile.username}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {typeof profile.location === 'string' 
                          ? profile.location 
                          : profile.location?.city 
                            ? `${profile.location.city}${profile.location.state ? ', ' + profile.location.state : ''}` 
                            : 'Location'
                        }
                      </span>
                    </div>
                  )}
                  {profile.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {(() => {
                          try {
                            const birthYear = new Date(profile.dateOfBirth).getFullYear();
                            const age = new Date().getFullYear() - birthYear;
                            return isNaN(age) || age < 0 || age > 100 ? null : `${age} years old`;
                          } catch {
                            return null;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-foreground">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills & Sectors */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.sectors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Sectors</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.sectors.map((sector, index) => (
                      <Badge key={index} variant="default" className="rounded-none">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="rounded-none">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(profile.socialLinks).map(([platform, value]) => {
                  if (!value) return null;
                  
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <a
                        href={getSocialUrl(platform, value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {getSocialIcon(platform)}
                        <span className="capitalize">{platform}</span>
                      </a>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Education & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="text-sm text-muted-foreground">
                        {edu.institution} • {edu.year}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                      <div className="text-sm text-muted-foreground">
                        {exp.company} • {exp.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;