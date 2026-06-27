"use client";

import { FileText, Brain, ArrowUpRight } from "lucide-react";
import { useJobContext } from "@/lib/job-context";
import { STATUS_CONFIG } from "@/lib/types";
import type { Job } from "@/lib/types";

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

const SCORE_BG = (s: number) =>
  s >= 4.5 ? '#e8f4ef' : s >= 4.0 ? '#e8edf4' : s >= 3.5 ? '#fef4e0' : '#fce8e8';

export function JobCard({ job }: { job: Job }) {
  const { openDetail, setSelectedJob } = useJobContext();
  const cfg = STATUS_CONFIG[job.status];

  return (
    <div
      onClick={() => setSelectedJob(job)}
      className="rounded-lg flex flex-col overflow-hidden cursor-pointer transition-shadow group"
      style={{ background: '#fff', border: '1px solid #e0ddd8' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Status bar */}
      <div className="h-1 w-full shrink-0" style={{ background: cfg.bar }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Company + Score */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight" style={{ color: '#1a2b3c' }}>{job.company}</p>
            <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: '#888' }}>{job.role}</p>
          </div>
          {job.score !== null && (
            <span className="shrink-0 text-xs font-bold tabular-nums px-1.5 py-0.5 rounded" style={{ background: SCORE_BG(job.score), color: SCORE_COLOR(job.score) }}>
              {job.score.toFixed(1)}
            </span>
          )}
        </div>

        {/* Status + Date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
          <span className="text-[10px]" style={{ color: '#aaa' }}>{job.date}</span>
          {job.hasPdf && <FileText size={10} style={{ color: '#ccc' }} />}
        </div>

        {/* Notes */}
        {job.notes && (
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: '#999' }}>{job.notes}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-auto pt-2" style={{ borderTop: '1px solid #f0eeea' }}>
          <button
            onClick={(e) => { e.stopPropagation(); openDetail(job); }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded transition-colors font-medium"
            style={{ background: '#f4f4f2', color: '#555', border: '1px solid #e0ddd8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1a2b3c'; (e.currentTarget as HTMLElement).style.color = '#1a2b3c'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e0ddd8'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
          >
            View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDetail(job); }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded transition-colors"
            style={{ background: '#f4f4f2', color: '#555', border: '1px solid #e0ddd8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#00853e'; (e.currentTarget as HTMLElement).style.color = '#00853e'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e0ddd8'; (e.currentTarget as HTMLElement).style.color = '#555'; }}
          >
            <Brain size={9} /> Prep
          </button>
          {job.url && (
            <a
              href={job.url} target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 text-[10px] transition-colors"
              style={{ color: '#ccc' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}
            >
              <ArrowUpRight size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
