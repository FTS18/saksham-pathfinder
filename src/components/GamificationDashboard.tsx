import React from 'react';
import { Trophy, Star, Target, Gift, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/contexts/GamificationContext';

export const GamificationDashboard: React.FC = () => {
  const { data, loading } = useGamification();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const nextLevelPoints = data.level * 100;
  const currentLevelProgress = data.totalPoints % 100;
  const progressPercentage = (currentLevelProgress / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Points and Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-primary">{data.totalPoints}</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-yellow-600">{data.level}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold text-green-600">{data.achievements.length}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Level</p>
                <p className="text-2xl font-bold text-purple-600">{100 - currentLevelProgress}</p>
                <p className="text-xs text-muted-foreground">points needed</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {data.level}</span>
              <span>Level {data.level + 1}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">
              {currentLevelProgress} / 100 points ({100 - currentLevelProgress} to next level)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {data.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.achievements.slice(-4).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <Badge variant="secondary" className="mt-1">
                      +{achievement.points} points
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Challenge */}
      {data.weeklyChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{data.weeklyChallenge.title}</h4>
                <p className="text-sm text-muted-foreground">{data.weeklyChallenge.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{data.weeklyChallenge.progress} / {data.weeklyChallenge.target}</span>
                </div>
                <Progress 
                  value={(data.weeklyChallenge.progress / data.weeklyChallenge.target) * 100} 
                  className="h-2" 
                />
              </div>
              <Badge variant="outline" className="w-fit">
                Reward: +{data.weeklyChallenge.reward} points
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Earn More Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/5">
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold text-sm">Apply to Internships</h4>
              <p className="text-xs text-muted-foreground">+25 points each</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/5">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="font-semibold text-sm">Refer Friends</h4>
              <p className="text-xs text-muted-foreground">+100 points each</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-500/5">
              <div className="text-2xl mb-2">⭐</div>
              <h4 className="font-semibold text-sm">Complete Profile</h4>
              <p className="text-xs text-muted-foreground">+50 points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};