import { NextRequest, NextResponse } from 'next/server';
import type { NetworkingContact } from '@/lib/types';

const API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  const { company, role } = await req.json();

  if (!API_KEY) {
    return NextResponse.json({ contact: stubContact(company, role) });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `For this job: ${role} at ${company}

Suggest the most likely hiring manager or internal champion to network with.
Return ONLY JSON (no markdown):
{"name":"...","title":"...","department":"...","linkedInQuery":"...","introMessage":"..."}

- name: realistic person name for this type of company/role
- title: most likely title of hiring decision-maker
- department: their department
- linkedInQuery: exact LinkedIn search string (e.g. '"Head of Sales" "${company}" site:linkedin.com')
- introMessage: 3-sentence personalized LinkedIn connection note`,
        },
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ contact: stubContact(company, role) });

  const data = await res.json();
  try {
    const text: string = data.content?.[0]?.text ?? '{}';
    const match = text.match(/\{[\s\S]+\}/);
    const contact: NetworkingContact = match ? JSON.parse(match[0]) : stubContact(company, role);
    return NextResponse.json({ contact });
  } catch {
    return NextResponse.json({ contact: stubContact(company, role) });
  }
}

function stubContact(company: string, role: string): NetworkingContact {
  const isSales = /sales|revenue|gtm|commercial/i.test(role);
  const isAI = /ai|machine learning|data|ml/i.test(role);
  const isExec = /director|head|vp|chief|svp/i.test(role);

  const title = isExec
    ? (isSales ? 'Chief Revenue Officer' : isAI ? 'Chief AI Officer' : 'Chief Operating Officer')
    : (isSales ? 'VP of Sales' : isAI ? 'VP of AI & Data' : 'Head of Talent');

  const dept = isSales ? 'Revenue Operations' : isAI ? 'AI & Product' : 'People Operations';

  return {
    name: '— Add API key for real name —',
    title,
    department: dept,
    linkedInQuery: `"${title}" "${company}" site:linkedin.com`,
    introMessage: `Hi [Name], I came across the ${role} opening at ${company} and was genuinely excited — the intersection of [specific initiative] with what ${company} is building is exactly the space I've been focused on. I'd love to connect and learn more about the team's direction. Happy to share my background if that would be helpful.`,
  };
}
