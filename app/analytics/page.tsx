"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Job, JobStatus } from "@/lib/types";

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

const FUNNEL: { status: JobStatus; color: string }[] = [
  { status: 'Evaluated', color: '#999' },
  { status: 'Applied',   color: '#5b8fc9' },
  { status: 'Interview', color: '#f4a11a' },
  { status: 'Offer',     color: '#00853e' },
  { status: 'Rejected',  color: '#c0392b' },
];

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).filter((j: Job) => j.status !== 'Pipeline')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 size={20} className="animate-spin" style={{ color: '#00853e' }} /></div>;
  }

  const scored   = jobs.filter((j) => j.score !== null);
  const avgScore = scored.length ? scored.reduce((s, j) => s + (j.score ?? 0), 0) / scored.length : 0;
  const applied  = jobs.filter((j) => ['Applied', 'Responded', 'Interview', 'Offer'].includes(j.status)).length;
  const applyRate = jobs.length ? ((applied / jobs.length) * 100).toFixed(0) : '0';
  const interviews = jobs.filter((j) => j.status === 'Interview').length;
  const convRate = applied ? ((interviews / applied) * 100).toFixed(0) : '0';

  const funnelMax = Math.max(...FUNNEL.map(({ status }) => jobs.filter((j) => j.status === status).length), 1);

  const scoreBuckets = [
    { label: '4.5 – 5.0', min: 4.5, max: 5.1, color: '#00853e' },
    { label: '4.0 – 4.4', min: 4.0, max: 4.5, color: '#1a2b3c' },
    { label: '3.5 – 3.9', min: 3.5, max: 4.0, color: '#f4a11a' },
    { label: '0 – 3.4',   min: 0,   max: 3.5, color: '#c0392b' },
  ].map((b) => ({ ...b, count: scored.filter((j) => (j.score ?? 0) >= b.min && (j.score ?? 0) < b.max).length }));
  const bucketMax = Math.max(...scoreBuckets.map((b) => b.count), 1);

  const top = [...scored].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 5);

  return (
    <div className="p-6 max-w-4xl space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Avg Score',     value: avgScore.toFixed(2), sub: 'out of 5.0',            topColor: '#00853e' },
          { label: 'Apply Rate',    value: `${applyRate}%`,     sub: 'evaluated → applied',   topColor: '#5b8fc9' },
          { label: 'Conv. Rate',    value: `${convRate}%`,      sub: 'applied → interview',   topColor: '#f4a11a' },
          { label: 'Total',         value: String(jobs.length), sub: 'applications',           topColor: '#1a2b3c' },
        ].map(({ label, value, sub, topColor }) => (
          <div key={label} className="rounded-lg overflow-hidden" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
            <div className="h-1" style={{ background: topColor }} />
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>{label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: '#1a2b3c' }}>{value}</p>
              <p className="text-[10px] mt-1" style={{ color: '#aaa' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status funnel */}
        <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
          <p className="text-xs font-semibold mb-4" style={{ color: '#1a2b3c' }}>Status Funnel</p>
          <div className="space-y-3">
            {FUNNEL.map(({ status, color }) => {
              const count = jobs.filter((j) => j.status === status).length;
              const pct = jobs.length ? ((count / jobs.length) * 100).toFixed(0) : '0';
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: '#888' }}>{status}</span>
                    <span style={{ color: '#aaa' }}>{count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0eeea' }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / funnelMax) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score distribution */}
        <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
          <p className="text-xs font-semibold mb-4" style={{ color: '#1a2b3c' }}>Score Distribution</p>
          <div className="space-y-3">
            {scoreBuckets.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: '#888' }}>{b.label}</span>
                  <span style={{ color: '#aaa' }}>{b.count}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0eeea' }}>
                  <div className="h-full rounded-full" style={{ width: `${(b.count / bucketMax) * 100}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top scored */}
      <div className="rounded-lg p-5" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
        <p className="text-xs font-semibold mb-4" style={{ color: '#1a2b3c' }}>Top Scored Offers</p>
        <div className="space-y-3">
          {top.map((job, i) => (
            <div key={job.id} className="flex items-center gap-3">
              <span className="text-xs tabular-nums w-4" style={{ color: '#ccc' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#1a2b3c' }}>{job.company}</p>
                <p className="text-xs truncate" style={{ color: '#aaa' }}>{job.role}</p>
              </div>
              <span className="text-sm font-bold tabular-nums" style={{ color: SCORE_COLOR(job.score ?? 0) }}>{(job.score ?? 0).toFixed(1)}</span>
            </div>
          ))}
          {top.length === 0 && <p className="text-xs" style={{ color: '#aaa' }}>No scored offers yet.</p>}
        </div>
      </div>
    </div>
  );
}
