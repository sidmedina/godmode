"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, FileText } from "lucide-react";
import { useJobContext } from "@/lib/job-context";
import { STATUS_CONFIG } from "@/lib/types";
import type { Job } from "@/lib/types";

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

export default function ApplicationsPage() {
  const { openDetail, setSelectedJob } = useJobContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).filter((j: Job) => j.status !== 'Pipeline')))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...jobs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-6">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: '#1a2b3c' }}>Applications</h1>
          <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{sorted.length} evaluated</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin" style={{ color: '#00853e' }} />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e0ddd8', background: '#fff' }}>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f8f6', borderBottom: '1px solid #e0ddd8' }}>
                {['#', 'Company', 'Role', 'Score', 'Status', 'Date', 'Notes', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((job, i) => {
                const cfg = STATUS_CONFIG[job.status];
                return (
                  <tr
                    key={job.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < sorted.length - 1 ? '1px solid #f0eeea' : 'none', background: i % 2 === 0 ? '#fff' : '#faf9f7' }}
                    onClick={() => setSelectedJob(job)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f4f4f2'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#faf9f7'; }}
                  >
                    <td className="px-4 py-3 text-[11px] tabular-nums" style={{ color: '#ccc' }}>{String(job.id).padStart(3, '0')}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: '#1a2b3c' }}>{job.company}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-xs truncate block" style={{ color: '#888' }}>{job.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      {job.score !== null ? (
                        <span className="text-sm font-bold tabular-nums" style={{ color: SCORE_COLOR(job.score) }}>{job.score.toFixed(1)}</span>
                      ) : <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums" style={{ color: '#ccc' }}>{job.date}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px]">
                      <span className="truncate block" style={{ color: '#aaa' }}>{job.notes}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetail(job); }}
                          className="text-[10px] px-2.5 py-1 rounded font-medium transition-colors"
                          style={{ background: '#f4f4f2', color: '#555', border: '1px solid #e0ddd8' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#00853e'; (e.currentTarget as HTMLElement).style.color = '#00853e'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e0ddd8'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
                        >
                          Open
                        </button>
                        {job.url && (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="transition-colors" style={{ color: '#ccc' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {job.hasPdf && <FileText size={13} style={{ color: '#ccc' }} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm" style={{ color: '#aaa' }}>No applications yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
