import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useFeaturedInternships, useTrendingInternships } from '@/hooks/useInternships';
import { useApplications } from '@/hooks/useApplications';
import { useProfileData } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCard } from '@/components/SkeletonLoaders';
import {
  User, Target, TrendingUp, Award, BookOpen, Briefcase,
  Heart, Zap, BarChart3, ArrowRight, CheckCircle, Search,
  FileText, Star, Activity, ExternalLink, ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/StickyBreadcrumbHeader';

const stableHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const timeAgo = (dateStr?: string): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
};


const EmptyState = ({ icon: Icon, title, description, ctaLabel, ctaAction }: {
  icon: React.ElementType; title: string; description: string; ctaLabel: string; ctaAction: () => void;
}) => (
  <div className=flex flex-col items-center justify-center py-8 text-center gap-3>
    <div className=w-12 h-12 rounded-full bg-muted flex items-center justify-center>
      <Icon className=w-6 h-6 text-muted-foreground />
    </div>
    <div>
      <p className=font-semibold text-foreground text-sm>{title}</p>
      <p className=text-xs text-muted-foreground mt-1 max-w-xs mx-auto>{description}</p>
    </div>
    <Button size=sm onClick={ctaAction}>{ctaLabel}</Button>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string }> = {
    pending:      { label: 'Pending',    className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
    applied:      { label: 'Applied',    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    'in-review':  { label: 'In Review',  className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
    under_review: { label: 'In Review',  className: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
    shortlisted:  { label: 'Shortlisted',className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    interview:    { label: 'Interview',  className: 'bg-primary/15 text-primary' },
    interview_scheduled: { label: 'Interview', className: 'bg-primary/15 text-primary' },
    accepted:     { label: 'Accepted',   className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
    rejected:     { label: 'Rejected',   className: 'bg-red-500/15 text-red-500' },
    withdrawn:    { label: 'Withdrawn',  className: 'bg-muted text-muted-foreground' },
  };
  const { label, className } = map[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ' + className}>
      {label}
    </span>
  );
};

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { wishlist } = useWishlistStore();

  const { data: featuredInternships, isLoading: featuredLoading } = useFeaturedInternships();
  const { data: trendingInternships, isLoading: trendingLoading } = useTrendingInternships();
  const { data: applications = [], isLoading: appsLoading } = useApplications(currentUser?.uid ?? null);

  // Use shared cached profile hook — no extra Firestore read
  const { profile, profileLoading, profilePct, profileMissing } = useProfileData();

  const skills = useMemo(() => {
    const raw: string[] = profile.skills || [];
    return raw.slice(0, 5).map(s => ({ name: s, progress: 55 + (stableHash(s) % 35) }));
  }, [profile.skills]);

  const aiMatchScore = useMemo(() => Math.min(98, Math.round(40 + profilePct * 0.3 + (profile.skills?.length ?? 0) * 3)), [profilePct, profile.skills]);

  const appStats = useMemo(() => ({
    total:     applications.length,
    pending:   applications.filter((a: any) => ['pending', 'applied'].includes(a.status)).length,
    inReview:  applications.filter((a: any) => ['in-review', 'under_review', 'shortlisted'].includes(a.status)).length,
    interview: applications.filter((a: any) => ['interview', 'interview_scheduled'].includes(a.status)).length,
    accepted:  applications.filter((a: any) => a.status === 'accepted').length,
  }), [applications]);

  const recentApplications = useMemo(() =>
    [...applications]
      .sort((a: any, b: any) => (b.appliedAt?.toDate?.()?.getTime() ?? 0) - (a.appliedAt?.toDate?.()?.getTime() ?? 0))
      .slice(0, 3),
    [applications]
  );

  const topInternships = useMemo(() => {
    const pool = Array.isArray(featuredInternships) && featuredInternships.length > 0 ? featuredInternships : (Array.isArray(trendingInternships) ? trendingInternships : []);
    return pool.slice(0, 4);
  }, [featuredInternships, trendingInternships]);

  const savedInternships = useMemo(() => {
    const pool = [...(featuredInternships ?? []), ...(trendingInternships ?? [])];
    return pool.filter((i: any) => wishlist.includes(i.id)).slice(0, 3);
  }, [featuredInternships, trendingInternships, wishlist]);

  const marketTrends = useMemo(() =>
    (skills.length > 0
      ? skills.map(s => ({ skill: s.name, trend: 5 + (stableHash(s.name + 'mkt') % 20) }))
      : [{ skill: 'AI / ML', trend: 22 }, { skill: 'React', trend: 14 }, { skill: 'Python', trend: 18 }, { skill: 'Cloud', trend: 12 }]
    ).slice(0, 4),
    [skills]
  );

  const points: number = profile.points ?? 0;
  const badges: string[] = profile.badges ?? [];
  const isLoading = profileLoading || featuredLoading || trendingLoading || appsLoading;

  const statCards = [
    {
      label: 'Profile Complete', value: profilePct + '%', icon: User,
      iconColor: profilePct < 60 ? 'text-amber-500' : 'text-primary',
      sub: profilePct < 100
        ? <Button variant=link className=p-0 h-auto mt-1 text-xs text-primary onClick={() => navigate('/profile')}>Complete profile →</Button>
        : <span className=flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1><CheckCircle className=w-3 h-3 /> All done!</span>,
    },
    {
      label: 'AI Match Score', value: aiMatchScore + '%', icon: Target, iconColor: 'text-emerald-500',
      sub: <Button variant=link className=p-0 h-auto mt-1 text-xs text-emerald-600 dark:text-emerald-400 onClick={() => navigate('/')}>View matches →</Button>,
    },
    {
      label: 'Applications', value: appStats.total > 0 ? appStats.total : '—', icon: Briefcase, iconColor: 'text-violet-500',
      sub: appStats.total > 0
        ? <div className=flex gap-2 mt-1 flex-wrap text-[11px]>
            <span className=text-amber-600 dark:text-amber-400>Pending: {appStats.pending}</span>
            <span className=text-violet-600 dark:text-violet-400>Review: {appStats.inReview}</span>
            {appStats.accepted > 0 && <span className=text-emerald-600 dark:text-emerald-400>✓ {appStats.accepted}</span>}
          </div>
        : <Button variant=link className=p-0 h-auto mt-1 text-xs text-muted-foreground onClick={() => navigate('/')}>Browse →</Button>,
    },
    {
      label: 'Saved Internships', value: wishlist.length > 0 ? wishlist.length : '—', icon: Heart, iconColor: 'text-rose-500',
      sub: <Button variant=link className=p-0 h-auto mt-1 text-xs text-rose-500 onClick={() => navigate('/wishlist')}>View wishlist →</Button>,
    },
  ];

  return (
    <div className=bg-background>
      <PageHeader
        title={getGreeting() + ', ' + (currentUser?.displayName?.split(' ')[0] || 'there') + ' 👋'}
        subtitle=Your internship journey at a glance.
      />

      <div className=w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6>

        {/* Stat Cards */}
        <div className=grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map(card => (
              <Card key={card.label}>
                <CardContent className=pt-4>
                  <div className=flex items-start justify-between>
                    <div>
                      <p className=text-xs font-medium text-muted-foreground uppercase tracking-wide>{card.label}</p>
                      <p className=text-2xl font-bold text-foreground mt-1>{card.value}</p>
                    </div>
                    <div className=w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0>
                      <card.icon className={'w-5 h-5 ' + card.iconColor} />
                    </div>
                  </div>
                  {card.sub}
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Profile Banner */}
        {!profileLoading && profilePct < 80 && profileMissing.length > 0 && (
          <Card className=border-amber-500/40 bg-amber-500/5>
            <CardContent className=flex items-center justify-between py-4 gap-4>
              <div className=flex items-center gap-3>
                <div className=w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0>
                  <User className=w-4 h-4 text-amber-500 />
                </div>
                <div>
                  <p className=text-sm font-semibold text-foreground>Profile {profilePct}% complete — unlock better matches</p>
                  <p className=text-xs text-muted-foreground mt-0.5>
                    Missing: {profileMissing.slice(0, 3).join(', ')}{profileMissing.length > 3 ? ' +' + (profileMissing.length - 3) + ' more' : ''}
                  </p>
                </div>
              </div>
              <Button size=sm onClick={() => navigate('/profile')} className=shrink-0>Complete Now</Button>
            </CardContent>
          </Card>
        )}

        <div className=grid grid-cols-1 lg:grid-cols-3 gap-6>

          {/* ── Left column ── */}
          <div className=lg:col-span-2 space-y-6>

            {/* Recent Applications */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center justify-between text-base font-semibold>
                  <div className=flex items-center gap-2><Briefcase className=w-4 h-4 text-violet-500 />Recent Applications</div>
                  {appStats.total > 0 && (
                    <Button variant=ghost size=sm className=h-7 px-2 text-xs onClick={() => navigate('/application-dashboard')}>
                      View all <ChevronRight className=w-3 h-3 ml-1 />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appsLoading ? (
                  <div className=space-y-3>{[1,2,3].map(i => <div key={i} className=h-14 bg-muted animate-pulse rounded-md />)}</div>
                ) : recentApplications.length > 0 ? (
                  <div className=space-y-2>
                    {recentApplications.map((app: any) => (
                      <div key={app.id} className=flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer onClick={() => navigate('/application-dashboard')}>
                        <div className=flex items-center gap-3 min-w-0>
                          <div className=w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 font-bold text-violet-500 text-sm>
                            {(app.companyName || '?')[0].toUpperCase()}
                          </div>
                          <div className=min-w-0>
                            <p className=font-semibold text-sm text-foreground truncate>{app.companyName}</p>
                            <p className=text-xs text-muted-foreground truncate>{app.internshipTitle}</p>
                          </div>
                        </div>
                        <div className=flex flex-col items-end gap-1 shrink-0 ml-2>
                          <StatusBadge status={app.status} />
                          {app.appliedAt?.toDate && <span className=text-[10px] text-muted-foreground>{timeAgo(app.appliedAt.toDate().toISOString())}</span>}
                        </div>
                      </div>
                    ))}
                    {appStats.total > 0 && (
                      <div className=mt-4 pt-3 border-t border-border>
                        <p className=text-xs text-muted-foreground mb-2 font-medium>Application Funnel</p>
                        <div className=flex gap-2 text-[11px]>
                          {[
                            { label: 'Applied',   val: appStats.pending,   color: 'bg-blue-500' },
                            { label: 'Review',    val: appStats.inReview,  color: 'bg-violet-500' },
                            { label: 'Interview', val: appStats.interview, color: 'bg-primary' },
                            { label: 'Accepted',  val: appStats.accepted,  color: 'bg-emerald-500' },
                          ].map(item => (
                            <div key={item.label} className=flex-1 text-center>
                              <div className={'h-1.5 rounded-full mb-1 ' + item.color + (item.val > 0 ? '' : ' opacity-30')} />
                              <div className=font-bold text-foreground>{item.val}</div>
                              <div className=text-muted-foreground>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={Briefcase} title=No applications yet description=Start applying to internships and track them here in real time. ctaLabel=Browse Internships ctaAction={() => navigate('/')} />
                )}
              </CardContent>
            </Card>

            {/* Top Matches */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center justify-between text-base font-semibold>
                  <div className=flex items-center gap-2><Zap className=w-4 h-4 text-amber-500 />Top Matches for You</div>
                  <Button variant=ghost size=sm className=h-7 px-2 text-xs onClick={() => navigate('/')}>See all <ChevronRight className=w-3 h-3 ml-1 /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {featuredLoading || trendingLoading ? (
                  <div className=space-y-3>{[1,2,3].map(i => <div key={i} className=h-14 bg-muted animate-pulse rounded-md />)}</div>
                ) : topInternships.length > 0 ? (
                  <div className=space-y-2>
                    {topInternships.map((internship: any, i: number) => (
                      <div key={internship.id || i} className=flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors cursor-pointer group onClick={() => internship.id && navigate('/internships/' + internship.id)}>
                        <div className=flex items-center gap-3 min-w-0>
                          <div className=w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 font-bold text-amber-600 dark:text-amber-400 text-sm>
                            {(internship.company || '?')[0].toUpperCase()}
                          </div>
                          <div className=min-w-0>
                            <p className=font-semibold text-sm text-foreground truncate>{internship.company}</p>
                            <p className=text-xs text-muted-foreground truncate>{internship.title || internship.role}</p>
                          </div>
                        </div>
                        <div className=flex items-center gap-2 shrink-0>
                          {internship.stipend && <span className=text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:block>₹{typeof internship.stipend === 'number' ? internship.stipend.toLocaleString() : internship.stipend}</span>}
                          <ExternalLink className=w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Search} title=No matches yet description=Complete your profile to get personalised recommendations. ctaLabel=Set up Profile ctaAction={() => navigate('/profile')} />
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center justify-between text-base font-semibold>
                  <div className=flex items-center gap-2><BookOpen className=w-4 h-4 text-primary />Skills on Your Profile</div>
                  <Button variant=ghost size=sm className=h-7 px-2 text-xs onClick={() => navigate('/profile')}>Manage →</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className=space-y-4>{[1,2,3].map(i => <div key={i} className=h-8 bg-muted animate-pulse rounded />)}</div>
                ) : skills.length > 0 ? (
                  <div className=space-y-4>
                    {skills.map(skill => (
                      <div key={skill.name}>
                        <div className=flex justify-between items-center mb-1.5>
                          <span className=text-sm font-medium text-foreground>{skill.name}</span>
                          <span className=text-xs text-muted-foreground tabular-nums>{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className=h-1.5 />
                      </div>
                    ))}
                    <p className=text-xs text-muted-foreground mt-1>
                      Skill confidence is estimated from your profile.{' '}
                      <button className=underline text-primary onClick={() => navigate('/profile')}>Add more skills</button> for better AI matches.
                    </p>
                  </div>
                ) : (
                  <EmptyState icon={BookOpen} title=No skills added yet description=Adding skills unlocks AI-powered internship matching. ctaLabel=Add Skills ctaAction={() => navigate('/profile')} />
                )}
              </CardContent>
            </Card>

          </div>

          {/* ── Right sidebar ── */}
          <div className=space-y-6>

            {/* Points & Badges */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center gap-2 text-base font-semibold>
                  <Award className=w-4 h-4 text-amber-500 />Points & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileLoading ? <div className=h-20 bg-muted animate-pulse rounded /> : (
                  <div className=space-y-3>
                    <div className=flex items-center justify-between>
                      <div>
                        <p className=text-2xl font-bold text-foreground>{points.toLocaleString()}</p>
                        <p className=text-xs text-muted-foreground>Total Points</p>
                      </div>
                      <div className=w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center>
                        <Star className=w-6 h-6 text-amber-500 />
                      </div>
                    </div>
                    {badges.length > 0 && (
                      <div className=flex flex-wrap gap-1.5 pt-1>
                        {badges.map(b => <Badge key={b} variant=secondary className=text-[10px]>{b}</Badge>)}
                      </div>
                    )}
                    <Button variant=outline size=sm className=w-full text-xs onClick={() => navigate('/referrals')}>
                      View Leaderboard <ChevronRight className=w-3 h-3 ml-1 />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Internships */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center justify-between text-base font-semibold>
                  <div className=flex items-center gap-2>
                    <Heart className=w-4 h-4 text-rose-500 />Saved Internships
                    {wishlist.length > 0 && <Badge variant=secondary className=text-[10px] ml-1>{wishlist.length}</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedInternships.length > 0 ? (
                  <div className=space-y-2>
                    {savedInternships.map((item: any) => (
                      <div key={item.id} className=flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors onClick={() => navigate('/internships/' + item.id)}>
                        <div className=w-7 h-7 rounded bg-rose-500/10 flex items-center justify-center shrink-0 text-xs font-bold text-rose-500>
                          {(item.company || '?')[0].toUpperCase()}
                        </div>
                        <div className=min-w-0>
                          <p className=text-sm font-medium text-foreground truncate>{item.company}</p>
                          <p className=text-xs text-muted-foreground truncate>{item.title || item.role}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant=ghost size=sm className=w-full mt-1 text-xs text-muted-foreground onClick={() => navigate('/wishlist')}>
                      View all saved <ArrowRight className=w-3 h-3 ml-1 />
                    </Button>
                  </div>
                ) : (
                  <EmptyState icon={Heart} title=Nothing saved yet description=Heart an internship to save it here for later. ctaLabel=Browse Internships ctaAction={() => navigate('/')} />
                )}
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=flex items-center gap-2 text-base font-semibold>
                  <TrendingUp className=w-4 h-4 text-emerald-500 />Skill Demand Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=space-y-2>
                  {marketTrends.map((item, i) => (
                    <div key={i} className=flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer onClick={() => navigate('/?skill=' + encodeURIComponent(item.skill))}>
                      <span className=text-sm font-medium text-foreground>{item.skill}</span>
                      <div className=flex items-center gap-1>
                        <TrendingUp className=w-3.5 h-3.5 text-emerald-500 />
                        <span className=text-sm font-semibold text-emerald-600 dark:text-emerald-400>+{item.trend}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className=text-[10px] text-muted-foreground mt-3>
                  Trends reflect your listed skills.{' '}
                  <button className=underline text-primary onClick={() => navigate('/profile')}>Update skills</button> to personalise.
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className=pb-3>
                <CardTitle className=text-base font-semibold>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=grid grid-cols-2 gap-2>
                  {[
                    { icon: FileText,  label: 'My Resume',    action: () => navigate('/resume') },
                    { icon: Briefcase, label: 'Applications', action: () => navigate('/application-dashboard') },
                    { icon: Search,    label: 'Find Jobs',    action: () => navigate('/') },
                    { icon: BarChart3, label: 'Leaderboard',  action: () => navigate('/referrals') },
                    { icon: Heart,     label: 'Wishlist',     action: () => navigate('/wishlist') },
                    { icon: Activity,  label: 'AI Matches',   action: () => navigate('/') },
                  ].map((a, i) => (
                    <Button key={i} variant=outline className=flex flex-col h-14 gap-1 text-muted-foreground hover:text-foreground onClick={a.action}>
                      <a.icon className=w-4 h-4 />
                      <span className=text-[11px]>{a.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
