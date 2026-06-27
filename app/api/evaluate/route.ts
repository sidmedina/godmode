import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CAREER_OPS_PATH = process.env.CAREER_OPS_PATH;

function readFile(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return ''; }
}

function getCareerContext(): string {
  if (!CAREER_OPS_PATH) return '';
  const cv = readFile(path.join(CAREER_OPS_PATH, 'cv.md'));
  const profile = readFile(path.join(CAREER_OPS_PATH, 'config', 'profile.yml'));
  return `## Candidate CV\n${cv}\n\n## Profile\n${profile}`;
}

const STATIC_CONTEXT = `
## Candidate: Sidarta Medina
- Location: Uxbridge/Markham, Ontario, Canada
- Target roles: Senior Sales Operations Manager, Sales Operations Manager, Revenue Operations Manager
- Compensation target: CAD $120K-160K (minimum $110K)
- Location: Remote preferred, hybrid possible. No visa sponsorship needed.
- Superpowers: Revenue forecasting (5.5% MAPE vs 10% benchmark), Power BI automation (40% workload reduction), incentive compensation for 40+ RSMs, CRM governance (Salesforce), territory/quota modeling, bilingual English/Spanish.
- 10+ years in Sales Operations, Revenue Operations, Commercial Strategy at Johnson Controls and Armstrong Fluid Technology.
`.trim();

const EVAL_SYSTEM = `You are a senior career advisor evaluating job postings for Sidarta Medina using the career-ops framework.

Score each job 1.0–5.0 on these dimensions:
- CV Match: how well his experience maps to requirements
- Role Alignment: fit with his target archetypes (Sales Ops, RevOps, Commercial Strategy)
- Compensation: estimated comp vs his $120K-160K CAD target
- Culture/Remote: remote-friendliness, company stability, growth signals
- Red Flags: deductions for ghost jobs, mismatch, overqualified/underqualified

Be direct and honest. If the role is a bad fit, say so clearly.

End your response with exactly this JSON block (no markdown fences, just the raw JSON on its own line):
EVAL_JSON:{"company":"<name>","role":"<title>","score":<1.0-5.0>,"notes":"<one sentence>","recommendation":"apply|consider|skip"}`;

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
  }

  const { url, jdText } = await req.json();
  if (!url && !jdText) {
    return NextResponse.json({ error: 'url or jdText required' }, { status: 400 });
  }

  // Fetch job posting if URL provided
  let jobContent = jdText || '';
  if (url && !jdText) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; career-ops/1.0)' },
        signal: AbortSignal.timeout(15_000),
      });
      const html = await res.text();
      // Strip HTML tags for cleaner content
      jobContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim()
        .slice(0, 12000);
    } catch (e) {
      return NextResponse.json({ error: `Could not fetch URL: ${(e as Error).message}` }, { status: 400 });
    }
  }

  const careerContext = getCareerContext() || STATIC_CONTEXT;

  const userMessage = `${careerContext}

---

## Job Posting URL
${url || '(pasted text)'}

## Job Posting Content
${jobContent}

---

Evaluate this job for Sidarta using the career-ops framework. Be specific about CV match with real examples from his background. Give an honest score and clear recommendation.`;

  // Stream from Anthropic
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      stream: true,
      system: EVAL_SYSTEM,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!anthropicRes.ok || !anthropicRes.body) {
    const err = await anthropicRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  // Pipe the stream directly to the client
  return new NextResponse(anthropicRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
