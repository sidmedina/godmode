export type JobStatus =
  | "Pipeline"
  | "Evaluated"
  | "Applied"
  | "Responded"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Discarded"
  | "SKIP";

export interface Job {
  id: number;
  date: string;
  company: string;
  role: string;
  score: number | null;
  status: JobStatus;
  hasPdf: boolean;
  reportSlug?: string;
  notes: string;
  url?: string;
  coverLetter?: string;
  hrManagerName?: string;
  hrManagerEmail?: string;
  hiringManagerName?: string;
  hiringManagerEmail?: string;
  companyAddress?: string;
  postedDate?: string;
  workType?: string;
  salaryPosted?: string;
  cvText?: string;
  coverLetterText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface NetworkingContact {
  name: string;
  title: string;
  department: string;
  linkedInQuery: string;
  introMessage: string;
}

export interface InterviewQuestion {
  category: string;
  question: string;
  suggestedAnswer: string;
}

export const STATUS_CONFIG: Record<JobStatus, { label: string; bar: string; text: string; bg: string }> = {
  Pipeline:  { label: 'Pipeline',  bar: '#bbbbbb', text: '#888888', bg: '#f0eeea' },
  Evaluated: { label: 'Evaluated', bar: '#999999', text: '#777777', bg: '#f0eeea' },
  Applied:   { label: 'Applied',   bar: '#5b8fc9', text: '#2a5f9e', bg: '#e8eef7' },
  Responded: { label: 'Responded', bar: '#1a7aab', text: '#1a5f8a', bg: '#e0eff7' },
  Interview: { label: 'Interview', bar: '#f4a11a', text: '#c87d00', bg: '#fef4e0' },
  Offer:     { label: 'Offer',     bar: '#00853e', text: '#00853e', bg: '#e8f4ef' },
  Rejected:  { label: 'Rejected',  bar: '#c0392b', text: '#c0392b', bg: '#fce8e8' },
  Discarded: { label: 'Discarded', bar: '#cccccc', text: '#aaaaaa', bg: '#f5f5f5' },
  SKIP:      { label: 'Skip',      bar: '#cccccc', text: '#aaaaaa', bg: '#f5f5f5' },
};
