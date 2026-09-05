"use client";

import { useState } from "react";
import { LEGAL } from "@/lib/legal";

export function FaqQuestionForm() {
  const [question, setQuestion] = useState("");
  return (
    <section className="mt-12 rounded-2xl bg-uf-bg-subtle p-5 sm:p-6" aria-labelledby="faq-question-title">
      <h2 id="faq-question-title" className="text-[20px] font-semibold tracking-tight">Deine Frage ist noch offen?</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-uf-text-secondary">Schreib uns, was du wissen möchtest. Deine Fragen helfen uns, diese Seite zu ergänzen.</p>
      <form className="mt-5" onSubmit={(event) => {
        event.preventDefault();
        if (!question.trim()) return;
        window.location.href = `mailto:${LEGAL.email}?subject=${encodeURIComponent("Frage zu Used Fruit")}&body=${encodeURIComponent(question.trim())}`;
      }}>
        <label htmlFor="faq-question" className="text-[14px] font-medium">Deine Frage</label>
        <textarea id="faq-question" required maxLength={2000} rows={5} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Was möchtest du über Used Fruit wissen?" className="mt-2 block w-full resize-y rounded-xl border border-uf-border bg-white px-3 py-3 text-[14px] outline-offset-2" />
        <p className="mt-2 text-[12px] leading-relaxed text-uf-text-secondary">Der Button öffnet dein E-Mail-Programm. Sende die vorbereitete Nachricht dort an <a href={`mailto:${LEGAL.email}`} className="underline underline-offset-2">{LEGAL.email}</a>.</p>
        <button type="submit" disabled={!question.trim()} className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-uf-text px-5 text-[14px] text-white disabled:cursor-not-allowed disabled:opacity-40">E-Mail vorbereiten</button>
      </form>
    </section>
  );
}
