import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

const CAREER_OPS_PATH = process.env.CAREER_OPS_PATH;

export async function POST() {
  if (!CAREER_OPS_PATH) {
    return NextResponse.json(
      { ok: false, error: 'Scan only works locally. Run export-snapshot.mjs and push to update data.' },
      { status: 503 }
    );
  }
  return new Promise<NextResponse>((resolve) => {
    exec(
      `node scan.mjs`,
      { cwd: CAREER_OPS_PATH, timeout: 120_000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[scan] error:', error.message);
          resolve(NextResponse.json({ ok: false, error: error.message }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ ok: true, output: stdout || stderr }));
        }
      }
    );
  });
}
