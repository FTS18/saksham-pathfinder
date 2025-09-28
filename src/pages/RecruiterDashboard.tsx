import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Briefcase, Download, Users, Trophy, Clock, Star, MapPin, DollarSign } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface Internship {
  id: string;
  title: string;
  company: string;
  description: string;
  duration: string;
  stipend: string;
  location: string;
  requirements: string[];
  skills: string[];
  sector: string;
  type: 'internship' | 'job';
  status: 'active' | 'closed';
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  createdAt: Date;
  updatedAt: Date;
  applicationCount: number;
}

interface Application {
  id: string;
  internshipId: string;
  candidateId: string;
  recruiterId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  appliedDate: Date;
  coverLetter?: string;
}

interface Candidate {
  id: string;
  displayName: string;
  email: string;
  skills: string[];
  education?: {
    degree: string;
    institution: string;
    cgpa: number;
  };
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  bio?: string;
}

const RecruiterDashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInternship, setNewInternship] = useState({
    title: '',
    company: '',
    description: '',
    duration: '',
    stipend: '',
    location: '',
    requirements: '',
    skills: '',
    sector: '',
    type: 'internship' as const,
    status: 'active' as const,
  });

  useEffect(() => {
    if (currentUser) {
      fetchInternships();
      fetchApplications();
    }
  }, [currentUser]);

  const fetchInternships = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'internships'),
        where('recruiterId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const internshipData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Internship[];
      setInternships(internshipData);
    } catch (error) {
      console.error('Error fetching internships:', error);
    }
  };

  const fetchApplications = async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, 'applications'),
        where('recruiterId', '==', currentUser.uid),
        orderBy('appliedDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const applicationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        appliedDate: doc.data().appliedDate?.toDate() || new Date()
      })) as Application[];
      setApplications(applicationData);
      
      // Fetch candidate details
      const candidateIds = [...new Set(applicationData.map(app => app.candidateId))];
      const candidatePromises = candidateIds.map(async (id) => {
        const docRef = doc(db, 'profiles', id);
        const docSnap = await getDoc(docRef);
        return { id, ...docSnap.data() } as Candidate;
      });
      const candidateData = await Promise.all(candidatePromises);
      setCandidates(candidateData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInternship((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const internshipData = {
        ...newInternship,
        requirements: newInternship.requirements.split(',').map(r => r.trim()),
        skills: newInternship.skills.split(',').map(s => s.trim()),
        recruiterId: currentUser.uid,
        recruiterName: currentUser.displayName || 'Unknown',
        recruiterEmail: currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 0
      };
      
      await addDoc(collection(db, 'internships'), internshipData);
      
      toast({
        title: "Success",
        description: "Internship posted successfully!"
      });
      
      setNewInternship({
        title: '',
        company: '',
        description: '',
        duration: '',
        stipend: '',
        location: '',
        requirements: '',
        skills: '',
        sector: '',
        type: 'internship',
        status: 'active'
      });
      
      setDialogOpen(false);
      fetchInternships();
    } catch (error) {
      console.error('Error adding internship:', error);
      toast({
        title: "Error",
        description: "Failed to post internship",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (application: Application, internship: Internship) => {
    const candidate = candidates.find(c => c.id === application.candidateId);
    if (!candidate) return 0;

    const weights = {
      skills: 0.5,
      education: 0.2,
      experience: 0.2,
      profile: 0.1
    };

    // Skills matching
    const candidateSkills = candidate.skills || [];
    const requiredSkills = internship.skills || [];
    const skillsMatch = requiredSkills.filter(skill => 
      candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
    ).length / Math.max(requiredSkills.length, 1);

    // Education score (based on degree level and CGPA)
    const educationScore = candidate.education?.cgpa ? 
      Math.min(candidate.education.cgpa / 10, 1) : 0.7;

    // Experience score (based on internships/projects)
    const experienceScore = Math.min((candidate.experience?.length || 0) / 3, 1);

    // Profile completeness
    const profileScore = [
      candidate.displayName,
      candidate.email,
      candidate.skills?.length,
      candidate.education,
      candidate.bio
    ].filter(Boolean).length / 5;

    return Math.round(
      (skillsMatch * 100 * weights.skills) +
      (educationScore * 100 * weights.education) +
      (experienceScore * 100 * weights.experience) +
      (profileScore * 100 * weights.profile)
    );
  };

  const exportData = () => {
    if (!selectedInternship) return;
    
    const internshipApplications = applications.filter(app => app.internshipId === selectedInternship.id);
    const data = internshipApplications.map(app => {
      const candidate = candidates.find(c => c.id === app.candidateId);
      return {
        name: candidate?.displayName || 'Unknown',
        email: candidate?.email || 'Unknown',
        score: calculateScore(app, selectedInternship),
        status: app.status,
        appliedDate: app.appliedDate.toLocaleDateString(),
        skills: candidate?.skills?.join(', ') || 'None'
      };
    });

    const csv = [
      ['Name', 'Email', 'Score', 'Status', 'Applied Date', 'Skills'],
      ...data.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${selectedInternship.title.replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  const getInternshipApplications = (internshipId: string) => {
    return applications.filter(app => app.internshipId === internshipId);
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const docRef = doc(db, 'applications', applicationId);
      await updateDoc(docRef, { status, updatedAt: new Date() });
      
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));
      
      toast({
        title: "Success",
        description: "Application status updated"
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <Breadcrumbs />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Briefcase className="w-4 h-4 mr-2" />
              Post New Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Post a New Internship</DialogTitle>
              <DialogDescription>
                Fill in the details of the internship opportunity
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddInternship} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g., Frontend Developer Intern"
                    value={newInternship.title}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    name="company"
                    placeholder="e.g., Google"
                    value={newInternship.company}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Describe the internship role and responsibilities"
                  value={newInternship.description}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    name="duration"
                    placeholder="e.g., 3 months"
                    value={newInternship.duration}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stipend">Stipend</Label>
                  <Input 
                    id="stipend" 
                    name="stipend"
                    placeholder="e.g., ₹15000/month"
                    value={newInternship.stipend}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location"
                  placeholder="e.g., Bangalore (or Remote)"
                  value={newInternship.location}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                <Input 
                  id="requirements" 
                  name="requirements"
                  placeholder="e.g., Bachelor's degree, Good communication, Problem solving"
                  value={newInternship.requirements}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input 
                  id="skills" 
                  name="skills"
                  placeholder="e.g., React, TypeScript, Node.js"
                  value={newInternship.skills}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input 
                  id="sector" 
                  name="sector"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  value={newInternship.sector}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Posting...' : 'Post Internship'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="internships">Internships</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Active Internships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {internships.filter(i => i.status === 'active').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Currently accepting applications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {applications.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Across all internships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  High-Score Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {applications.filter(app => {
                    const internship = internships.find(i => i.id === app.internshipId);
                    return internship && calculateScore(app, internship) > 80;
                  }).length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Score above 80%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="internships">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Internships</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {internships
                  .filter(i => filterStatus === 'all' || i.status === filterStatus)
                  .map((internship) => {
                    const internshipApplications = getInternshipApplications(internship.id);
                    const avgScore = internshipApplications.length > 0 ? 
                      Math.round(internshipApplications.reduce((acc, app) => 
                        acc + calculateScore(app, internship), 0) / internshipApplications.length) : 0;
                    
                    return (
                      <div
                        key={internship.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedInternship(internship)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{internship.company}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {internship.duration}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {internship.location}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {internship.stipend}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Applications: <strong>{internshipApplications.length}</strong></span>
                              {avgScore > 0 && (
                                <span>Avg Score: <strong>{avgScore}%</strong></span>
                              )}
                              <span>Posted: {internship.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={internship.status === 'active' ? 'default' : 'secondary'}>
                              {internship.status}
                            </Badge>
                            {avgScore > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs">{avgScore}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Applications & Rankings</CardTitle>
                {selectedInternship && (
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedInternship ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedInternship.title}</h3>
                    <Badge variant="outline">
                      {getInternshipApplications(selectedInternship.id).length} Applications
                    </Badge>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Skills Match</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getInternshipApplications(selectedInternship.id)
                        .sort((a, b) => calculateScore(b, selectedInternship) - calculateScore(a, selectedInternship))
                        .map((application, index) => {
                          const candidate = candidates.find(c => c.id === application.candidateId);
                          const score = calculateScore(application, selectedInternship);
                          const skillsMatch = candidate?.skills ? 
                            Math.round(selectedInternship.skills.filter(skill => 
                              candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
                            ).length / selectedInternship.skills.length * 100) : 0;
                          
                          return (
                            <TableRow key={application.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {index + 1}
                                  {index < 3 && <Trophy className="w-4 h-4 text-yellow-500" />}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{candidate?.displayName || 'Unknown'}</div>
                                  <div className="text-sm text-muted-foreground">{candidate?.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={skillsMatch > 70 ? 'default' : skillsMatch > 40 ? 'secondary' : 'outline'}>
                                  {skillsMatch}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{candidate?.education?.degree || 'N/A'}</div>
                                  <div className="text-muted-foreground">
                                    {candidate?.education?.cgpa ? `${candidate.education.cgpa} CGPA` : ''}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {candidate?.experience?.length || 0} projects
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={application.status} 
                                  onValueChange={(value) => updateApplicationStatus(application.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={score > 80 ? 'default' : score > 60 ? 'secondary' : 'outline'}>
                                  {score}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  asChild
                                >
                                  <a 
                                    href={`/u/${candidate?.displayName?.toLowerCase().replace(/\s+/g, '') || candidate?.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Profile
                                  </a>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Internship Selected</h3>
                  <p className="text-muted-foreground">
                    Select an internship from the list to view applications and candidate rankings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default RecruiterDashboard;