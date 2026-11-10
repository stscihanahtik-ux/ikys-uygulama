export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*_#`>]/g, "")
    .replace(/•/g, "")
    .replace(/\n+/g, ". ")
    .trim();
}

export function speakTurkish(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    rate?: number;
  }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onError?.();
    return;
  }

  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options?.onEnd?.();
    return;
  }

  // Uzun metinleri cümle cümle kuyruğa al (bazı tarayıcıların kesme sorununu önler)
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  let started = false;

  sentences.forEach((sentence, idx) => {
    const utterance = new SpeechSynthesisUtterance(sentence.trim());
    utterance.lang = "tr-TR";
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const trVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith("tr") && /female|kadın|filiz/i.test(v.name)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("tr")) ||
      null;
    if (trVoice) utterance.voice = trVoice;

    if (idx === 0) {
      utterance.onstart = () => {
        if (!started) { started = true; options?.onStart?.(); }
      };
    }
    if (idx === sentences.length - 1) {
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = () => options?.onError?.();
    }
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
