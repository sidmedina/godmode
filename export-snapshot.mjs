/**
 * Run this locally whenever you want to update the Netlify deployment with fresh job data.
 * Usage: node export-snapshot.mjs
 * Then: git add data/snapshot.json && git commit -m "chore: refresh job data" && git push
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAREER_OPS_PATH =
  process.env.CAREER_OPS_PATH ||
  path.join('C:', 'Users', process.env.USERNAME || 'sidme', 'Documents', 'career-ops');

function parseScore(cell) {
  const m = cell.match(/(\d+\.?\d*)/);
  return m ? parseFloat(m[1]) : null;
}

function parseReportLink(cell) {
  const m = (cell || '').match(/\[.*?\]\((.*?)\)/);
  return m ? m[1] : '';
}

function extractCompany(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (['greenhouse.io', 'lever.co', 'ashby'].some((h) => hostname.includes(h))) {
      const seg = pathname.split('/').find((s) => s.length > 2 && !/^\d/.test(s));
      if (seg) return seg.replace(/-/g, ' ');
    }
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch { return 'Unknown'; }
}

function readApplications() {
  try {
    const content = fs.readFileSync(path.join(CAREER_OPS_PATH, 'data', 'applications.md'), 'utf-8');
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
          status: cells[5] || 'Evaluated',
          hasPdf: (cells[6] || '') === '✅',
          ...(slug ? { reportSlug: slug } : {}),
          notes: cells[8] || '',
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error('Could not read applications.md:', e.message);
    return [];
  }
}

function readPipeline() {
  try {
    const content = fs.readFileSync(path.join(CAREER_OPS_PATH, 'data', 'pipeline.md'), 'utf-8');
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
          status: 'Pipeline',
          hasPdf: false,
          notes: '',
          url,
        };
      })
      .filter((j) => j.url);
  } catch (e) {
    console.error('Could not read pipeline.md:', e.message);
    return [];
  }
}

const apps = readApplications();
const pipeline = readPipeline();
const snapshot = { jobs: [...apps, ...pipeline], exportedAt: new Date().toISOString() };

const outPath = path.join(__dirname, 'data', 'snapshot.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

console.log(`✅ Snapshot written to data/snapshot.json`);
console.log(`   ${apps.length} applications + ${pipeline.length} pipeline URLs`);
console.log('');
console.log('Next step: git add data/snapshot.json && git commit -m "chore: refresh job data" && git push');
