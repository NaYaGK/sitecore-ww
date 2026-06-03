export const ANTHROPIC_KEY_STORAGE = 'devops90_anthropic_api_key';

export function getApiKey(): string {
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (envKey) return envKey;
  return localStorage.getItem(ANTHROPIC_KEY_STORAGE) || '';
}

export function saveApiKey(key: string) {
  localStorage.setItem(ANTHROPIC_KEY_STORAGE, key.trim());
}

async function callClaude(prompt: string, maxTokens: number = 1000): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new Error('Anthropic API key is not configured. Please add it via Settings (◑) or set VITE_ANTHROPIC_API_KEY.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true' // needed because we make request from client browser
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorDetails}`);
  }

  const data = await response.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}

export const AIService = {
  async generateDailyBrief(day: string, label: string, phaseTitle: string, tasksText: string, note?: string): Promise<string> {
    const prompt = `You are a DevOps mentor helping an engineer study the 90 Days of DevOps curriculum.

Today's focus: ${day} — "${label}" (Phase: ${phaseTitle})
Tasks for today:
${tasksText}
${note ? 'Student notes: ' + note : ''}

Provide a concise, practical daily brief with exactly these sections (use these exact headings):

## 🎯 What You'll Learn Today
2-3 sentences explaining the core value of today's topics in plain English.

## ⚡ Key Concepts to Nail
3-4 bullet points with the most important concepts, each with a one-line explanation.

## 🛠 Hands-On Focus
The single most important practical exercise for today and why it matters.

## 🔗 How This Connects
One sentence connecting today's topic to the broader DevOps picture.

## ❓ Self-Check Question
One challenging question the student should be able to answer after completing today's tasks.

Keep it concise, actionable, and avoid generic advice. Be specific to the exact tools and concepts listed.`;

    return callClaude(prompt, 1000);
  },

  async generateQuiz(dayLabel: string, tasksText: string): Promise<{ question: string; options: string[]; answer: number; explanation: string }> {
    const prompt = `You are a DevOps interview coach. Generate a single challenging, scenario-based quiz question for someone who just studied: "${dayLabel}" covering: ${tasksText}

Return ONLY valid JSON in this exact format (no markdown, no backticks, no comments):
{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":0,"explanation":"..."}

Where answer is the 0-based index of the correct option. Make the question realistic and the distractors plausible.`;

    const textResponse = await callClaude(prompt, 600);
    const cleanText = textResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  },

  async gradeMockInterviewAnswer(question: string, modelAnswer: string, userAnswer: string): Promise<{
    score: number;
    correct: string[];
    missing: string[];
    wrong: string[];
    improvement: string;
  }> {
    const prompt = `You are a senior DevOps interviewer grading a candidate's answer.

Question: ${question}
Model answer: ${modelAnswer}
Candidate's answer: ${userAnswer || "(no answer given)"}

Grade this answer out of 100. Return ONLY valid JSON (no markdown, no backticks, no comments):
{"score":75,"correct":["point 1","point 2"],"missing":["concept A","concept B"],"wrong":["incorrect claim"],"improvement":"one sentence on how to improve"}

Score guide: 90+=excellent, 70-89=good, 50-69=partial, <50=needs work. Be strict — this is a real interview.`;

    const textResponse = await callClaude(prompt, 600);
    const cleanText = textResponse.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  },

  async generateLinkedInPost(context: string, tone: 'technical' | 'story' | 'insight'): Promise<string> {
    const toneInstructions = {
      technical: 'Write as a technical practitioner sharing real engineering insights. Include specific commands, configs, or architecture decisions. Avoid "excited to share" type fluff. Sound like a senior engineer, not a student.',
      story: 'Write as a short story: what you tried to do, what broke, what you figured out. First-person narrative. Vulnerable and honest. Engineers love this.',
      insight: 'Write one sharp, counterintuitive insight from today\'s work. Lead with the insight, then back it up with context. Short — under 300 words.'
    };

    const prompt = `Write a LinkedIn post for a DevOps engineer building in public.

Context: ${context}

Tone: ${toneInstructions[tone] || toneInstructions.technical}

CRITICAL RULES:
- NEVER start with "Excited to share" or "Today I learned" or "Thrilled to announce"
- DO start with something that makes someone stop scrolling — a counterintuitive claim, a specific number, or a question
- Write "what I built" not "what I learned" — engineers ship things
- Include 3-5 relevant hashtags at the end
- Optimal length: 800-1200 characters
- No bullet lists — LinkedIn favours short paragraphs with line breaks
- End with a question to drive comments`;

    return callClaude(prompt, 600);
  }
};
