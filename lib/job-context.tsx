"use client";
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Job } from './types';

interface JobContextValue {
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  detailOpen: boolean;
  openDetail: (job: Job) => void;
  closeDetail: () => void;
}

const JobContext = createContext<JobContextValue>({
  selectedJob: null,
  setSelectedJob: () => {},
  detailOpen: false,
  openDetail: () => {},
  closeDetail: () => {},
});

export function JobProvider({ children }: { children: ReactNode }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (job: Job) => {
    setSelectedJob(job);
    setDetailOpen(true);
  };

  const closeDetail = () => setDetailOpen(false);

  return (
    <JobContext.Provider value={{ selectedJob, setSelectedJob, detailOpen, openDetail, closeDetail }}>
      {children}
    </JobContext.Provider>
  );
}

export const useJobContext = () => useContext(JobContext);
