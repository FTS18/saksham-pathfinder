import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Building2, IndianRupee, Bookmark, GitCompare, Wifi, Monitor, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ShareInternship } from './ShareInternship';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlistStore as useWishlist } from '@/store/useWishlistStore';
import { useApplication } from '@/contexts/ApplicationContext';
import { useComparisonStore as useComparison } from '@/store/useComparisonStore';
import { SectorIcon } from './SectorIcons';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Internship } from '@/types';

interface InternshipCardProps {
  internship: Internship;
  matchExplanation?: string;
  aiTags?: string[];
  userProfile?: any;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
  matchScore?: number;
  aiScore?: number;
}

// Stable hash for consistent per-card values
const stableHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const WorkModeIcon = ({ mode }: { mode?: string }) => {
  if (!mode) return null;
  if (mode === 'Remote') return <Wifi className="w-3 h-3" />;
  if (mode === 'Hybrid') return <Monitor className="w-3 h-3" />;
  return <Building2 className="w-3 h-3" />;
};

export const InternshipCard = ({
  internship,
  aiTags,
  userProfile,
  matchScore,
  aiScore,
}: InternshipCardProps) => {
  const navigate = useNavigate();
  const {
    id,
    title,
    role,
    company,
    location,
    stipend,
    sector_tags,
    required_skills,
    work_mode,
    workMode,
    openings,
    application_deadline,
    applicationDeadline,
    featured = false,
    logo,
  } = internship;

  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { applyToInternship, hasApplied } = useApplication();
  const { addToComparison, removeFromComparison, isInComparison, selectedInternships, maxComparisons } = useComparison();
  const [isApplying, setIsApplying] = useState(false);

  const locationText = typeof location === 'string' ? location : location?.city ?? 'India';
  const displayTitle = title || role || 'Internship';
  const displayCompany = company || 'Company';
  const effectiveWorkMode = work_mode || workMode;
  const deadline = application_deadline || applicationDeadline;
  const primarySector = sector_tags?.[0];

  // Stable AI match score — same every render for same internship
  const computedScore = aiScore
    ?? matchScore
    ?? (userProfile
      ? Math.max(45, Math.min(95, 60 + stableHash(String(id) + (userProfile.email ?? '')) % 36))
      : null);

  // Company initials avatar
  const initials = displayCompany
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarColors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-teal-600',
    'bg-orange-600'
  ];
  const avatarColor = avatarColors[stableHash(displayCompany) % avatarColors.length];

  const handleApply = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasApplied(id ?? '') || isApplying) return;
    setIsApplying(true);
    await applyToInternship(internship);
    setIsApplying(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isWishlisted(id ?? '') ? removeFromWishlist(id ?? '') : addToWishlist(id ?? '');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isInComparison(id ?? '') ? removeFromComparison(id ?? '') : addToComparison(internship);
  };

  const applied = hasApplied(id ?? '');
  const wishlisted = isWishlisted(id ?? '');
  const inComparison = isInComparison(id ?? '');
  const compareDisabled = !inComparison && selectedInternships.length >= maxComparisons;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  return (
    <TooltipProvider>
      <Card
        className={`group relative flex flex-col h-full bg-card border border-border/40 dark:border-border/60 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md dark:hover:border-primary/30 hover:-translate-y-1 cursor-pointer ${
          featured ? 'ring-1 ring-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)] dark:shadow-[0_0_15px_rgba(var(--primary),0.2)]' : ''
        }`}
        onClick={() => navigate(`/internships/${id}`)}
      >
        <CardContent className="p-3 flex flex-col gap-2 flex-1">

          {/* Row 1: Company avatar + name + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Company avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white text-[10px] font-bold overflow-hidden ${
                  logo ? 'bg-white border border-border' : avatarColor
                }`}
              >
                {logo ? (
                  <img src={logo} alt={displayCompany} className="w-full h-full object-contain p-1" />
                ) : primarySector ? (
                  <SectorIcon sector={primarySector} className="w-4 h-4 text-white" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <a
                  href={`/company/${displayCompany.toLowerCase().replace(/\s+/g, '-')}`}
                  className="notranslate text-xs font-medium text-muted-foreground hover:text-foreground truncate block max-w-[140px] transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {displayCompany}
                </a>
                {primarySector && (
                  <span className="text-[10px] text-muted-foreground/70 truncate block">{primarySector}</span>
                )}
              </div>
            </div>

            {/* Wishlist + compare icons — top right */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleWishlist}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      wishlisted
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Bookmark className={`w-3 h-3 ${wishlisted ? 'fill-current' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{wishlisted ? 'Remove from wishlist' : 'Save'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCompare}
                    disabled={compareDisabled}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                      inComparison
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : compareDisabled
                        ? 'opacity-40 cursor-not-allowed bg-muted/50 border-border text-muted-foreground'
                        : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <GitCompare className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{inComparison ? 'Remove from compare' : 'Compare'}</TooltipContent>
              </Tooltip>

              <div className="w-7 h-7" onClick={e => e.stopPropagation()}>
                <ShareInternship internship={{ id: id ?? '', title: displayTitle, company: displayCompany }} />
              </div>
            </div>
          </div>

          {/* Row 2: Title */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {aiTags?.includes('AI Recommended') && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-primary text-primary-foreground uppercase">
                  AI Pick
                </span>
              )}
              {featured && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 uppercase">
                  Featured
                </span>
              )}
            </div>
            <Link
              to={`/internships/${id}`}
              onClick={e => e.stopPropagation()}
              className="font-semibold text-[13px] leading-tight text-foreground hover:text-primary line-clamp-2 transition-colors font-racing"
            >
              {displayTitle}
            </Link>
          </div>

          {/* Row 3: Meta pills */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              {locationText}
            </span>
            {effectiveWorkMode && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                <WorkModeIcon mode={effectiveWorkMode} />
                {effectiveWorkMode}
              </span>
            )}
            {openings && openings > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                <Users className="w-2.5 h-2.5" />
                {openings} open
              </span>
            )}
          </div>

          {/* Row 4: Skills */}
          {required_skills && required_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {required_skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted/70 text-muted-foreground border border-border/40"
                >
                  {skill}
                </span>
              ))}
              {required_skills.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground">
                  +{required_skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row 5: Stipend + deadline */}
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/50">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <IndianRupee className="w-3 h-3 text-emerald-500" />
              <span className="notranslate">{stipend || 'Unpaid'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {computedScore !== null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 cursor-default">
                      {computedScore}% match
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>AI Match Score</TooltipContent>
                </Tooltip>
              )}
              {deadlineStr && (
                <span className="text-muted-foreground text-[10px]">
                  Due {deadlineStr}
                </span>
              )}
            </div>
          </div>

          {/* Row 6: Action buttons */}
          <div className="flex gap-2 pt-0.5">
            <Button
              size="sm"
              onClick={handleApply}
              disabled={applied || isApplying}
              className={`flex-1 h-7 text-xs font-semibold rounded-lg transition-colors ${
                applied
                  ? 'bg-muted text-muted-foreground cursor-default'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {applied ? '✓ Applied' : isApplying ? 'Applying…' : 'Quick Apply'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={e => { e.stopPropagation(); navigate(`/internships/${id}`); }}
              className="h-7 px-3 text-xs font-medium rounded-lg"
            >
              Details
            </Button>
          </div>

        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
