import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  BookOpen, 
  Briefcase,
  Bell,
  MapPin,
  Star,
  Zap,
  Users,
  BarChart3,
  Plus,
  ExternalLink,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    profileCompletion: 0,
    aiMatchScore: 0,
    applications: { applied: 0, pending: 0, accepted: 0 },
    points: 0,
    skills: [],
    topInternships: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user profile data
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      // Calculate profile completion
      const profileFields = ['name', 'email', 'skills', 'interests', 'location'];
      const completedFields = profileFields.filter(field => userProfile[field] && userProfile[field].length > 0);
      const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);
      
      // Get top internships from Firebase
      const internshipsQuery = query(
        collection(db, 'internships'),
        orderBy('posted_date', 'desc'),
        limit(3)
      );
      const internshipsSnapshot = await getDocs(internshipsQuery);
      const topInternships = internshipsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Mock AI score based on profile completeness and skills
      const aiScore = Math.min(95, profileCompletion + (userProfile.skills?.length || 0) * 2);
      
      // Get user points from localStorage
      const userPoints = parseInt(localStorage.getItem('userPoints') || '0');
      
      setDashboardData({
        profileCompletion,
        aiMatchScore: aiScore,
        applications: {
          applied: wishlist.length,
          pending: Math.floor(wishlist.length * 0.7),
          accepted: Math.floor(wishlist.length * 0.2)
        },
        points: userPoints || 1250,
        skills: userProfile.skills?.slice(0, 3).map(skill => ({
          name: skill,
          progress: Math.floor(Math.random() * 30) + 60
        })) || [],
        topInternships: topInternships.slice(0, 3),
        notifications: [
          { message: 'New match found!', time: '2 hours ago', icon: 'Target' },
          { message: 'Application accepted', time: '1 day ago', icon: 'CheckCircle' }
        ]
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {getGreeting()}, {currentUser?.displayName || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your internship journey today.
              </p>
            </div>
            {currentUser?.email === 'dubeyananay@gmail.com' && (
              <Button 
                variant="destructive" 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={async () => {
                  if (confirm('⚠️ This will delete ALL data from Firebase and localStorage. Are you sure?')) {
                    try {
                      const { completeReset } = await import('../utils/firebaseAdmin.js');
                      await completeReset();
                      alert('✅ Database cleared! Please refresh the page.');
                      window.location.reload();
                    } catch (error) {
                      alert('❌ Error: ' + error.message);
                    }
                  }
                }}
              >
                🗑️ Clear Database
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Profile Completion */}
          <Card className="bg-primary/10 dark:bg-primary/5 shadow-sm border border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Complete</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? '...' : dashboardData.profileCompletion}%</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2 text-primary hover:text-primary/80"
                onClick={() => navigate('/profile')}
              >
                Complete Profile →
              </Button>
            </CardContent>
          </Card>

          {/* AI Match Score */}
          <Card className="bg-green-500/10 dark:bg-green-500/5 shadow-sm border border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Match Score</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? '...' : dashboardData.aiMatchScore}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2 text-green-400 hover:text-green-300"
                onClick={() => navigate('/')}
              >
                View Matches →
              </Button>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card className="bg-yellow-500/10 dark:bg-yellow-500/5 shadow-sm border border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? '...' : dashboardData.points}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Rank #{Math.floor(dashboardData.points / 30) || 42}</p>
            </CardContent>
          </Card>

          {/* Applications */}
          <Card className="bg-purple-500/10 dark:bg-purple-500/5 shadow-sm border border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold text-foreground">{loading ? '...' : dashboardData.applications.applied}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-yellow-600">Pending: {dashboardData.applications.pending}</span>
                <span className="text-green-600">Accepted: {dashboardData.applications.accepted}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Apply Section */}
            <Card className="bg-orange-500/10 dark:bg-orange-500/5 shadow-sm border border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Zap className="w-5 h-5 mr-2 text-orange-500" />
                  Quick Apply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(loading ? [
                    { company: 'Loading...', role: 'Please wait', match: '...', logo: '⏳' },
                    { company: 'Loading...', role: 'Please wait', match: '...', logo: '⏳' },
                    { company: 'Loading...', role: 'Please wait', match: '...', logo: '⏳' }
                  ] : dashboardData.topInternships.length > 0 ? dashboardData.topInternships.map(internship => ({
                    company: internship.company,
                    role: internship.title || internship.role,
                    match: Math.floor(Math.random() * 20 + 75) + '%',
                    logo: internship.company === 'Google' ? '🔵' : internship.company === 'Microsoft' ? '🟦' : '🟠'
                  })) : [
                    { company: 'Google', role: 'SWE Intern', match: '95%', logo: '🔵' },
                    { company: 'Microsoft', role: 'PM Intern', match: '88%', logo: '🟦' },
                    { company: 'Amazon', role: 'Data Intern', match: '82%', logo: '🟠' }
                  ]).map((job, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{job.logo}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{job.company}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.role}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {job.match}
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate('/')}
                      >
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills Progress */}
            <Card className="bg-blue-500/10 dark:bg-blue-500/5 shadow-sm border border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    Skills Progress
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading skills...</div>
                  ) : dashboardData.skills.length > 0 ? (
                    dashboardData.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>No skills added yet</p>
                      <Button variant="link" onClick={() => navigate('/profile')}>Add Skills</Button>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/profile')}
                >
                  Add More Skills
                </Button>
              </CardContent>
            </Card>

            {/* Career Roadmap */}
            <Card className="bg-pink-500/10 dark:bg-pink-500/5 shadow-sm border border-pink-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                  Career Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  {['Intern', 'Junior Dev', 'Senior Dev', 'Tech Lead'].map((stage, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${index <= 0 ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <span className={`text-sm mt-2 ${index <= 0 ? 'text-pink-500 font-semibold' : 'text-gray-500'}`}>
                          {stage}
                        </span>
                      </div>
                      {index < 3 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2"></div>}
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-pink-500 hover:bg-pink-600">
                  Explore Career Paths
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Upcoming Deadlines */}
            <Card className="bg-indigo-500/10 dark:bg-indigo-500/5 shadow-sm border border-indigo-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData.topInternships.length > 0 ? dashboardData.topInternships.map(internship => ({
                    company: internship.company,
                    role: internship.title || internship.role,
                    date: new Date(internship.deadline || Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  })) : [
                    { company: 'Google', role: 'SWE Intern', date: 'Dec 15, 2024' },
                    { company: 'Microsoft', role: 'PM Intern', date: 'Dec 20, 2024' },
                    { company: 'Amazon', role: 'Data Intern', date: 'Dec 25, 2024' }
                  ]).map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.company}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card className="bg-emerald-500/10 dark:bg-emerald-500/5 shadow-sm border border-emerald-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData.skills.length > 0 ? dashboardData.skills.map(skill => ({
                    skill: skill.name,
                    trend: `+${Math.floor(Math.random() * 20 + 5)}%`,
                    color: 'text-green-600'
                  })) : [
                    { skill: 'AI/ML', trend: '+15%', color: 'text-green-600' },
                    { skill: 'React', trend: '+8%', color: 'text-green-600' },
                    { skill: 'Python', trend: '+5%', color: 'text-blue-600' }
                  ]).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">{item.skill}</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-4 h-4 ${item.color}`} />
                        <span className={`text-sm font-semibold ${item.color}`}>{item.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-teal-500/10 dark:bg-teal-500/5 shadow-sm border border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: BookOpen, label: 'Resume', action: () => navigate('/profile') },
                    { icon: Users, label: 'Interview', action: () => navigate('/') },
                    { icon: BarChart3, label: 'Skills Test', action: () => navigate('/') },
                    { icon: Settings, label: 'Settings', action: () => navigate('/profile') }
                  ].map((action, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      className="flex flex-col h-20 gap-2"
                      onClick={action.action}
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-sm">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-red-500/10 dark:bg-red-500/5 shadow-sm border border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-red-500" />
                    Notifications
                  </div>
                  <Badge className="bg-red-500 text-white">3</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData.notifications.length > 0 ? dashboardData.notifications : [
                    { message: 'New match found!', time: '2 hours ago', icon: 'Target' },
                    { message: 'Application accepted', time: '1 day ago', icon: 'CheckCircle' }
                  ]).map((notification, index) => {
                    const IconComponent = notification.icon === 'Target' ? Target : CheckCircle;
                    return (
                    <div key={index} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
                      <IconComponent className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Mark All Read
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;