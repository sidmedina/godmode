import fs from 'fs';
import path from 'path';
import type { Job, JobStatus } from './types';

const CAREER_OPS_PATH =
  process.env.CAREER_OPS_PATH ||
  path.join('C:', 'Users', process.env.USERNAME || 'sidme', 'Documents', 'career-ops');

function parseScore(cell: string): number | null {
  const m = cell.match(/(\d+\.?\d*)/);
  return m ? parseFloat(m[1]) : null;
}

function parseReportLink(cell: string): string {
  const m = cell.match(/\[.*?\]\((.*?)\)/);
  return m ? m[1] : '';
}

export function readApplications(): Job[] {
  try {
    const content = fs.readFileSync(
      path.join(CAREER_OPS_PATH, 'data', 'applications.md'),
      'utf-8'
    );
    return content
      .split('\n')
      .filter((l) => l.startsWith('|') && !l.includes('---') && !l.match(/\|\s*#\s*\|/))
      .map((line, idx) => {
        const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
        if (cells.length < 5 || !cells[2]) return null;
        const slug = parseReportLink(cells[7] || '');
        return {
          id: parseInt(cells[0]) || idx + 1,
          date: cells[1] || '',
          company: cells[2],
          role: cells[3] || '',
          score: parseScore(cells[4] || ''),
          status: (cells[5] || 'Evaluated') as JobStatus,
          hasPdf: (cells[6] || '') === '✅',
          ...(slug ? { reportSlug: slug } : {}),
          notes: cells[8] || '',
        } as Job;
      })
      .filter((j): j is Job => j !== null);
  } catch {
    return [];
  }
}

export function readPipeline(): Job[] {
  try {
    const content = fs.readFileSync(
      path.join(CAREER_OPS_PATH, 'data', 'pipeline.md'),
      'utf-8'
    );
    let id = 2000;
    return content
      .split('\n')
      .filter((l) => l.trim().match(/^-?\s*https?:\/\//))
      .map((line) => {
        const url = line.replace(/^-?\s*/, '').split(/\s/)[0].trim();
        return {
          id: id++,
          date: new Date().toISOString().split('T')[0],
          company: extractCompany(url),
          role: 'Pending Evaluation',
          score: null,
          status: 'Pipeline' as JobStatus,
          hasPdf: false,
          notes: '',
          url,
        };
      })
      .filter((j) => j.url);
  } catch {
    return [];
  }
}

function extractCompany(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname.includes('greenhouse.io') || hostname.includes('lever.co') || hostname.includes('ashby')) {
      const seg = pathname.split('/').find((s) => s.length > 2 && !/^\d/.test(s));
      if (seg) return seg.replace(/-/g, ' ');
    }
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}
