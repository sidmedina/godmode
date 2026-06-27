import { NextRequest, NextResponse } from 'next/server';
import type { Job } from '@/lib/types';

const API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  const { messages, jobContext } = (await req.json()) as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    jobContext: Job | null;
  };

  const lastMsg = messages[messages.length - 1]?.content ?? '';

  if (!API_KEY) {
    return NextResponse.json({ message: stubResponse(lastMsg, jobContext) });
  }

  const system = jobContext
    ? `You are GodMode, an elite career AI. The user is viewing a job: ${jobContext.role} at ${jobContext.company} (score ${jobContext.score}/5, status: ${jobContext.status}). Notes: "${jobContext.notes}". Help with follow-ups, emails, negotiation, and strategy. Be direct and concise.`
    : `You are GodMode, an elite career AI. Help the user with job search strategy, follow-ups, email drafts, negotiation, and interview prep. Be direct, concrete, and actionable.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ message: stubResponse(lastMsg, jobContext) });
  }

  const data = await res.json();
  return NextResponse.json({ message: data.content?.[0]?.text ?? 'Something went wrong.' });
}

function stubResponse(msg: string, job: Job | null): string {
  const m = msg.toLowerCase();
  const co = job?.company ?? 'the company';
  const role = job?.role ?? 'the role';
  const status = job?.status ?? '';

  if (m.includes('follow') || m.includes('follow-up')) {
    return `**Follow-up for ${co}**\n\nBased on your ${status} status, here's a template:\n\n---\nSubject: Following up — ${role}\n\nHi [Name],\n\nI wanted to follow up on my application for the ${role} position. I remain very interested and would love to learn about next steps.\n\nLooking forward to connecting.\n\nBest,\n[Your name]\n\n---\n\n> Add your **ANTHROPIC_API_KEY** to .env.local for personalized AI responses.`;
  }

  if (m.includes('draft') || m.includes('email')) {
    return `**Email Draft Tips for ${co}**\n\n• Lead with one specific reason you're excited about them\n• Reference something recent (product launch, news, funding)\n• Keep it under 120 words\n• End with a clear, low-commitment ask\n\n> Add your **ANTHROPIC_API_KEY** to .env.local to generate full AI-drafted emails.`;
  }

  if (m.includes('negotiat')) {
    return `**Negotiation for ${co}**\n\n1. Always anchor high — first number sets the range\n2. Negotiate on total comp: base + equity + bonus + benefits\n3. Get competing offers first if possible\n4. "I'm very excited about this role. Is there flexibility on the base?" — simple, non-threatening\n\n> Add your **ANTHROPIC_API_KEY** to unlock full negotiation scripts.`;
  }

  if (m.includes('status') || m.includes('when')) {
    const advice: Record<string, string> = {
      Applied: 'You applied — wait 5–7 business days, then send one follow-up.',
      Interview: 'You\'re in interviews — prep hard. Use the Interview Prep tab for Q&A.',
      Evaluated: 'Evaluated but not yet applied — check the score. 4.0+ is worth a full application.',
      Pipeline: 'Still in pipeline — run the career-ops evaluator on this one.',
      Offer: 'Offer stage! Negotiate. Don\'t accept the first number.',
    };
    return advice[status] ?? `Current status: **${status}**. Keep the momentum — follow up if it's been more than a week.`;
  }

  return `GodMode Career Assistant is ready.\n\nI can help you:\n• Draft follow-up emails\n• Negotiate offers\n• Prep for interviews\n• Assess application timing\n\nSelect a job card to give me context, or ask me anything.\n\n> Add **ANTHROPIC_API_KEY** to .env.local for full AI-powered responses.`;
}
