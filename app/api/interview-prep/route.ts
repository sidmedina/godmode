import { NextRequest, NextResponse } from 'next/server';
import type { InterviewQuestion } from '@/lib/types';

const API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  const { company, role, notes } = await req.json();

  if (!API_KEY) {
    return NextResponse.json({ questions: stubQuestions(company, role) });
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
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate 6 interview questions with suggested answers for:
Company: ${company}
Role: ${role}
Notes: ${notes}

Return ONLY a JSON array (no markdown) with this shape:
[{"category":"Behavioral","question":"...","suggestedAnswer":"..."}]

Categories: Behavioral, Strategic, Leadership, Cultural Fit`,
        },
      ],
    }),
  });

  if (!res.ok) return NextResponse.json({ questions: stubQuestions(company, role) });

  const data = await res.json();
  try {
    const text: string = data.content?.[0]?.text ?? '[]';
    const match = text.match(/\[[\s\S]+\]/);
    const questions: InterviewQuestion[] = match ? JSON.parse(match[0]) : stubQuestions(company, role);
    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: stubQuestions(company, role) });
  }
}

function stubQuestions(company: string, role: string): InterviewQuestion[] {
  const exec = /director|head|vp|chief|lead|manager/i.test(role);
  return [
    {
      category: 'Behavioral',
      question: `Tell me about a time you drove measurable results in a role similar to ${role}.`,
      suggestedAnswer: `Use STAR: describe the Situation, your Task, the Actions you took (emphasize leadership and cross-functional collaboration), and the quantified Result. Then bridge directly to what ${company} is trying to achieve with this hire.`,
    },
    {
      category: exec ? 'Leadership' : 'Technical',
      question: exec
        ? `What's your philosophy for building and scaling a high-performing team?`
        : `Walk me through your technical approach to a complex problem in this domain.`,
      suggestedAnswer: exec
        ? `Cover: hiring for potential + culture fit, setting clear measurable expectations, creating psychological safety, tying individual growth to company outcomes. Give a concrete example with outcome metrics.`
        : `Describe your systematic approach: problem decomposition, methodology selection, iterative testing, validation. Use a real example from your experience with quantified results.`,
    },
    {
      category: 'Strategic',
      question: `What would your 30/60/90-day plan look like if you joined ${company} in this role?`,
      suggestedAnswer: `30 days: listen deeply — understand team dynamics, key stakeholders, current KPIs, quick wins. 60 days: identify the 2–3 highest-leverage opportunities, begin executing on at least one. 90 days: deliver a visible win, propose a roadmap tied to company goals, establish your operating cadence.`,
    },
    {
      category: 'Cultural Fit',
      question: `Why ${company} specifically, and why this particular role at this stage in your career?`,
      suggestedAnswer: `Research 2–3 specific things about ${company} (product direction, market position, recent initiatives). Connect them authentically to your personal mission. Show you understand their specific challenges and that you're motivated by solving exactly those problems — not just the role title.`,
    },
    {
      category: 'Behavioral',
      question: `Describe a high-stakes decision you made with incomplete information. How did you handle the uncertainty?`,
      suggestedAnswer: `Frame it as: gathered best available data quickly → aligned key stakeholders → assessed reversibility → made a decision with a clear thesis → communicated transparently → monitored outcomes and course-corrected. Show comfort with ambiguity and accountability for results, regardless of outcome.`,
    },
    {
      category: 'Strategic',
      question: `What industry trends do you think ${company} needs to pay the most attention to in the next 2 years?`,
      suggestedAnswer: `Pick 2–3 macro trends directly relevant to the role (AI adoption, market consolidation, buyer behavior shifts, regulatory changes). Have a strong point of view — not just awareness. Then connect how ${company}'s current positioning creates both risk and opportunity relative to those trends.`,
    },
  ];
}
