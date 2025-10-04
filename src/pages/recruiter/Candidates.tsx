import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Download, Eye, MessageSquare, Star, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { applicationService } from '@/services/applicationService';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  skills: string[];
  appliedInternships: {
    id: string;
    title: string;
    company: string;
    appliedDate: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  }[];
  resume?: string;
  profileImage?: string;
  rating: number;
  availability: string;
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      // Generate realistic candidate data based on applications
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Arjun Sharma',
          email: 'arjun.sharma@gmail.com',
          phone: '+91 9876543210',
          location: 'Bengaluru, Karnataka',
          education: 'B.Tech Computer Science - VIT University (2024)',
          experience: '1.5 years',
          skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'],
          appliedInternships: [
            {
              id: 'int1',
              title: 'Software Developer Intern',
              company: 'Infosys',
              appliedDate: '2025-01-15',
              status: 'pending'
            },
            {
              id: 'int7',
              title: 'Network Engineering Intern',
              company: 'Reliance Jio',
              appliedDate: '2025-01-10',
              status: 'accepted'
            }
          ],
          rating: 4.5,
          availability: 'Immediate'
        },
        {
          id: '2',
          name: 'Priya Patel',
          email: 'priya.patel@gmail.com',
          phone: '+91 9876543211',
          location: 'Mumbai, Maharashtra',
          education: 'MBA Marketing - IIM Ahmedabad (2024)',
          experience: '2 years',
          skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media'],
          appliedInternships: [
            {
              id: 'int4',
              title: 'Marketing Intern',
              company: 'HUL',
              appliedDate: '2025-01-14',
              status: 'accepted'
            }
          ],
          rating: 4.8,
          availability: '2 weeks notice'
        },
        {
          id: '3',
          name: 'Rohit Kumar',
          email: 'rohit.kumar@gmail.com',
          phone: '+91 9876543212',
          location: 'Delhi, NCR',
          education: 'B.Com Finance - Delhi University (2023)',
          experience: '1 year',
          skills: ['Financial Analysis', 'Excel', 'PowerBI', 'Accounting', 'Risk Assessment'],
          appliedInternships: [
            {
              id: 'int2',
              title: 'Financial Analyst Intern',
              company: 'HDFC Bank',
              appliedDate: '2025-01-12',
              status: 'pending'
            },
            {
              id: 'int8',
              title: 'Audit Intern',
              company: 'PwC',
              appliedDate: '2025-01-08',
              status: 'rejected'
            }
          ],
          rating: 4.2,
          availability: 'Immediate'
        },
        {
          id: '4',
          name: 'Sneha Reddy',
          email: 'sneha.reddy@gmail.com',
          phone: '+91 9876543213',
          location: 'Hyderabad, Telangana',
          education: 'B.Tech Mechanical - BITS Pilani (2024)',
          experience: '6 months',
          skills: ['AutoCAD', 'SolidWorks', 'Project Management', 'Quality Control', 'Manufacturing'],
          appliedInternships: [
            {
              id: 'int3',
              title: 'Automotive Engineering Intern',
              company: 'Maruti Suzuki',
              appliedDate: '2025-01-11',
              status: 'pending'
            }
          ],
          rating: 4.6,
          availability: '1 month notice'
        },
        {
          id: '5',
          name: 'Vikash Singh',
          email: 'vikash.singh@gmail.com',
          phone: '+91 9876543214',
          location: 'Chennai, Tamil Nadu',
          education: 'B.Tech Civil Engineering - IIT Madras (2023)',
          experience: '1.2 years',
          skills: ['Civil Engineering', 'Project Management', 'AutoCAD', 'Construction', 'Site Planning'],
          appliedInternships: [
            {
              id: 'int5',
              title: 'Civil Engineering Intern',
              company: 'L&T',
              appliedDate: '2025-01-09',
              status: 'accepted'
            }
          ],
          rating: 4.7,
          availability: 'Immediate'
        },
        {
          id: '6',
          name: 'Ananya Gupta',
          email: 'ananya.gupta@gmail.com',
          phone: '+91 9876543215',
          location: 'Pune, Maharashtra',
          education: 'BBA Healthcare Management - Symbiosis (2024)',
          experience: '8 months',
          skills: ['Healthcare Administration', 'Patient Relations', 'Data Entry', 'Communication', 'Operations'],
          appliedInternships: [
            {
              id: 'int6',
              title: 'Hospital Operations Intern',
              company: 'Apollo Hospitals',
              appliedDate: '2025-01-13',
              status: 'pending'
            }
          ],
          rating: 4.3,
          availability: '2 weeks notice'
        }
      ];
      
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkill = skillFilter === 'all' || candidate.skills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    );
    
    const matchesLocation = locationFilter === 'all' || candidate.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesSkill && matchesLocation;
  });

  const getUniqueSkills = () => {
    const allSkills = candidates.flatMap(c => c.skills);
    return [...new Set(allSkills)].slice(0, 10); // Top 10 skills
  };

  const getUniqueLocations = () => {
    const allLocations = candidates.map(c => c.location.split(',')[0]);
    return [...new Set(allLocations)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Candidates
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
            <div className="text-sm text-muted-foreground">Total Candidates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter(c => c.appliedInternships.some(app => app.status === 'accepted')).length}
            </div>
            <div className="text-sm text-muted-foreground">Hired</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {candidates.filter(c => c.appliedInternships.some(app => app.status === 'pending')).length}
            </div>
            <div className="text-sm text-muted-foreground">Under Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {(candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {getUniqueSkills().map(skill => (
              <SelectItem key={skill} value={skill}>{skill}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {getUniqueLocations().map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={candidate.profileImage} />
                    <AvatarFallback className="text-lg">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{candidate.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{candidate.rating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <p className="text-muted-foreground">{candidate.email}</p>
                        <p className="text-muted-foreground">{candidate.phone}</p>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Available: {candidate.availability}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-sm">{candidate.education}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Experience: {candidate.experience}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Applied Internships */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Applied Internships ({candidate.appliedInternships.length})
                      </p>
                      <div className="space-y-2">
                        {candidate.appliedInternships.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{application.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {application.company} • Applied {new Date(application.appliedDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCandidates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No candidates found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}