import { IProject, IPortfolio } from '@boulot/types';

export function computeProposalQualityScore(proposalText: string, githubLinks: string[]): number {
  const len = (proposalText || '').trim().length;
  const linkCount = Array.isArray(githubLinks) ? githubLinks.filter((l) => (l || '').trim().length > 0).length : 0;

  // 0..100
  const lengthScore = Math.max(0, Math.min(100, (len / 800) * 100));
  const linksScore = Math.max(0, Math.min(100, linkCount * 25)); // 0,25,50,75,100

  return Math.round(lengthScore * 0.7 + linksScore * 0.3);
}

export function computeSkillMatchScore(project: Pick<IProject, 'skillsRequired'>, portfolio: Pick<IPortfolio, 'skillBadges'>): number {
  const required = (project.skillsRequired || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  if (required.length === 0) return 0;

  const badgeSkills = new Set((portfolio.skillBadges || []).map((b) => (b.skill || '').toLowerCase().trim()).filter(Boolean));
  const matched = required.filter((s) => badgeSkills.has(s)).length;

  return Math.round((matched / required.length) * 100);
}

export function computeAverageRating(portfolio: Pick<IPortfolio, 'completedProjects'>): number {
  const ratings = (portfolio.completedProjects || [])
    .map((p) => p.rating)
    .filter((r): r is number => typeof r === 'number' && Number.isFinite(r));
  if (ratings.length === 0) return 0;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

export function computeApplicationScore(args: {
  completionRate: number; // 0..100
  skillMatch: number; // 0..100
  pastRatings: number; // 0..5 (avg)
  proposalQuality: number; // 0..100
}): number {
  const completionRate = clamp01(args.completionRate / 100) * 100;
  const skillMatch = clamp01(args.skillMatch / 100) * 100;
  const pastRatings = clamp01(args.pastRatings / 5) * 100;
  const proposalQuality = clamp01(args.proposalQuality / 100) * 100;

  const score =
    completionRate * 0.4 +
    skillMatch * 0.3 +
    pastRatings * 0.2 +
    proposalQuality * 0.1;

  // Stored as 0..100
  return Math.round(score * 100) / 100;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

