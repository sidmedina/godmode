import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { readApplications, readPipeline } from '@/lib/career-ops-reader';
import type { Job, JobStatus } from '@/lib/types';

function readSnapshot(): Job[] {
  try {
    const snapshotPath = path.join(process.cwd(), 'data', 'snapshot.json');
    const raw = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    return raw.jobs ?? [];
  } catch {
    return [];
  }
}

const MOCK_APPS: Job[] = [
  { id: 1, date: '2026-04-22', company: 'Armstrong Fluid Technology', role: 'Global Sales Excellence Manager', score: 4.0, status: 'Evaluated', hasPdf: true, reportSlug: '001-armstrong-fluid-technology-2026-04-22', notes: 'Strong skills match; comp unknown — clarify before investing full prep' },
  { id: 2, date: '2026-04-28', company: 'NovaTech AI', role: 'AI Solutions Director', score: 4.8, status: 'Interview', hasPdf: true, reportSlug: '002-novatech-ai-2026-04-28', notes: 'Dream role — prep intensively' },
  { id: 3, date: '2026-05-02', company: 'Acme Corp', role: 'Head of Applied AI', score: 4.5, status: 'Applied', hasPdf: true, reportSlug: '003-acme-corp-2026-05-02', notes: 'Strong fit, competitive package' },
  { id: 4, date: '2026-05-06', company: 'Dataflow Systems', role: 'VP Sales Engineering', score: 3.2, status: 'SKIP', hasPdf: false, reportSlug: '004-dataflow-systems-2026-05-06', notes: 'Score too low, stack mismatch' },
  { id: 5, date: '2026-05-10', company: 'CloudScale', role: 'Enterprise AI Lead', score: 3.8, status: 'Rejected', hasPdf: true, reportSlug: '005-cloudscale-2026-05-10', notes: 'Rejected after first screen' },
  { id: 6, date: '2026-05-14', company: 'MindBridge Analytics', role: 'Director of AI Strategy', score: 4.2, status: 'Applied', hasPdf: true, reportSlug: '006-mindbridge-2026-05-14', notes: 'Good comp, interesting product direction' },
  { id: 7, date: '2026-05-18', company: 'Nexus Robotics', role: 'Head of AI Partnerships', score: 3.5, status: 'Evaluated', hasPdf: false, reportSlug: '007-nexus-robotics-2026-05-18', notes: 'Below threshold, reconsidering' },
  { id: 8, date: '2026-05-20', company: 'Deepmind Ventures', role: 'AI Programme Lead', score: 4.6, status: 'Evaluated', hasPdf: true, reportSlug: '008-deepmind-ventures-2026-05-20', notes: 'Excellent comp, international team' },
];

const MOCK_PIPELINE: Job[] = [
  { id: 2001, date: '2026-05-20', company: 'Stripe', role: 'Pending Evaluation', score: null, status: 'Pipeline', hasPdf: false, notes: 'AI/Automation Lead role', url: 'https://jobs.lever.co/stripe/abc123' },
  { id: 2002, date: '2026-05-21', company: 'OpenAI', role: 'Pending Evaluation', score: null, status: 'Pipeline', hasPdf: false, notes: 'GTM AI role', url: 'https://boards.greenhouse.io/openai/jobs/456' },
  { id: 2003, date: '2026-05-21', company: 'Anthropic', role: 'Pending Evaluation', score: null, status: 'Pipeline', hasPdf: false, notes: '', url: 'https://ashby.io/jobs/anthropic/789' },
  { id: 2004, date: '2026-05-22', company: 'Linear', role: 'Pending Evaluation', score: null, status: 'Pipeline', hasPdf: false, notes: 'Enterprise AI', url: 'https://jobs.lever.co/linear/321' },
];

export async function GET() {
  const apps = readApplications();
  const pipeline = readPipeline();
  const hasLive = apps.length > 0 || pipeline.length > 0;

  let jobs: Job[];
  if (hasLive) {
    jobs = [...apps, ...pipeline];
  } else {
    const snapshot = readSnapshot();
    jobs = snapshot.length > 0 ? snapshot : [...MOCK_APPS, ...MOCK_PIPELINE];
  }

  return NextResponse.json({ jobs });
}
