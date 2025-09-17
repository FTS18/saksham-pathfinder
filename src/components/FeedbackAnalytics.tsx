import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';

interface FeedbackData {
  internshipId: string;
  feedback: 'up' | 'down';
  timestamp: string;
  userProfile: any;
}

export const FeedbackAnalytics = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [analytics, setAnalytics] = useState({
    totalFeedback: 0,
    positiveRate: 0,
    topInternships: [] as { id: string; company: string; positiveCount: number }[]
  });

  useEffect(() => {
    const stored = localStorage.getItem('internshipFeedback');
    if (stored) {
      const data: FeedbackData[] = JSON.parse(stored);
      setFeedbackData(data);
      
      // Calculate analytics
      const total = data.length;
      const positive = data.filter(f => f.feedback === 'up').length;
      const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;
      
      // Group by internship for top recommendations
      const internshipFeedback = data.reduce((acc, item) => {
        if (!acc[item.internshipId]) {
          acc[item.internshipId] = { positive: 0, negative: 0 };
        }
        if (item.feedback === 'up') {
          acc[item.internshipId].positive++;
        } else {
          acc[item.internshipId].negative++;
        }
        return acc;
      }, {} as Record<string, { positive: number; negative: number }>);
      
      setAnalytics({
        totalFeedback: total,
        positiveRate,
        topInternships: [] // Would need internship data to populate this
      });
    }
  }, []);

  if (feedbackData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Feedback Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No feedback data available yet. Start rating recommendations to see analytics!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Feedback Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{analytics.totalFeedback}</div>
            <div className="text-sm text-muted-foreground">Total Feedback</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.positiveRate}%</div>
            <div className="text-sm text-muted-foreground">Positive Rate</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Recent Feedback</h4>
          {feedbackData.slice(-5).reverse().map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
              <span className="text-sm">Internship #{item.internshipId}</span>
              <Badge variant={item.feedback === 'up' ? 'default' : 'destructive'}>
                {item.feedback === 'up' ? (
                  <ThumbsUp className="w-3 h-3 mr-1" />
                ) : (
                  <ThumbsDown className="w-3 h-3 mr-1" />
                )}
                {item.feedback === 'up' ? 'Helpful' : 'Not Helpful'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};