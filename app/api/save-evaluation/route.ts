import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CAREER_OPS_PATH = process.env.CAREER_OPS_PATH;

export async function POST(req: NextRequest) {
  const { company, role, score, notes, url, date } = await req.json();

  if (!CAREER_OPS_PATH) {
    return NextResponse.json({ ok: false, reason: 'local-only' });
  }

  const trackerPath = path.join(CAREER_OPS_PATH, 'data', 'applications.md');

  try {
    const existing = fs.readFileSync(trackerPath, 'utf-8');

    // Find max existing row number
    const rows = existing.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.match(/\|\s*#\s*\|/));
    const nums = rows.map(r => parseInt(r.split('|')[1]?.trim() || '0')).filter(n => !isNaN(n) && n > 0);
    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    const numStr = String(nextNum).padStart(3, '0');

    const scoreStr = score != null ? `${score}/5` : '';
    const newRow = `| ${numStr} | ${date} | ${company} | ${role} | ${scoreStr} | Evaluated | ❌ | — | ${notes} |`;

    const updated = existing.trimEnd() + '\n' + newRow + '\n';
    fs.writeFileSync(trackerPath, updated, 'utf-8');

    return NextResponse.json({ ok: true, num: nextNum });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as Error).message }, { status: 500 });
  }
}
