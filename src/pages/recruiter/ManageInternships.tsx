import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import InternshipMigrationService, { FirebaseInternship } from '@/services/internshipMigrationService';
import { InternshipForm } from '@/components/recruiter/InternshipForm';
import { ApplicationTracker } from '@/components/recruiter/ApplicationTracker';
import { useAuth } from '@/contexts/AuthContext';
import AdminService from '@/services/adminService';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export default function ManageInternships() {
  const { currentUser } = useAuth();
  const [internships, setInternships] = useState<FirebaseInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInternship, setSelectedInternship] = useState<FirebaseInternship | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationCounts, setApplicationCounts] = useState<{ [key: string]: number }>({});
  const itemsPerPage = 10;

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Check if user is admin
    const checkAdmin = async () => {
      const adminStatus = await AdminService.isAdmin(currentUser.uid);
      setIsAdmin(adminStatus);
      
      // Load internships based on admin status
      try {
        setLoading(true);
        const q = adminStatus
          ? query(collection(db, 'internships'), orderBy('createdAt', 'desc'))
          : query(
              collection(db, 'internships'),
              where('recruiterId', '==', currentUser.uid),
              orderBy('createdAt', 'desc')
            );
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const internshipsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date()
          } as FirebaseInternship));
          
          setInternships(internshipsList);
          
          // Fetch real application counts for each internship
          const counts: { [key: string]: number } = {};
          for (const internship of internshipsList) {
            if (internship.id) {
              const applicationsQuery = query(
                collection(db, 'applications'),
                where('internshipId', '==', internship.id)
              );
              const applicationsSnapshot = await onSnapshot(applicationsQuery, (appSnap) => {
                counts[internship.id!] = appSnap.size;
                setApplicationCounts({...counts});
              });
            }
          }
          
          setLoading(false);
        }, (error) => {
          console.error('Error listening to internships:', error);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up internships query:', error);
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [currentUser?.uid]);

  const loadInternships = async () => {
    // This function is now handled by the real-time listener
    // Keeping it for manual refresh if needed
    try {
      setLoading(true);
      const data = await InternshipMigrationService.getAllInternships();
      setInternships(data);
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;
    
    try {
      await InternshipMigrationService.deleteInternship(id);
      // No need to refresh - real-time listener will update automatically
    } catch (error) {
      console.error('Failed to delete internship:', error);
    }
  };

  const handleEdit = (internship: FirebaseInternship) => {
    setSelectedInternship(internship);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedInternship(null);
    setIsFormOpen(true);
  };

  const filteredInternships = internships.filter(internship => {
    const locationStr = typeof internship.location === 'string' 
      ? internship.location 
      : internship.location?.city || '';
    
    return internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInternships = filteredInternships.slice(startIndex, endIndex);

  const totalApplications = Object.values(applicationCounts).reduce((sum, count) => sum + count, 0);

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
        <h1 className="text-3xl font-bold">Manage Internships</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsTrackerOpen(true)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Application Tracker
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Internship
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{internships.length}</div>
            <div className="text-sm text-muted-foreground">Total Internships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {internships.filter(i => i.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{totalApplications}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {internships.reduce((sum, i) => sum + (i.viewCount || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {/* Internships List with Pagination */}
      <div className="grid gap-4">
        {paginatedInternships.map((internship) => (
          <Card key={internship.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{internship.title}</h3>
                    <Badge variant={internship.status === 'active' ? 'default' : 'secondary'}>
                      {internship.status}
                    </Badge>
                    {internship.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    {internship.company} • {typeof internship.location === 'string' ? internship.location : internship.location?.city}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">{internship.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {internship.required_skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {internship.required_skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{internship.required_skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Stipend: {internship.stipend}</span>
                    <span>Duration: {internship.duration}</span>
                    <span className="font-semibold text-primary">Applications: {applicationCounts[internship.id!] || 0}</span>
                    <span>Views: {internship.viewCount || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(internship)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(internship.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedInternship ? 'Edit Internship' : 'Add New Internship'}
            </DialogTitle>
          </DialogHeader>
          <InternshipForm
            internship={selectedInternship}
            onSave={() => {
              setIsFormOpen(false);
              // No need to refresh - real-time listener will update automatically
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Application Tracker Dialog */}
      <Dialog open={isTrackerOpen} onOpenChange={setIsTrackerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Tracker</DialogTitle>
          </DialogHeader>
          <ApplicationTracker />
        </DialogContent>
      </Dialog>
    </div>
  );
}