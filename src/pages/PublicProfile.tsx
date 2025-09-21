import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { User, MapPin, Mail, Phone, ExternalLink, Github, Linkedin, Globe, Share2 } from 'lucide-react';
import { ShareProfileBanner } from '../components/ShareProfileBanner';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      
      try {
        // Query profiles collection by username
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const profileDoc = querySnapshot.docs[0];
          setProfile({ id: profileDoc.id, ...profileDoc.data() });
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

  if (loading) {
    return (
      <div className="min-h-screen hero-gradient pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen hero-gradient pt-16 flex items-center justify-center">
        <Card className="glass-card max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The profile @{username} doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen hero-gradient pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Profile Header */}
        <Card className="glass-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {getInitials(profile.username)}
                  </span>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.username || 'Anonymous User'}
                  </h1>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareBanner(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <p className="text-xl text-primary mb-2">{profile.studentId || 'Student'}</p>
                {profile.bio && (
                  <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                )}
                
                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                  {profile.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{typeof profile.location === 'string' ? profile.location : 
                        `${profile.location.city}, ${profile.location.country}`}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${profile.email}`} className="hover:text-primary">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${profile.phone}`} className="hover:text-primary">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sectors */}
          {profile.sectors?.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Interested Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.sectors.map((sector: string, index: number) => (
                    <Badge key={index} variant="outline">{sector}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.education?.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-sm text-muted-foreground">{edu.institution}</div>
                      <div className="text-xs text-muted-foreground">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {profile.experience?.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <div className="font-medium">{exp.title}</div>
                      <div className="text-sm text-muted-foreground">{exp.company}</div>
                      <div className="text-xs text-muted-foreground">{exp.duration}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Social Links & Resume */}
        {(profile.socialLinks || profile.resumeURL) && (
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle>Links & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {profile.socialLinks?.portfolio && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                {profile.socialLinks?.github && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profile.socialLinks?.linkedin && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.resumeURL && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.resumeURL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Resume
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {showShareBanner && (
          <ShareProfileBanner
            profile={{
              username: profile.username,
              displayName: profile.displayName || profile.username,
              photoURL: profile.photoURL,
              uniqueUserId: profile.uniqueUserId,
              bio: profile.bio,
              skills: profile.skills,
              location: profile.location
            }}
            onClose={() => setShowShareBanner(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PublicProfile;