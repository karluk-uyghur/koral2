import React from 'react';
import {
  AppLanguage,
  BookRecord,
  PdfExportOptions,
  filterBookItemsForPdf
} from '../lib/karlukCore';
import { getUiStrings } from '../lib/i18n';

interface PrintableBookSheetProps {
  book: BookRecord | null;
  options: PdfExportOptions;
  language: AppLanguage;
}

export const PrintableBookSheet: React.FC<PrintableBookSheetProps> = ({ book, options, language }) => {
  if (!book) {
    return null;
  }

  const lang = book.language || language;
  const isAr = lang === 'ar';
  const t = getUiStrings(lang);
  const items = filterBookItemsForPdf(book, options.mode);
  const isQuiz = options.mode === 'quiz';
  const masteredCount = book.masteredIds.length;
  const masteryPct = book.items.length > 0 ? Math.round((masteredCount / book.items.length) * 100) : 0;
  const modeLabel =
    options.mode === 'quiz'
      ? t.pdfModeQuiz
      : options.mode === 'unmastered'
        ? t.pdfModeUnmastered
        : t.pdfModeStudy;

  return (
    <section
      id="karluk-print-sheet"
      lang={lang}
      dir="rtl"
      aria-label={t.pdfModalTitle}
      className="hidden bg-white p-8 text-[#1A1E24] print:block"
    >
      <header className="mb-6 border-b-2 border-[#F05A28] pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[22px] font-bold text-[#1A1E24]">{book.title}</h1>
          <span className="tabular-nums text-[12px] font-bold text-[#F05A28]">{modeLabel}</span>
        </div>
        <div className="tabular-nums mt-1.5 flex flex-wrap items-center gap-3 text-[12.5px] text-[#555D6B]">
          <span>{t.brandTitle}</span>
          <span>·</span>
          <span>{isAr ? `الأسئلة المصدّرة: ${items.length}` : `چىقىرىلغان سۇئال: ${items.length}`}</span>
          <span>·</span>
          <span>
            {t.masteredLabel}: {masteredCount} / {book.items.length} ({masteryPct}%)
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <article
            key={`${item.id}-${idx}`}
            className="break-inside-avoid rounded-[12px] border border-slate-300 p-4"
          >
            <div className="mb-1.5 flex items-center justify-between text-[12px] font-bold text-[#F05A28]">
              <span>{isAr ? `السؤال ${idx + 1}` : `${idx + 1}-سۇئال`}</span>
              {options.includeCategory && <span>{item.category || (isAr ? 'معرفة أساسية' : 'ئاساسىي بىلىم')}</span>}
            </div>
            <h2 className="uyghur-paragraph mb-1.5 text-[14.5px] font-bold text-[#1A1E24]">
              {item.question}
            </h2>
            {isQuiz ? (
              <div className="mt-3 flex flex-col gap-4">
                <div className="h-5 border-b border-dashed border-slate-400" />
                <div className="h-5 border-b border-dashed border-slate-400" />
              </div>
            ) : (
              <p className="uyghur-paragraph text-[13.5px] text-slate-700">
                <strong>{t.answerLabel}</strong> {item.answer}
              </p>
            )}
          </article>
        ))}
      </div>

      {isQuiz && options.includeAnswerKey && (
        <section className="mt-8 break-before-page border-t-2 border-[#1F75FE] pt-5">
          <h2 className="mb-4 text-[18px] font-bold text-[#1A1E24]">
            {t.pdfAnswerKeyLabel} ({items.length} {t.pdfQuestionSuffix})
          </h2>
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={`key-${item.id}-${idx}`} className="text-[13px] leading-relaxed text-slate-700">
                <strong className="text-[#1A1E24]">{idx + 1}.</strong> {item.answer}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};
