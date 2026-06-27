"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List, RefreshCw, Loader2 } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { useJobContext } from "@/lib/job-context";
import { STATUS_CONFIG } from "@/lib/types";
import type { Job, JobStatus } from "@/lib/types";

const FILTER_TABS: { label: string; value: JobStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pipeline',  value: 'Pipeline' },
  { label: 'Evaluated', value: 'Evaluated' },
  { label: 'Applied',   value: 'Applied' },
  { label: 'Interview', value: 'Interview' },
  { label: 'Offer',     value: 'Offer' },
  { label: 'Rejected',  value: 'Rejected' },
];

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

export default function JobsPage() {
  const { openDetail, setSelectedJob } = useJobContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);
  const counts: Record<string, number> = { all: jobs.length };
  FILTER_TABS.slice(1).forEach(({ value }) => { counts[value] = jobs.filter((j) => j.status === value).length; });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 shrink-0" style={{ borderBottom: '1px solid #e0ddd8', background: '#fff' }}>
        <div className="flex items-center gap-1 overflow-x-auto">
          {FILTER_TABS.map(({ label, value }) => {
            const active = filter === value;
            const count = counts[value] ?? 0;
            if (count === 0 && value !== 'all') return null;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors"
                style={active
                  ? { background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }
                  : { background: 'transparent', color: '#aaa', border: '1px solid transparent' }}
              >
                {label}
                <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: active ? '#b8dfc9' : '#f0eeea', color: active ? '#00853e' : '#bbb' }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={fetchJobs} className="p-1.5 rounded transition-colors" style={{ color: '#ccc' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#00853e'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
            <RefreshCw size={13} />
          </button>
          <div className="flex rounded overflow-hidden" style={{ border: '1px solid #e0ddd8' }}>
            <button onClick={() => setView('cards')} className="flex items-center px-2.5 py-1.5 transition-colors"
              style={view === 'cards' ? { background: '#1a2b3c', color: '#fff' } : { background: 'transparent', color: '#aaa' }}>
              <LayoutGrid size={12} />
            </button>
            <button onClick={() => setView('list')} className="flex items-center px-2.5 py-1.5 transition-colors"
              style={view === 'list' ? { background: '#1a2b3c', color: '#fff' } : { background: 'transparent', color: '#aaa' }}>
              <List size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin" style={{ color: '#00853e' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-sm" style={{ color: '#aaa' }}>No jobs found</p>
          </div>
        ) : view === 'cards' ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filtered.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <ListView jobs={filtered} onOpen={openDetail} onSelect={setSelectedJob} />
        )}
      </div>
    </div>
  );
}

function ListView({ jobs, onOpen, onSelect }: { jobs: Job[]; onOpen: (j: Job) => void; onSelect: (j: Job | null) => void }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e0ddd8', background: '#fff' }}>
      <div className="grid text-[10px] font-semibold uppercase tracking-wider px-4 py-2"
        style={{ gridTemplateColumns: '2fr 2.5fr 60px 110px 80px 80px', color: '#aaa', background: '#f9f8f6', borderBottom: '1px solid #e0ddd8' }}>
        <span>Company</span><span>Role</span><span className="text-right">Score</span><span>Status</span><span>Date</span><span />
      </div>
      {jobs.map((job, i) => {
        const cfg = STATUS_CONFIG[job.status];
        return (
          <div key={job.id} className="grid items-center px-4 py-2.5 cursor-pointer transition-colors"
            style={{ gridTemplateColumns: '2fr 2.5fr 60px 110px 80px 80px', background: i % 2 === 0 ? '#fff' : '#faf9f7', borderBottom: i < jobs.length - 1 ? '1px solid #f0eeea' : 'none' }}
            onClick={() => onSelect(job)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f4f4f2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#faf9f7'; }}>
            <span className="text-xs font-semibold truncate pr-3" style={{ color: '#1a2b3c' }}>{job.company}</span>
            <span className="text-xs truncate pr-3" style={{ color: '#888' }}>{job.role}</span>
            <span className="text-xs font-bold tabular-nums text-right pr-3" style={{ color: job.score === null ? '#ccc' : SCORE_COLOR(job.score) }}>
              {job.score !== null ? job.score.toFixed(1) : '—'}
            </span>
            <span><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span></span>
            <span className="text-[11px]" style={{ color: '#ccc' }}>{job.date}</span>
            <div className="flex items-center gap-1.5 justify-end">
              <button onClick={(e) => { e.stopPropagation(); onOpen(job); }}
                className="text-[10px] px-2 py-1 rounded"
                style={{ background: '#f4f4f2', color: '#555', border: '1px solid #e0ddd8' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1a2b3c'; (e.currentTarget as HTMLElement).style.color = '#1a2b3c'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e0ddd8'; (e.currentTarget as HTMLElement).style.color = '#555'; }}>
                Open
              </button>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="text-[10px] px-2 py-1 rounded" style={{ background: '#f4f4f2', color: '#ccc', border: '1px solid #e0ddd8' }}>↗</a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
