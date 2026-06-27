"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Briefcase, ListOrdered, Inbox, BarChart2, Users, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useJobContext } from "@/lib/job-context";
import type { NetworkingContact } from "@/lib/types";

const nav = [
  { href: "/",             label: "Overview",     icon: LayoutDashboard },
  { href: "/jobs",         label: "Jobs",         icon: Briefcase },
  { href: "/applications", label: "Applications", icon: ListOrdered },
  { href: "/pipeline",     label: "Pipeline",     icon: Inbox },
  { href: "/analytics",    label: "Analytics",    icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { selectedJob } = useJobContext();
  const [contact, setContact] = useState<NetworkingContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const findContact = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const res = await fetch('/api/networking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: selectedJob.company, role: selectedJob.role }),
      });
      const data = await res.json();
      setContact(data.contact);
    } catch {}
    setLoading(false);
  };

  const copyIntro = () => {
    if (!contact) return;
    navigator.clipboard.writeText(contact.introMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-52 shrink-0 flex flex-col h-full" style={{ background: '#1a2b3c' }}>
      <div className="px-4 py-4 flex items-center gap-2.5 shrink-0" style={{ borderBottom: '1px solid #223344' }}>
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 font-black text-sm" style={{ background: '#00853e', color: '#fff' }}>G</div>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#fff' }}>GodMode</p>
          <p className="text-[9px] tracking-wider uppercase" style={{ color: '#7a9ab0' }}>Career Accelerator</p>
        </div>
      </div>

      <nav className="px-2 py-3 space-y-0.5 shrink-0">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors"
              style={active ? { background: '#00853e', color: '#fff', fontWeight: 500 } : { color: '#7a9ab0' }}
              onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#223344'; (e.currentTarget as HTMLElement).style.color = '#d0dce8'; } }}
              onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7a9ab0'; } }}
            >
              <Icon size={14} />{label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 flex flex-col min-h-0" style={{ borderTop: '1px solid #223344' }}>
        <div className="px-3 py-2.5 flex items-center gap-1.5 shrink-0">
          <Users size={11} style={{ color: '#4a6a80' }} />
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#4a6a80' }}>Networking</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {!selectedJob ? (
            <p className="text-[11px] leading-relaxed" style={{ color: '#4a6a80' }}>Select a job to find the right contact.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded p-2.5" style={{ background: '#223344', border: '1px solid #2d4055' }}>
                <p className="text-xs font-medium truncate" style={{ color: '#d0dce8' }}>{selectedJob.company}</p>
                <p className="text-[10px] truncate mt-0.5" style={{ color: '#7a9ab0' }}>{selectedJob.role}</p>
              </div>
              {!contact ? (
                <button onClick={findContact} disabled={loading} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium" style={{ background: 'transparent', border: '1px solid #00853e', color: '#00853e' }}>
                  {loading ? <Loader2 size={11} className="animate-spin" /> : null}
                  {loading ? 'Searching...' : 'Find Hiring Manager'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="rounded p-2.5 space-y-1" style={{ background: '#223344', border: '1px solid #2d4055' }}>
                    <p className="text-xs font-medium" style={{ color: '#d0dce8' }}>{contact.name}</p>
                    <p className="text-[10px]" style={{ color: '#7a9ab0' }}>{contact.title}</p>
                    <p className="text-[10px]" style={{ color: '#4a6a80' }}>{contact.department}</p>
                    <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(contact.linkedInQuery)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] mt-1" style={{ color: '#00853e' }}>
                      <ExternalLink size={9} /> Search LinkedIn
                    </a>
                  </div>
                  <div className="rounded p-2.5" style={{ background: '#223344', border: '1px solid #2d4055' }}>
                    <p className="text-[10px] mb-1.5" style={{ color: '#7a9ab0' }}>Intro message:</p>
                    <p className="text-[10px] leading-relaxed" style={{ color: '#7a9ab0' }}>{contact.introMessage.slice(0, 120)}…</p>
                    <button onClick={copyIntro} className="flex items-center gap-1 text-[10px] mt-2" style={{ color: copied ? '#00853e' : '#7a9ab0' }}>
                      {copied ? <Check size={9} /> : <Copy size={9} />}
                      {copied ? 'Copied!' : 'Copy full message'}
                    </button>
                  </div>
                  <button onClick={() => { setContact(null); findContact(); }} className="text-[10px]" style={{ color: '#4a6a80' }}>Regenerate</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2.5 shrink-0" style={{ borderTop: '1px solid #223344' }}>
        <p className="text-[10px] truncate" style={{ color: '#4a6a80' }}>sidarta.medina@gmail.com</p>
      </div>
    </aside>
  );
}
