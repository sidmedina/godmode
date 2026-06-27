"use client";

import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, Star, Inbox, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { STATUS_CONFIG } from "@/lib/types";
import type { Job } from "@/lib/types";

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

export default function OverviewPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false));
  }, []);

  const evaluated  = jobs.filter((j) => j.status !== 'Pipeline');
  const active     = jobs.filter((j) => ['Applied', 'Responded', 'Interview', 'Offer'].includes(j.status));
  const interviews = jobs.filter((j) => j.status === 'Interview');
  const pipeline   = jobs.filter((j) => j.status === 'Pipeline');
  const avgScore   = evaluated.length
    ? evaluated.filter((j) => j.score !== null).reduce((s, j) => s + (j.score ?? 0), 0) /
      evaluated.filter((j) => j.score !== null).length
    : 0;

  const recent = [...jobs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const funnelStatuses = ['Evaluated', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;
  const funnelMax = Math.max(...funnelStatuses.map((s) => jobs.filter((j) => j.status === s).length), 1);

  const FUNNEL_COLORS: Record<string, string> = {
    Evaluated: '#999', Applied: '#5b8fc9', Interview: '#f4a11a', Offer: '#00853e', Rejected: '#c0392b',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin" style={{ color: '#00853e' }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs',    value: jobs.length,      sub: `${evaluated.length} evaluated`, icon: Briefcase, accent: '#1a2b3c', topColor: '#1a2b3c' },
          { label: 'Avg Score',     value: avgScore.toFixed(1), sub: 'out of 5.0',              icon: Star,      accent: '#00853e', topColor: '#00853e' },
          { label: 'Interviews',    value: interviews.length, sub: `${active.length} active`,   icon: TrendingUp, accent: '#f4a11a', topColor: '#f4a11a' },
          { label: 'Pipeline',      value: pipeline.length,   sub: 'URLs pending',              icon: Inbox,     accent: '#5b8fc9', topColor: '#5b8fc9' },
        ].map(({ label, value, sub, icon: Icon, accent, topColor }) => (
          <div key={label} className="rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
            <div className="h-1" style={{ background: topColor }} />
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Icon size={12} style={{ color: accent }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{label}</span>
              </div>
              <p className="text-3xl font-bold tabular-nums" style={{ color: '#1a2b3c' }}>{value}</p>
              <p className="text-[10px] mt-1" style={{ color: '#aaa' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Recent activity */}
        <div className="col-span-3 rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #e0ddd8' }}>
            <p className="text-xs font-semibold" style={{ color: '#1a2b3c' }}>Recent Activity</p>
            <Link href="/jobs" className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#00853e' }}>
              View all <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0eeea' }}>
            {recent.map((job) => {
              const cfg = STATUS_CONFIG[job.status];
              return (
                <div key={job.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#1a2b3c' }}>{job.company}</p>
                    <p className="text-xs truncate" style={{ color: '#aaa' }}>{job.role}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-[10px]" style={{ color: '#ccc' }}>{job.date}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                    {job.score !== null && (
                      <span className="text-sm font-bold tabular-nums w-8 text-right" style={{ color: SCORE_COLOR(job.score) }}>{job.score.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {recent.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-xs" style={{ color: '#ccc' }}>No jobs yet — paste a URL to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Status funnel + Pipeline nudge */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="rounded-lg overflow-hidden flex-1" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #e0ddd8' }}>
              <p className="text-xs font-semibold" style={{ color: '#1a2b3c' }}>Status Breakdown</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {funnelStatuses.map((status) => {
                const count = jobs.filter((j) => j.status === status).length;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: '#888' }}>{status}</span>
                      <span style={{ color: '#aaa' }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0eeea' }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / funnelMax) * 100}%`, background: FUNNEL_COLORS[status] ?? '#ccc' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {pipeline.length > 0 && (
            <div className="rounded-lg p-4" style={{ background: '#e8f4ef', border: '1px solid #b8dfc9', borderLeft: '3px solid #00853e' }}>
              <p className="text-xs font-semibold" style={{ color: '#00853e' }}>{pipeline.length} URL{pipeline.length > 1 ? 's' : ''} pending</p>
              <p className="text-[10px] mt-1 mb-3" style={{ color: '#5a9e76' }}>Ready to evaluate in your pipeline</p>
              <Link
                href="/pipeline"
                className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: '#00853e' }}
              >
                Go to Pipeline <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
