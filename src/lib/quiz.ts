import type { QuestionItem } from "@/types/hr";

export interface QuizOption {
  text: string;
  correct: boolean;
}

/** Soru kimliğine göre sabit (tekrarlanabilir) karıştırma */
function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function short(text: string, max = 220): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/** Bir soru için 4 seçenek üretir: doğru cevap + diğer soruların kısa cevaplarından 3 çeldirici. */
export function buildQuizOptions(question: QuestionItem, pool: QuestionItem[], round = 0): QuizOption[] {
  const correct = short(question.shortAnswer);
  const used = new Set([correct.toLowerCase(), question.question.toLowerCase()]);

  const distractors: string[] = [];
  for (const q of shuffle(pool, question.id + round * 17)) {
    if (q.id === question.id) continue;
    const candidate = short(q.shortAnswer);
    const key = candidate.toLowerCase();
    if (!candidate || used.has(key) || candidate.length < 12) continue;
    // Doğru cevaba çok benzeyenleri atla
    if (candidate.toLowerCase().includes(question.topicRef.toLowerCase())) continue;
    used.add(key);
    distractors.push(candidate);
    if (distractors.length >= 3) break;
  }

  // Havuz küçükse genel çeldiricilerle tamamla
  const fallback = [
    "Bu konuda yasal bir süre veya hak sınırı bulunmamaktadır.",
    "Yalnızca işverenin yazılı onayı ile uygulanabilir.",
    "İşçinin talebi hâlinde tamamen ortadan kalkar.",
    "Bu husus toplu iş sözleşmesi ile serbestçe belirlenebilir.",
    "SGK bildirimi yapılmadan geçerlilik kazanmaz.",
  ];
  for (const f of fallback) {
    if (distractors.length >= 3) break;
    if (!used.has(f.toLowerCase())) {
      distractors.push(f);
      used.add(f.toLowerCase());
    }
  }

  const options: QuizOption[] = [{ text: correct, correct: true }, ...distractors.map((text) => ({ text, correct: false }))];
  return shuffle(options, question.id * 7 + round * 31 + 3);
}
