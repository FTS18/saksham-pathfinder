import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Download, Eye, MessageSquare, Star, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationService, Application } from '@/services/applicationService';
import InternshipMigrationService, { FirebaseInternship } from '@/services/internshipMigrationService';
import AdminService from '@/services/adminService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CandidateWithApplications {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profileImage?: string;
  applications: Application[];
  totalApplications: number;
  acceptedApplications: number;
}

export default function Candidates() {
  const { currentUser } = useAuth();
  const [candidates, setCandidates] = useState<CandidateWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [internships, setInternships] = useState<FirebaseInternship[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const loadCandidates = async () => {
      try {
        setLoading(true);

        // Check if admin
        const adminStatus = await AdminService.isAdmin(currentUser.uid);
        setIsAdmin(adminStatus);

        // Get recruiter's internships
        const internshipsData = adminStatus
          ? await InternshipMigrationService.getAllInternships()
          : await InternshipMigrationService.getRecruiterInternships(currentUser.uid);

        setInternships(internshipsData);

        // Get applications for these internships
        const internshipIds = internshipsData.map(i => i.id);
        const applicationsData = await ApplicationService.getRecruiterApplications(
          currentUser.uid,
          internshipIds
        );

        // Group applications by user to get unique candidates
        const candidateMap = new Map<string, CandidateWithApplications>();

        for (const application of applicationsData) {
          if (!candidateMap.has(application.userId)) {
            // Fetch candidate profile data
            try {
              const profileRef = doc(db, 'profiles', application.userId);
              const profileSnap = await getDoc(profileRef);
              const profileData = profileSnap.data();

              candidateMap.set(application.userId, {
                userId: application.userId,
                name: profileData?.displayName || 'Unknown Candidate',
                email: profileData?.email || application.userId,
                phone: profileData?.phone || undefined,
                location: typeof profileData?.location === 'string' 
                  ? profileData.location 
                  : profileData?.location?.city || undefined,
                profileImage: profileData?.profileImage || undefined,
                applications: [],
                totalApplications: 0,
                acceptedApplications: 0
              });
            } catch (error) {
              console.error('Error fetching profile:', error);
              // Create basic candidate entry without profile
              candidateMap.set(application.userId, {
                userId: application.userId,
                name: 'Unknown Candidate',
                email: application.userId,
                applications: [],
                totalApplications: 0,
                acceptedApplications: 0
              });
            }
          }

          const candidate = candidateMap.get(application.userId)!;
          candidate.applications.push(application);
          candidate.totalApplications += 1;
          if (application.status === 'accepted' || application.status === 'shortlisted') {
            candidate.acceptedApplications += 1;
          }
        }

        setCandidates(Array.from(candidateMap.values()));
      } catch (error) {
        console.error('Error loading candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [currentUser?.uid]);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === 'all' ||
      candidate.location?.toLowerCase() === locationFilter.toLowerCase();
    return matchesSearch && matchesLocation;
  });

  const stats = {
    total: candidates.length,
    hired: candidates.reduce((sum, c) => sum + c.acceptedApplications, 0),
    underReview: candidates.length - candidates.filter(c => c.acceptedApplications > 0).length,
    avgRating: 4.5
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Manage candidates who have applied to your internships</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
              <Star className="w-5 h-5 fill-blue-600" />
              {stats.avgRating}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {Array.from(new Set(candidates.map(c => c.location).filter(Boolean))).map((loc) => (
              <SelectItem key={loc} value={loc || ''}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Application Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates Grid */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {searchTerm || locationFilter !== 'all'
                ? 'No candidates match your filters'
                : 'No candidates have applied yet'}
            </CardContent>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.userId} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <Avatar className="w-12 h-12 mt-1">
                      <AvatarImage src={candidate.profileImage} />
                      <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{candidate.email}</p>

                      <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                        {candidate.phone && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {candidate.phone}
                          </span>
                        )}
                        {candidate.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {candidate.location}
                          </span>
                        )}
                      </div>

                      {/* Applications Summary */}
                      <div className="flex gap-4 text-sm">
                        <Badge variant="outline">
                          Applied: {candidate.totalApplications}
                        </Badge>
                        {candidate.acceptedApplications > 0 && (
                          <Badge className="bg-green-100 text-green-800">
                            Accepted: {candidate.acceptedApplications}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/profile/${candidate.userId}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button variant="outline" size="sm">
                        Shortlist
                      </Button>
                      <Button variant="outline" size="sm">
                        Interview
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}