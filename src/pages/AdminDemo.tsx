import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createDemoRecruiterAndInternships } from '@/utils/createDemoData';
import { Database, Users, Briefcase, Shield } from 'lucide-react';

const AdminDemo = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123') {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin demo panel"
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  const handleCreateDemoData = async () => {
    setLoading(true);
    try {
      const result = await createDemoRecruiterAndInternships();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Demo Access</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter credentials to access demo data creation
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Demo Credentials: admin / 123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Demo Panel</h1>
            <p className="text-muted-foreground">
              Create demo data for testing the recruiter portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Demo Recruiter Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> admin@demo.com</p>
                  <p><strong>Company:</strong> Demo Tech Solutions</p>
                  <p><strong>Position:</strong> HR Manager</p>
                  <p><strong>Location:</strong> Bangalore, India</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Demo Internships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p>• Frontend Developer - Microsoft</p>
                  <p>• Data Science - Google</p>
                  <p>• Digital Marketing - Amazon</p>
                  <p>• Mobile App Developer - Flipkart</p>
                  <p>• UI/UX Design - Zomato</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Create Demo Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will create a demo recruiter account and 5 sample internships in the database.
                The recruiter can be accessed with the credentials above.
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• This will add real data to your Firestore database</li>
                  <li>• The demo recruiter account will be created with ID: demo-recruiter-123</li>
                  <li>• All internships will be marked as active and available for applications</li>
                  <li>• You can login as the recruiter using admin@demo.com (any password)</li>
                </ul>
              </div>

              <Button 
                onClick={handleCreateDemoData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating Demo Data...' : 'Create Demo Data'}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
            >
              Logout from Admin Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDemo;