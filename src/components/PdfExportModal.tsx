import React from 'react';
import {
  CheckSquare,
  Download,
  FileText,
  Printer,
  Square,
  X
} from 'lucide-react';
import {
  AppLanguage,
  BookRecord,
  PdfExportMode,
  PdfExportOptions,
  filterBookItemsForPdf
} from '../lib/karlukCore';
import { getUiStrings } from '../lib/i18n';
import { downloadBookPrintHtml } from '../lib/pdfAndAiClient';

interface PdfExportModalProps {
  book: BookRecord | null;
  options: PdfExportOptions;
  language: AppLanguage;
  onChangeOptions: (next: PdfExportOptions) => void;
  onClose: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  book,
  options,
  language,
  onChangeOptions,
  onClose,
  onNotify
}) => {
  if (!book) return null;

  const ui = getUiStrings(language);
  const sheetLang = book.language || language;
  const sheetUi = getUiStrings(sheetLang);
  const isSheetAr = sheetLang === 'ar';
  const isUiAr = language === 'ar';

  const modeOptions: Array<{ value: PdfExportMode; label: string; hint: string }> = [
    { value: 'study', label: ui.pdfModeStudy, hint: ui.pdfModeStudyHint },
    { value: 'quiz', label: ui.pdfModeQuiz, hint: ui.pdfModeQuizHint },
    { value: 'unmastered', label: ui.pdfModeUnmastered, hint: ui.pdfModeUnmasteredHint }
  ];

  const filteredItems = filterBookItemsForPdf(book, options.mode);
  const isQuiz = options.mode === 'quiz';
  const masteredCount = book.masteredIds.length;
  const unmasteredCount = Math.max(0, book.items.length - masteredCount);
  const previewSlice = filteredItems.slice(0, 6);

  const handlePrintNow = () => {
    onNotify(
      isUiAr
        ? `تم فتح نافذة طباعة PDF لـ «${book.title}» (اختر Save as PDF)`
        : `«${book.title}» نىڭ PDF بېسىش كۆزنىكى ئېچىلدى (Save as PDF نى تاللاڭ)`,
      'success'
    );
    window.setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadHtml = () => {
    try {
      downloadBookPrintHtml(book, options, language);
      onNotify(
        isUiAr
          ? `تم تنزيل ملف A4 PDF/HTML المستقل لـ «${book.title}»!`
          : `«${book.title}» مۇستەقىل A4 PDF/HTML ھۆججىتى چۈشۈرۈلدى!`,
        'success'
      );
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : isUiAr ? 'حدث خطأ أثناء تصدير HTML' : 'HTML چىقىرىشتا خاتالىق كۆرۈلدى',
        'error'
      );
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdfExportModalTitle"
      data-testid="pdf-export-modal"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[26px] border border-white/85 bg-[#F4F6FA]/95 text-[#1A1E24] shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#141B26]/95 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-900/10 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="primary-glass-cta flex h-10 w-10 items-center justify-center rounded-[14px] text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pdfExportModalTitle" className="text-[17px] font-bold">
                {ui.pdfModalTitle}
              </h2>
              <p className="tabular-nums text-[12px] text-[#555D6B] dark:text-slate-400">
                {isUiAr
                  ? `${book.title} · سيتم تصدير ${filteredItems.length} سؤالاً (غير المتقن: ${unmasteredCount})`
                  : `${book.title} · جەمئىي ${filteredItems.length} سۇئال چىقىرىلىدۇ (ئۆگەنمىگەن: ${unmasteredCount})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={ui.closeLabel}
            className="glass-pill flex h-9 w-9 cursor-pointer items-center justify-center rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-900/10 bg-white/45 px-6 py-3.5 dark:border-white/10 dark:bg-slate-900/45">
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={ui.pdfModalTitle}>
            {modeOptions.map((m) => {
              const selected = options.mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  data-testid={`pdf-mode-${m.value}`}
                  onClick={() => onChangeOptions({ ...options, mode: m.value })}
                  className={`cursor-pointer rounded-[16px] border px-3.5 py-2.5 text-right transition-all ${
                    selected
                      ? 'border-[#F05A28] bg-[#F05A28]/12 text-[#1A1E24] shadow-sm dark:text-white'
                      : 'border-white/75 bg-white/60 text-[#555D6B] hover:border-[#1F75FE]/50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300'
                  }`}
                >
                  <div className="text-[13px] font-bold">{m.label}</div>
                  <div className="mt-0.5 text-[11px] opacity-85">{m.hint}</div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-semibold">
            <button
              type="button"
              onClick={() => onChangeOptions({ ...options, includeCategory: !options.includeCategory })}
              className="flex cursor-pointer items-center gap-1.5 text-[#1A1E24] dark:text-slate-200"
            >
              {options.includeCategory ? (
                <CheckSquare className="h-4 w-4 text-[#1FA982]" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>{ui.pdfIncludeCategory}</span>
            </button>

            {isQuiz && (
              <button
                type="button"
                onClick={() => onChangeOptions({ ...options, includeAnswerKey: !options.includeAnswerKey })}
                className="flex cursor-pointer items-center gap-1.5 text-[#1A1E24] dark:text-slate-200"
              >
                {options.includeAnswerKey ? (
                  <CheckSquare className="h-4 w-4 text-[#1F75FE]" />
                ) : (
                  <Square className="h-4 w-4 text-slate-400" />
                )}
                <span>{ui.pdfIncludeAnswerKey}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live A4 Sheet Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-200/75 p-5 dark:bg-slate-950/75">
          <div
            lang={sheetLang}
            dir="rtl"
            data-testid="pdf-preview-paper"
            className="mx-auto max-w-[720px] rounded-[14px] border border-slate-300 bg-white p-7 text-[#1A1E24] shadow-lg"
          >
            <header className="mb-5 border-b-2 border-[#F05A28] pb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[19px] font-bold text-[#1A1E24]">{book.title}</h3>
                <span className="text-[12px] font-bold text-[#F05A28]">
                  {options.mode === 'quiz'
                    ? sheetUi.pdfModeQuiz
                    : options.mode === 'unmastered'
                      ? sheetUi.pdfModeUnmastered
                      : sheetUi.pdfModeStudy}
                </span>
              </div>
              <div className="tabular-nums mt-1 text-[12px] text-[#555D6B]">
                {sheetUi.brandTitle} · {filteredItems.length} {sheetUi.pdfQuestionSuffix} · {sheetUi.masteredLabel}: {masteredCount} / {book.items.length}
              </div>
            </header>

            <div className="flex flex-col gap-3">
              {previewSlice.map((item, idx) => (
                <article key={`${item.id}-${idx}`} className="rounded-[12px] border border-slate-200 p-3.5">
                  <div className="mb-1 flex items-center justify-between text-[11.5px] font-bold text-[#F05A28]">
                    <span>{isSheetAr ? `السؤال ${idx + 1}` : `${idx + 1}-سۇئال`}</span>
                    {options.includeCategory && <span>{item.category || (isSheetAr ? 'معرفة أساسية' : 'ئاساسىي بىلىم')}</span>}
                  </div>
                  <div className="uyghur-paragraph mb-1 text-[14px] font-bold text-[#1A1E24]">
                    {item.question}
                  </div>
                  {isQuiz ? (
                    <div className="mt-2.5 flex flex-col gap-3">
                      <div className="h-4 border-b border-dashed border-slate-400" />
                      <div className="h-4 border-b border-dashed border-slate-400" />
                    </div>
                  ) : (
                    <p className="uyghur-paragraph text-[13px] text-slate-700">
                      <strong>{sheetUi.answerLabel}</strong> {item.answer}
                    </p>
                  )}
                </article>
              ))}

              {filteredItems.length > previewSlice.length && (
                <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-center text-[12.5px] font-semibold text-[#555D6B]">
                  {isSheetAr
                    ? `... وتظهر بقية الأسئلة (${filteredItems.length - previewSlice.length}) كاملة في مستند A4 PDF المطبوع`
                    : `... يەنە ${filteredItems.length - previewSlice.length} سۇئال بېسىلىدىغان A4 PDF ھۆججىتىدە تولۇق كۆرۈنىدۇ`}
                </div>
              )}

              {isQuiz && options.includeAnswerKey && (
                <div className="mt-3 rounded-[12px] border border-[#1F75FE]/30 bg-[#1F75FE]/5 p-3.5 text-[12.5px] text-[#1F75FE]">
                  <strong>{sheetUi.pdfAnswerKeyLabel}:</strong>{' '}
                  {isSheetAr
                    ? `تُضاف إجابات الأسئلة (${filteredItems.length}) في صفحة مستقلة بنهاية الملف.`
                    : `${filteredItems.length} سۇئالنىڭ جاۋابى ئايرىم ئاخىرقى بەتكە قوشۇلىدۇ.`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/10 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1A1E24] dark:text-slate-100"
          >
            <Download className="h-4 w-4 text-[#1F75FE]" />
            <span>{ui.pdfDownloadHtmlBtn}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="glass-pill cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold text-[#555D6B] dark:text-slate-300"
            >
              {ui.closeLabel}
            </button>
            <button
              type="button"
              onClick={handlePrintNow}
              data-testid="pdf-modal-print-btn"
              className="primary-glass-cta flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-[13.5px] font-bold text-white"
            >
              <Printer className="h-4 w-4" />
              <span>{ui.pdfPrintBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
