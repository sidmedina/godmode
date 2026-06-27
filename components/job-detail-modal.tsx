"use client";

import { useState } from "react";
import { X, Loader2, Copy, Check, ExternalLink, FileText, Brain, Users } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/types";
import type { Job, InterviewQuestion, NetworkingContact } from "@/lib/types";

type Tab = 'details' | 'prep' | 'networking';

const SCORE_COLOR = (s: number) =>
  s >= 4.5 ? '#00853e' : s >= 4.0 ? '#1a2b3c' : s >= 3.5 ? '#c87d00' : '#c0392b';

export function JobDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('details');
  const [coverLetter, setCoverLetter] = useState(job.coverLetter ?? '');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [openQ, setOpenQ] = useState<number | null>(null);
  const [contact, setContact] = useState<NetworkingContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = STATUS_CONFIG[job.status];

  const generatePrep = async () => {
    setLoadingPrep(true);
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: job.company, role: job.role, notes: job.notes }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setOpenQ(0);
    } catch {}
    setLoadingPrep(false);
  };

  const findContact = async () => {
    setLoadingContact(true);
    try {
      const res = await fetch('/api/networking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: job.company, role: job.role }),
      });
      const data = await res.json();
      setContact(data.contact);
    } catch {}
    setLoadingContact(false);
  };

  const copyIntro = () => {
    if (!contact) return;
    navigator.clipboard.writeText(contact.introMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,43,60,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #e0ddd8', boxShadow: '0 16px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Status bar */}
        <div className="h-1 w-full shrink-0" style={{ background: cfg.bar }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid #e0ddd8' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>{cfg.label}</span>
                {job.score !== null && (
                  <span className="text-[11px] font-bold" style={{ color: SCORE_COLOR(job.score) }}>{job.score.toFixed(1)}/5</span>
                )}
                <span className="text-[11px]" style={{ color: '#aaa' }}>{job.date}</span>
              </div>
              <h2 className="text-lg font-semibold" style={{ color: '#1a2b3c' }}>{job.company}</h2>
              <p className="text-sm mt-0.5" style={{ color: '#888' }}>{job.role}</p>
            </div>
            <button onClick={onClose} className="shrink-0 rounded p-1.5 transition-colors hover:bg-gray-100">
              <X size={16} style={{ color: '#999' }} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {([
              { id: 'details',    label: 'Details',        icon: FileText },
              { id: 'prep',       label: 'Interview Prep', icon: Brain },
              { id: 'networking', label: 'Networking',     icon: Users },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={tab === id
                  ? { background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }
                  : { background: 'transparent', color: '#999', border: '1px solid transparent' }}
              >
                <Icon size={11} />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* DETAILS */}
          {tab === 'details' && (
            <div className="p-6 space-y-5">
              {job.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#555' }}>{job.notes}</p>
                </div>
              )}
              {job.url && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Job Posting</p>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs" style={{ color: '#00853e' }}>
                    <ExternalLink size={12} /> Open original posting
                  </a>
                </div>
              )}
              <div style={{ borderTop: '1px solid #e0ddd8', paddingTop: '20px' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>CV / Cover Letter</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#ccc' }}>Paste your CareerOps-generated document here</p>
                  </div>
                  <a
                    href="vscode://file/C:/Users/sidme/Documents/career-ops"
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded font-medium"
                    style={{ background: '#f4f4f2', color: '#1a2b3c', border: '1px solid #e0ddd8' }}
                  >
                    <FileText size={11} /> Open CareerOps
                  </a>
                </div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Paste your tailored CV or cover letter here after generating it with CareerOps (/career-ops pdf)…"
                  rows={10}
                  className="w-full resize-none rounded px-4 py-3 text-xs leading-relaxed outline-none font-mono"
                  style={{ background: '#f9f8f6', color: '#555', border: '1px solid #e0ddd8' }}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = '#00853e'; }}
                  onBlur={(e) => { (e.target as HTMLElement).style.borderColor = '#e0ddd8'; }}
                />
              </div>
            </div>
          )}

          {/* INTERVIEW PREP */}
          {tab === 'prep' && (
            <div className="p-6 space-y-5">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#e8f4ef', border: '1px solid #b8dfc9' }}>
                    <Brain size={22} style={{ color: '#00853e' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: '#1a2b3c' }}>Generate Interview Q&A</p>
                    <p className="text-xs mt-1" style={{ color: '#aaa' }}>AI-tailored questions and suggested answers for {job.role} at {job.company}</p>
                  </div>
                  <button
                    onClick={generatePrep}
                    disabled={loadingPrep}
                    className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold"
                    style={{ background: '#00853e', color: '#fff' }}
                  >
                    {loadingPrep ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                    {loadingPrep ? 'Generating…' : 'Generate Questions'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: '#aaa' }}>{questions.length} questions generated for {job.role}</p>
                    <button onClick={generatePrep} disabled={loadingPrep} className="text-[10px] font-medium" style={{ color: '#00853e' }}>Regenerate</button>
                  </div>
                  {questions.map((q, i) => (
                    <div key={i} className="rounded overflow-hidden" style={{ border: '1px solid #e0ddd8' }}>
                      <button
                        onClick={() => setOpenQ(openQ === i ? null : i)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                        style={{ background: openQ === i ? '#f9f8f6' : '#fff' }}
                      >
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: '#f0eeea', color: '#999' }}>{q.category}</span>
                        <span className="text-xs font-medium flex-1" style={{ color: '#1a2b3c' }}>{q.question}</span>
                        <span className="text-[10px] shrink-0" style={{ color: '#aaa' }}>{openQ === i ? '▲' : '▼'}</span>
                      </button>
                      {openQ === i && (
                        <div className="px-4 py-3 text-xs leading-relaxed" style={{ background: '#f9f8f6', color: '#666', borderTop: '1px solid #e0ddd8' }}>
                          <p className="text-[10px] font-semibold mb-2 uppercase tracking-wider" style={{ color: '#00853e' }}>Suggested Answer</p>
                          {q.suggestedAnswer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NETWORKING */}
          {tab === 'networking' && (
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium" style={{ color: '#1a2b3c' }}>Find the right person to contact</p>
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>AI-suggested hiring manager or champion for {job.role} at {job.company}</p>
              </div>
              {!contact ? (
                <button
                  onClick={findContact}
                  disabled={loadingContact}
                  className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold"
                  style={{ background: '#1a2b3c', color: '#fff' }}
                >
                  {loadingContact ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                  {loadingContact ? 'Searching…' : 'Find Hiring Manager'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="rounded p-4 space-y-2" style={{ background: '#f9f8f6', border: '1px solid #e0ddd8' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#1a2b3c' }}>{contact.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#666' }}>{contact.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#aaa' }}>{contact.department} · {job.company}</p>
                      </div>
                      <a
                        href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(contact.linkedInQuery)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-medium"
                        style={{ background: '#e8f4ef', color: '#00853e', border: '1px solid #b8dfc9' }}
                      >
                        <ExternalLink size={10} /> LinkedIn
                      </a>
                    </div>
                    <p className="text-[10px]" style={{ color: '#aaa' }}>Search: <span style={{ color: '#888' }}>{contact.linkedInQuery}</span></p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#aaa' }}>LinkedIn Intro Message</p>
                      <button onClick={copyIntro} className="flex items-center gap-1 text-[11px] font-medium" style={{ color: copied ? '#00853e' : '#1a2b3c' }}>
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="rounded p-4 text-xs leading-relaxed" style={{ background: '#f9f8f6', border: '1px solid #e0ddd8', color: '#555' }}>
                      {contact.introMessage}
                    </div>
                  </div>
                  <button onClick={() => { setContact(null); findContact(); }} className="text-[11px]" style={{ color: '#aaa' }}>Regenerate suggestion</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
