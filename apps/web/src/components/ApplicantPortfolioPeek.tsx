'use client';

import Link from 'next/link';
import { Award, ExternalLink } from 'lucide-react';
import { useGetPublicPortfolioQuery } from '@/store/api/apiSlice';

type PopulatedStudent = {
  _id?: string;
  firstName?: string;
  lastName?: string;
};

export function ApplicantPortfolioPeek({
  studentId,
}: {
  studentId: string | PopulatedStudent | undefined;
}) {
  const id =
    typeof studentId === 'string'
      ? studentId
      : studentId && typeof studentId === 'object'
        ? String((studentId as PopulatedStudent)._id || '')
        : '';

  const { data, isLoading, isError } = useGetPublicPortfolioQuery(id, { skip: !id });

  if (!id) return null;

  if (isLoading) {
    return (
      <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-gray-200 mb-2" />
        <div className="h-2 w-full rounded bg-gray-200" />
      </div>
    );
  }

  if (isError || !data?.portfolio) {
    return (
      <p className="mt-2 text-[10px] font-medium text-gray-400">
        Portfolio data unavailable — open full profile if the student has completed work on the platform.
      </p>
    );
  }

  const { portfolio, studentInfo } = data;
  const badges = (portfolio.skillBadges || []).slice(0, 3);

  return (
    <div className="mt-3 rounded-2xl border border-[#d9f99d]/80 bg-[#f7fee7]/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white">
            <Award size={10} />
            {portfolio.tier}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {portfolio.totalCompleted ?? 0} completed • {Math.round(portfolio.completionRate ?? 0)}% on-time
          </span>
        </div>
        <Link
          href={`/portfolio/${id}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-2 hover:text-gray-700"
        >
          Full portfolio <ExternalLink size={12} />
        </Link>
      </div>
      {badges.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((b: { skill: string; projectCount?: number }, i: number) => (
            <span
              key={`${b.skill}-${i}`}
              className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-gray-700 ring-1 ring-gray-100"
            >
              {b.skill}
              {typeof b.projectCount === 'number' ? ` ×${b.projectCount}` : ''}
            </span>
          ))}
        </div>
      )}
      {studentInfo?.githubUsername && (
        <p className="mt-2 text-[10px] font-medium text-gray-500">
          GitHub:{' '}
          <a
            href={`https://github.com/${studentInfo.githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-black underline"
          >
            @{studentInfo.githubUsername}
          </a>
        </p>
      )}
    </div>
  );
}
