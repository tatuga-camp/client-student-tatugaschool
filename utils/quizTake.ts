import { QuizAnswerDraft } from "../interfaces";

export const emptyAnswer = (): QuizAnswerDraft => ({ selectedOptionIds: [], blankAnswers: [] });

export function isAnswered(answer: QuizAnswerDraft): boolean {
  return answer.selectedOptionIds.length > 0 || answer.blankAnswers.some((b) => b.value.trim().length > 0);
}

export function answeredIds(answers: Map<string, QuizAnswerDraft>): Set<string> {
  return new Set([...answers].filter(([, a]) => isAnswered(a)).map(([id]) => id));
}

export type PromptSegment = { kind: "text"; text: string } | { kind: "blank"; blankId: string };

export function promptSegments(prompt: string): PromptSegment[] {
  const segments: PromptSegment[] = [];
  let last = 0;
  for (const match of prompt.matchAll(/\{\{([A-Za-z0-9_-]{1,32})\}\}/g)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ kind: "text", text: prompt.slice(last, index) });
    segments.push({ kind: "blank", blankId: match[1] });
    last = index + match[0].length;
  }
  if (last < prompt.length) segments.push({ kind: "text", text: prompt.slice(last) });
  return segments;
}

export function clockOffset(serverNowIso: string, clientNowMs: number): number {
  return Date.parse(serverNowIso) - clientNowMs;
}

export function remainingMs(deadlineIso: string | null, offsetMs: number, clientNowMs: number): number | null {
  if (!deadlineIso) return null;
  return Date.parse(deadlineIso) - (clientNowMs + offsetMs);
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
