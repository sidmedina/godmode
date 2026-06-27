"use client";
import type { ReactNode } from 'react';
import { JobProvider, useJobContext } from '@/lib/job-context';
import { Sidebar } from './sidebar';
import { ChatPanel } from './chat-panel';
import { JobDetailModal } from './job-detail-modal';

function AppContent({ children }: { children: ReactNode }) {
  const { detailOpen, selectedJob, closeDetail } = useJobContext();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f4f4f2' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      <ChatPanel />
      {detailOpen && selectedJob && (
        <JobDetailModal job={selectedJob} onClose={closeDetail} />
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <JobProvider>
      <AppContent>{children}</AppContent>
    </JobProvider>
  );
}
