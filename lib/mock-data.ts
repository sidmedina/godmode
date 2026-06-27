export type ApplicationStatus =
  | "Evaluated"
  | "Applied"
  | "Responded"
  | "Interview"
  | "Offer"
  | "Rejected"
  | "Discarded"
  | "SKIP";

export type PipelineStatus = "pending" | "evaluating" | "done" | "skip";

export interface Application {
  id: number;
  date: string;
  company: string;
  role: string;
  score: number;
  status: ApplicationStatus;
  hasPdf: boolean;
  reportSlug: string;
  notes: string;
}

export interface PipelineItem {
  id: number;
  url: string;
  company: string;
  addedDate: string;
  status: PipelineStatus;
  notes?: string;
}

export const applications: Application[] = [
  {
    id: 1,
    date: "2026-04-22",
    company: "Armstrong Fluid Technology",
    role: "Global Sales Excellence Manager",
    score: 4.0,
    status: "Evaluated",
    hasPdf: true,
    reportSlug: "001-armstrong-fluid-technology-2026-04-22",
    notes: "Strong skills match; comp unknown — clarify before investing full prep",
  },
  {
    id: 2,
    date: "2026-04-28",
    company: "NovaTech AI",
    role: "AI Solutions Director",
    score: 4.8,
    status: "Interview",
    hasPdf: true,
    reportSlug: "002-novatech-ai-2026-04-28",
    notes: "Dream role — prep intensively",
  },
  {
    id: 3,
    date: "2026-05-02",
    company: "Acme Corp",
    role: "Head of Applied AI",
    score: 4.5,
    status: "Applied",
    hasPdf: true,
    reportSlug: "003-acme-corp-2026-05-02",
    notes: "Strong fit, competitive package",
  },
  {
    id: 4,
    date: "2026-05-06",
    company: "Dataflow Systems",
    role: "VP Sales Engineering",
    score: 3.2,
    status: "SKIP",
    hasPdf: false,
    reportSlug: "004-dataflow-systems-2026-05-06",
    notes: "Score too low, stack mismatch",
  },
  {
    id: 5,
    date: "2026-05-10",
    company: "CloudScale",
    role: "Enterprise AI Lead",
    score: 3.8,
    status: "Rejected",
    hasPdf: true,
    reportSlug: "005-cloudscale-2026-05-10",
    notes: "Rejected after first screen",
  },
  {
    id: 6,
    date: "2026-05-14",
    company: "MindBridge Analytics",
    role: "Director of AI Strategy",
    score: 4.2,
    status: "Applied",
    hasPdf: true,
    reportSlug: "006-mindbridge-2026-05-14",
    notes: "Good comp, interesting product direction",
  },
  {
    id: 7,
    date: "2026-05-18",
    company: "Nexus Robotics",
    role: "Head of AI Partnerships",
    score: 3.5,
    status: "Evaluated",
    hasPdf: false,
    reportSlug: "007-nexus-robotics-2026-05-18",
    notes: "Below threshold, reconsidering",
  },
  {
    id: 8,
    date: "2026-05-20",
    company: "Deepmind Ventures",
    role: "AI Programme Lead",
    score: 4.6,
    status: "Evaluated",
    hasPdf: true,
    reportSlug: "008-deepmind-ventures-2026-05-20",
    notes: "Excellent comp, international team",
  },
];

export const pipeline: PipelineItem[] = [
  {
    id: 1,
    url: "https://jobs.lever.co/stripe/abc123",
    company: "Stripe",
    addedDate: "2026-05-20",
    status: "pending",
    notes: "AI/Automation Lead role",
  },
  {
    id: 2,
    url: "https://boards.greenhouse.io/openai/jobs/456",
    company: "OpenAI",
    addedDate: "2026-05-21",
    status: "pending",
    notes: "GTM AI role",
  },
  {
    id: 3,
    url: "https://ashby.io/jobs/anthropic/789",
    company: "Anthropic",
    addedDate: "2026-05-21",
    status: "evaluating",
    notes: "Currently evaluating",
  },
  {
    id: 4,
    url: "https://jobs.lever.co/linear/321",
    company: "Linear",
    addedDate: "2026-05-22",
    status: "pending",
  },
  {
    id: 5,
    url: "https://jobs.greenhouse.io/figma/654",
    company: "Figma",
    addedDate: "2026-05-22",
    status: "pending",
    notes: "Enterprise AI",
  },
];
