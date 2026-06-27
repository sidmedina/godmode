"use client";

import { useEffect, useState } from "react";
import { Loader2, ExternalLink, RefreshCw, Play, Plus } from "lucide-react";
import type { Job } from "@/lib/types";

export default function PipelinePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs ?? []).filter((j: Job) => j.status === 'Pipeline')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const runScan = async () => {
    setScanning(true);
    setScanMsg('Scanning portals…');
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setScanMsg('Scan complete — refreshing…');
        fetchJobs();
      } else {
        setScanMsg(`Scan error: ${data.error}`);
      }
    } catch {
      setScanMsg('Scan failed. Check that career-ops is installed.');
    }
    setScanning(false);
    setTimeout(() => setScanMsg(''), 5000);
  };

  const addUrl = () => {
    if (!newUrl.trim()) return;
    setJobs((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        company: extractCompany(newUrl),
        role: 'Pending Evaluation',
        score: null,
        status: 'Pipeline',
        hasPdf: false,
        notes: '',
        url: newUrl.trim(),
      } as Job,
      ...prev,
    ]);
    setNewUrl('');
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold" style={{ color: '#1a2b3c' }}>Pipeline</h1>
          <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>
            {jobs.length} URL{jobs.length !== 1 ? 's' : ''} pending · Last scan: daily at 6:00 AM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchJobs} className="p-1.5 rounded transition-colors" style={{ color: '#ccc', border: '1px solid #e0ddd8' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
            <RefreshCw size={13} />
          </button>
          <button
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors"
            style={{ background: scanning ? '#f0eeea' : '#1a2b3c', color: scanning ? '#aaa' : '#fff' }}
          >
            {scanning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            {scanning ? 'Scanning…' : 'Scan Now'}
          </button>
        </div>
      </div>

      {scanMsg && (
        <div className="mb-4 px-4 py-2.5 rounded text-xs" style={{ background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }}>
          {scanMsg}
        </div>
      )}

      {/* Add URL */}
      <div className="flex gap-2 mb-6">
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addUrl(); }}
          placeholder="Paste a job URL to add to pipeline…"
          className="flex-1 px-3 py-2 rounded text-xs outline-none"
          style={{ background: '#fff', border: '1px solid #e0ddd8', color: '#333' }}
          onFocus={(e) => { (e.target as HTMLElement).style.borderColor = '#00853e'; }}
          onBlur={(e) => { (e.target as HTMLElement).style.borderColor = '#e0ddd8'; }}
        />
        <button onClick={addUrl} className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium"
          style={{ background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }}>
          <Plus size={12} /> Add
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin" style={{ color: '#00853e' }} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg px-6 py-12 text-center" style={{ background: '#fff', border: '1px solid #e0ddd8' }}>
          <p className="text-sm" style={{ color: '#aaa' }}>Pipeline is empty.</p>
          <p className="text-xs mt-1" style={{ color: '#ccc' }}>Paste a URL above or hit Scan Now to find new offers.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-3 rounded-lg px-4 py-3"
              style={{ background: '#fff', border: '1px solid #e0ddd8', borderLeft: '3px solid #00853e' }}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00853e' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1a2b3c' }}>{job.company}</p>
                <p className="text-[10px] font-mono truncate mt-0.5" style={{ color: '#aaa' }}>{job.url}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`vscode://file/C:/Users/sidme/Documents/career-ops`}
                  className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded font-semibold"
                  style={{ background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }}
                  title="Open in CareerOps to evaluate"
                >
                  Evaluate
                </a>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="transition-colors" style={{ color: '#ccc' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#ccc'; }}>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function extractCompany(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    if (['greenhouse.io', 'lever.co', 'ashbyhq.com'].some((h) => hostname.includes(h))) {
      const seg = pathname.split('/').find((s) => s.length > 2 && !/^\d/.test(s));
      if (seg) return seg.replace(/-/g, ' ');
    }
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch { return 'Unknown'; }
}
