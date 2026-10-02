import { useState } from "react";
import type { PageDetailProps } from "@amitkk/basic/types/page";
import ContentRenderer from "@amitkk/basic/static/ContentRenderer";
import { UI_STRINGS } from "@amitkk/basic/utils/config";

export interface FaqProps { 
  question: string;
  answer: string; 
}

export interface FaqFinalProps { 
  faq: FaqProps[]; 
  details?: PageDetailProps; 
}

export default function FaqPanel({ faq, details }: FaqFinalProps) {
  if (!faq?.length) return null;

  const [open, setOpen] = useState<number | null>();
  const heading = details?.faq_title?.trim() || UI_STRINGS.faq_title;
  const text = details?.faq_text?.trim() || UI_STRINGS.faq_text;

  return (
    <section className="container py-5 md:py-12">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0A1628]/60">{heading}</p>
      <h2 className="mb-12 text-3xl font-medium text-[#0A1628] md:text-5xl">{text}</h2>

      <div className="space-y-4 text-left">
        {faq.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#0A1628]/10 bg-white">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left">
              <span className="text-base font-semibold text-[#0A1628]">{item.question}</span>
              <span className="text-xl font-bold text-[#0A1628]">{open === i ? "−" : "+"}</span>
            </button>

            {open === i && <ContentRenderer className="p-5" content={item?.answer || ""}/> }
          </div>
        ))}
      </div>
    </section>
  );
}