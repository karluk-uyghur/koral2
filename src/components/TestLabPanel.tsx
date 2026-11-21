import React, { useState } from 'react';
import {
  Bell,
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileJson2,
  FileText,
  Languages,
  Loader2,
  Printer,
  ShieldCheck,
  Sparkles,
  Upload
} from 'lucide-react';
import {
  AppLanguage,
  BookRecord,
  PdfPageText,
  buildAiPrompt,
  buildSample30BookJson,
  generateLocalQaFromText,
  joinPdfPagesInRange,
  parseBookJson,
  serializeBookForExport
} from '../lib/karlukCore';
import { getUiStrings } from '../lib/i18n';
import {
  downloadBookJson,
  downloadJsonString,
  extractTextFromPdfFile,
  generateQaViaServer,
  readFileAsBase64
} from '../lib/pdfAndAiClient';

interface TestLabPanelProps {
  books: BookRecord[];
  activeBookId: string | null;
  reminderEnabled: boolean;
  language: AppLanguage;
  onChangeLanguage: (nextLang: AppLanguage) => void;
  onSelectBook: (bookId: string) => void;
  onAddBook: (book: BookRecord) => void;
  onPrintBookPdf: (book: BookRecord) => void;
  onTriggerStartupPreview: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const TestLabPanel: React.FC<TestLabPanelProps> = ({
  books,
  activeBookId,
  reminderEnabled,
  language,
  onChangeLanguage,
  onSelectBook,
  onAddBook,
  onPrintBookPdf,
  onTriggerStartupPreview,
  onNotify
}) => {
  const ui = getUiStrings(language);
  const isAr = language === 'ar';

  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PdfPageText[]>([]);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [qaCount, setQaCount] = useState<10 | 20 | 30>(30);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [pdfStatusNote, setPdfStatusNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showManualPrompt, setShowManualPrompt] = useState(false);
  const [manualJsonPaste, setManualJsonPaste] = useState('');

  const promptText = buildAiPrompt(topic, {
    language,
    count: qaCount,
    sourceText
  });

  const handleLoad30Sample = () => {
    try {
      const sampleBook = parseBookJson(buildSample30BookJson(language));
      onAddBook(sampleBook);
      onNotify(
        isAr
          ? 'تمت إضافة نموذج 30 سؤالاً وحفظه بشكل مستقل!'
          : '30 سۇئاللىق سىناق كىتاب قوشۇلدى ۋە ئايرىم ساقلاندى!',
        'success'
      );
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      onNotify(
        isAr ? `تم نسخ موجه JSON (${qaCount} سؤالاً)!` : `${qaCount} سۇئاللىق AI پىرۇمپىتى كۆچۈرۈلدى!`,
        'success'
      );
    } catch {
      onNotify(isAr ? 'تم إعداد الموجه' : 'پىرۇمپىت تەييارلاندى', 'success');
    }
  };

  const handleDownloadTemplateJson = () => {
    try {
      const sample = buildSample30BookJson(language);
      downloadJsonString(isAr ? 'karluk_template_ar' : 'karluk_template_ug', sample);
      onNotify(
        isAr ? 'تم تنزيل قالب JSON (30 سؤالاً)!' : '30 سۇئاللىق JSON قېلىپ چۈشۈرۈلدى!',
        'success'
      );
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'JSON error', 'error');
    }
  };

  const handleDirectExportTextAsJson = () => {
    try {
      const generated = generateLocalQaFromText(sourceText, topic.trim() || undefined, qaCount, language);
      downloadJsonString(generated.title, serializeBookForExport(generated));
      onNotify(
        isAr
          ? `تم تحويل النص وتنزيل ملف JSON (${generated.items.length} سؤالاً)!`
          : `تېكىستتىن ${generated.items.length} سۇئاللىق JSON ھۆججىتى ياسىلىپ چۈشۈرۈلدى!`,
        'success'
      );
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : isAr ? 'تعذر تحويل النص إلى JSON' : 'تېكىستتىن JSON چىقىرىشتا خاتالىق',
        'error'
      );
    }
  };

  const handleSaveManualJson = () => {
    try {
      const created = parseBookJson(manualJsonPaste, topic.trim() || undefined);
      onAddBook(created);
      setManualJsonPaste('');
      onNotify(
        isAr
          ? `تم حفظ «${created.title}» (${created.items.length} سؤالاً) بنجاح!`
          : `«${created.title}» (${created.items.length} سۇئال) مۇۋەپپەقىيەتلىك ساقلاندى!`,
        'success'
      );
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : isAr ? 'تعذر قراءة JSON' : 'JSON ئوقۇشتا خاتالىق كۆرۈلدى',
        'error'
      );
    }
  };

  const handleDirectJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result || '');
        const fallbackTitle = file.name.replace(/\.json$/i, '');
        const book = parseBookJson(text);
        const isGenericTitle = book.title === 'يېڭى كىتاب' || book.title === 'كتاب جديد';
        const finalBook = isGenericTitle && fallbackTitle ? { ...book, title: fallbackTitle } : book;
        onAddBook(finalBook);
        onNotify(
          isAr
            ? `تم تحميل «${finalBook.title}» (${finalBook.items.length} سؤالاً) بنجاح!`
            : `«${finalBook.title}» (${finalBook.items.length} سۇئال) مۇۋەپپەقىيەتلىك يۈكلەندى!`,
          'success'
        );
      } catch (err) {
        onNotify(
          err instanceof Error ? err.message : isAr ? 'خطأ في قراءة JSON' : 'JSON ھۆججىتىنى ئوقۇشتا خاتالىق',
          'error'
        );
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handlePageRangeUpdate = (nextFrom: number, nextTo: number, pagesOverride?: PdfPageText[]) => {
    const pages = pagesOverride || pdfPages;
    if (pages.length === 0) return;
    const total = pages.length;
    const clampedFrom = Math.max(1, Math.min(total, Number.isFinite(nextFrom) ? Math.round(nextFrom) : 1));
    const clampedTo = Math.max(clampedFrom, Math.min(total, Number.isFinite(nextTo) ? Math.round(nextTo) : total));
    setFromPage(clampedFrom);
    setToPage(clampedTo);
    const sliced = joinPdfPagesInRange(pages, clampedFrom, clampedTo);
    setSourceText(sliced);
    setPdfStatusNote(
      isAr
        ? `تم تحديد الصفحات ${clampedFrom}–${clampedTo} (من ${total} صفحة · ${sliced.length} حرفاً)`
        : `${clampedFrom}–${clampedTo}-بەتلەر تاللاندى (${total} بەتتىن · ${sliced.length} ھەرپ)`
    );
  };

  const handleSourceFileSelect = async (file: File | undefined) => {
    if (!file) return;
    const fallbackTitle = file.name.replace(/\.(pdf|txt|md)$/i, '');
    if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfPages([]);
      setIsReadingPdf(true);
      setPdfStatusNote(ui.readingPdf);
      try {
        const extracted = await extractTextFromPdfFile(file, (curr, total) => {
          setPdfStatusNote(
            isAr ? `جارٍ قراءة الصفحة ${curr} / ${total}...` : `بەت ${curr} / ${total} ئوقۇلۇۋاتىدۇ...`
          );
        });
        if (!topic.trim()) {
          setTopic(extracted.metadataTitle || fallbackTitle);
        }
        setPdfPages(extracted.pages);
        setFromPage(1);
        setToPage(Math.max(1, extracted.pageCount));
        if (!extracted.isScanned && extracted.text.length >= 20) {
          setSourceText(extracted.text);
          const msg = isAr
            ? `تمت قراءة «${file.name}» (${extracted.pageCount} صفحة، ${extracted.text.length} حرفاً) — اختر نطاق الصفحات أو عدد الأسئلة.`
            : `«${file.name}» ئوقۇلدى (${extracted.pageCount} بەت، ${extracted.text.length} ھەرپ) — بەت دائىرىسى ياكى سۇئال سانىنى تاللاڭ.`;
          setPdfStatusNote(msg);
          onNotify(msg, 'success');
        } else {
          const msg = isAr
            ? `ملف «${file.name}» (${extracted.pageCount} صفحة) ممسوح ضوئياً — اضغط «إنشاء ${qaCount} سؤالاً بالذكاء الاصطناعي».`
            : `«${file.name}» (${extracted.pageCount} بەت) رەسىم شەكلىدىكى PDF ئىكەن — «AI بىلەن ${qaCount} سۇئال-جاۋاب ياساش» نى بېسىڭ.`;
          setPdfStatusNote(msg);
          onNotify(msg, 'success');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : isAr ? 'تعذرت قراءة PDF' : 'PDF ئوقۇشتا خاتالىق كۆرۈلدى';
        setPdfStatusNote(
          isAr ? 'تعذر استخراج النص محلياً — جرّب التحليل بالذكاء الاصطناعي.' : 'PDF تېكىستىنى يەرلىك يېشىپ بولالمىدى — AI بىلەن ئوقۇتۇپ سىناڭ.'
        );
        onNotify(msg, 'error');
      } finally {
        setIsReadingPdf(false);
      }
      return;
    }
    if (!topic.trim()) {
      setTopic(fallbackTitle);
    }
    setPdfFile(null);
    setPdfPages([]);
    setPdfStatusNote('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSourceText(String(ev.target?.result || ''));
      onNotify(isAr ? 'تمت قراءة ملف النص!' : 'تېكىست ھۆججىتى ئوقۇلدى!', 'success');
    };
    reader.onerror = () => onNotify(isAr ? 'خطأ في قراءة الملف' : 'ھۆججەت ئوقۇشتا خاتالىق', 'error');
    reader.readAsText(file, 'UTF-8');
  };

  const handleGenerateAiQa = async () => {
    if (!pdfFile && !sourceText.trim()) {
      onNotify(
        isAr ? 'أرفق ملف PDF أو أدخل نص الكتاب/الدرس.' : 'PDF ھۆججىتى قېتىڭ ياكى كىتاب/دەرسلىك تېكىستىنى يېزىڭ.',
        'error'
      );
      return;
    }
    setIsGenerating(true);
    try {
      const pdfBase64 = pdfFile && !sourceText.trim() ? await readFileAsBase64(pdfFile) : undefined;
      const created = await generateQaViaServer({
        bookTitle: topic.trim() || undefined,
        text: sourceText.trim() || undefined,
        pdfBase64,
        count: qaCount,
        language
      });
      onAddBook(created);
      setSourceText('');
      setPdfFile(null);
      setPdfPages([]);
      setPdfStatusNote('');
      onNotify(
        isAr
          ? `تم إنشاء «${created.title}» (${created.items.length} سؤالاً) وحفظه!`
          : `«${created.title}» (${created.items.length} سۇئال) بىۋاسىتە ياسىلىپ ساقلاندى!`,
        'success'
      );
    } catch (err) {
      onNotify(
        err instanceof Error ? err.message : isAr ? 'حدث خطأ في الذكاء الاصطناعي' : 'AI سۇئال-جاۋاب ياساشتا خاتالىق كۆرۈلدى',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLocalOffline = () => {
    try {
      const created = generateLocalQaFromText(sourceText, topic.trim() || undefined, qaCount, language);
      onAddBook(created);
      setSourceText('');
      setPdfFile(null);
      setPdfPages([]);
      setPdfStatusNote('');
      onNotify(
        isAr
          ? `تم إنشاء «${created.title}» (${created.items.length} سؤالاً) دون إنترنت!`
          : `«${created.title}» (${created.items.length} سۇئال) تور سىرتىدا ياسالدى!`,
        'success'
      );
    } catch (err) {
      onNotify(err instanceof Error ? err.message : isAr ? 'تعذر الإنشاء من النص' : 'تېكىستتىن ياساشتا خاتالىق', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Built-in AI & PDF Q&A Generator */}
      <section className="glass-surface rounded-[22px] p-6" data-testid="built-in-ai-generator">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-bold text-[#1A1E24] dark:text-slate-100">
              {ui.labTitle(qaCount)}
            </h2>
            <p className="mt-1 text-[13px] text-[#555D6B] dark:text-slate-400">
              {ui.labSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-white/75 bg-white/55 p-1 dark:border-white/10 dark:bg-slate-900/55" role="group" aria-label={ui.languageLabel}>
            <Languages className="mr-1 h-3.5 w-3.5 text-[#1F75FE]" />
            <button
              type="button"
              onClick={() => onChangeLanguage('ug')}
              data-testid="lab-lang-ug"
              className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
                language === 'ug' ? 'primary-glass-cta text-white' : 'text-[#555D6B] dark:text-slate-300'
              }`}
            >
              {ui.languageUg}
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('ar')}
              data-testid="lab-lang-ar"
              className={`cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
                language === 'ar' ? 'primary-glass-cta text-white' : 'text-[#555D6B] dark:text-slate-300'
              }`}
            >
              {ui.languageAr}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="labTopicInput" className="mb-1 block text-[12.5px] font-semibold text-[#555D6B] dark:text-slate-300">
              {ui.labSourceTitleLabel}
            </label>
            <input
              id="labTopicInput"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={ui.labSourceTitlePlaceholder}
              className="w-full rounded-[14px] border border-white/80 bg-white/70 px-3.5 py-2 text-[14px] text-[#1A1E24] outline-none focus:border-[#1F75FE] dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </div>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleSourceFileSelect(e.dataTransfer.files?.[0]);
            }}
            className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-[16px] border border-dashed border-[#1F75FE]/50 bg-[#1F75FE]/5 px-4 py-3 text-[13px] transition-colors hover:bg-[#1F75FE]/10"
          >
            <span className="flex items-center gap-2 font-medium text-[#1A1E24] dark:text-slate-100">
              {isReadingPdf ? <Loader2 className="h-4 w-4 animate-spin text-[#1F75FE]" /> : <FileText className="h-4 w-4 text-[#1F75FE]" />}
              <span>
                {isReadingPdf
                  ? ui.readingPdf
                  : pdfFile
                    ? pdfFile.name
                    : ui.labDropZoneHint}
              </span>
            </span>
            <span className="flex items-center gap-1 font-bold text-[#1F75FE]">
              <Upload className="h-3.5 w-3.5" />
              <span>{ui.labDropZoneAction}</span>
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              onChange={(e) => {
                handleSourceFileSelect(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>

          {pdfStatusNote && (
            <div
              data-testid="lab-pdf-status"
              className="rounded-[12px] border border-[#1F75FE]/25 bg-[#1F75FE]/10 px-3.5 py-2 text-[12.5px] font-semibold text-[#1F75FE] dark:text-[#7DB2FF]"
            >
              {pdfStatusNote}
            </div>
          )}

          {/* Smart PDF Page Range + Q&A Count Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/75 bg-white/55 px-3.5 py-2.5 dark:border-white/10 dark:bg-slate-900/50">
            {pdfPages.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold" data-testid="lab-pdf-page-range">
                <span className="text-[#555D6B] dark:text-slate-300">{ui.pageRangeLabel}</span>
                <label className="flex items-center gap-1">
                  <span className="text-[11.5px] text-[#555D6B] dark:text-slate-400">{ui.pageFrom}</span>
                  <input
                    type="number"
                    min={1}
                    max={pdfPages.length}
                    value={fromPage}
                    onChange={(e) => handlePageRangeUpdate(Number(e.target.value), toPage)}
                    data-testid="lab-from-page"
                    className="tabular-nums w-16 rounded-[10px] border border-white/80 bg-white/85 px-2 py-1 text-center text-[12.5px] font-bold text-[#1A1E24] outline-none focus:border-[#1F75FE] dark:border-white/15 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <span>—</span>
                <label className="flex items-center gap-1">
                  <span className="text-[11.5px] text-[#555D6B] dark:text-slate-400">{ui.pageTo}</span>
                  <input
                    type="number"
                    min={fromPage}
                    max={pdfPages.length}
                    value={toPage}
                    onChange={(e) => handlePageRangeUpdate(fromPage, Number(e.target.value))}
                    data-testid="lab-to-page"
                    className="tabular-nums w-16 rounded-[10px] border border-white/80 bg-white/85 px-2 py-1 text-center text-[12.5px] font-bold text-[#1A1E24] outline-none focus:border-[#1F75FE] dark:border-white/15 dark:bg-slate-800 dark:text-slate-100"
                  />
                </label>
                <span className="tabular-nums text-[11.5px] text-[#1F75FE]">({pdfPages.length})</span>
              </div>
            ) : (
              <span className="text-[12px] font-semibold text-[#555D6B] dark:text-slate-300">
                {ui.qaCountLabel}
              </span>
            )}

            <div className="flex items-center gap-1.5" role="group" aria-label={ui.qaCountLabel}>
              {([10, 20, 30] as const).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQaCount(cnt)}
                  data-testid={`lab-qa-count-${cnt}`}
                  className={`tabular-nums cursor-pointer rounded-full px-3 py-1 text-[12px] font-bold transition-colors ${
                    qaCount === cnt
                      ? 'primary-glass-cta text-white'
                      : 'glass-pill text-[#1A1E24] dark:text-slate-200'
                  }`}
                >
                  {cnt} {ui.pdfQuestionSuffix}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="labSourceTextarea" className="mb-1 block text-[12.5px] font-semibold text-[#555D6B] dark:text-slate-300">
              {ui.labPasteLabel}
            </label>
            <textarea
              id="labSourceTextarea"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={ui.labSubtitle}
              className="min-h-[110px] w-full rounded-[16px] border border-white/80 bg-white/70 p-3.5 text-[13.5px] leading-relaxed text-[#1A1E24] outline-none focus:border-[#1F75FE] dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isGenerating || isReadingPdf}
              onClick={handleGenerateAiQa}
              className="primary-glass-cta flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{isGenerating ? ui.generatingAiBtn : ui.generateAiBtn(qaCount)}</span>
            </button>

            <button
              type="button"
              disabled={isReadingPdf}
              onClick={handleGenerateLocalOffline}
              data-testid="lab-generate-offline-btn"
              className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-[#1A1E24] transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 disabled:opacity-60 dark:text-slate-100"
            >
              <span>{ui.generateOfflineBtn(qaCount)}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions & Manual AI Prompt + JSON Tools */}
      <section className="glass-surface rounded-[22px] p-5">
        <div className="flex flex-wrap gap-2.5">
          <label className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1A1E24] transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 dark:text-slate-100">
            <FileJson2 className="h-4 w-4 text-[#1FA982]" />
            <span>{ui.labJsonUploadBtn}</span>
            <input type="file" accept=".json,application/json,text/plain" onChange={handleDirectJsonUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleLoad30Sample}
            className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1A1E24] transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 dark:text-slate-100"
          >
            <FileJson2 className="h-4 w-4 text-[#1F75FE]" />
            <span>{ui.labSample30Btn}</span>
          </button>

          <button
            type="button"
            onClick={onTriggerStartupPreview}
            className="glass-pill flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1A1E24] transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 dark:text-slate-100"
          >
            <Bell className="h-4 w-4 text-[#F05A28]" />
            <span>{ui.labTestReminderBtn}</span>
          </button>

          <button
            type="button"
            aria-expanded={showManualPrompt}
            onClick={() => setShowManualPrompt((v) => !v)}
            data-testid="lab-manual-prompt-toggle"
            className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1F75FE]"
          >
            <span>{ui.labManualPromptBtn}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showManualPrompt ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showManualPrompt && (
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-900/10 pt-4 dark:border-white/10" data-testid="lab-prompt-json-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[13px] font-bold">{ui.promptModalTitle}</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-semibold text-[#1F75FE]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{ui.copyPromptBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplateJson}
                  data-testid="lab-download-template-json"
                  className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-semibold text-[#1FA982]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{ui.downloadSampleJsonBtn}</span>
                </button>
                {sourceText.trim().length >= 15 && (
                  <button
                    type="button"
                    onClick={handleDirectExportTextAsJson}
                    data-testid="lab-export-text-json"
                    className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-semibold text-[#F05A28]"
                  >
                    <FileJson2 className="h-3.5 w-3.5" />
                    <span>{isAr ? 'تصدير JSON من النص' : 'تېكىستتىن بىۋاسىتە JSON چۈشۈرۈش'}</span>
                  </button>
                )}
              </div>
            </div>

            <pre className="max-h-44 max-w-full overflow-x-auto overflow-y-auto rounded-[16px] border border-white/75 bg-white/60 p-3 text-[12px] leading-relaxed whitespace-pre-wrap break-words text-[#1A1E24] dark:border-white/10 dark:bg-slate-900/65 dark:text-slate-200">
              {promptText}
            </pre>

            <div className="flex flex-col gap-2 rounded-[16px] border border-white/75 bg-white/50 p-3 dark:border-white/10 dark:bg-slate-900/50">
              <label htmlFor="labManualJsonPaste" className="text-[12.5px] font-bold text-[#1A1E24] dark:text-slate-100">
                {ui.pasteAiJsonHeading}
              </label>
              <textarea
                id="labManualJsonPaste"
                dir="ltr"
                value={manualJsonPaste}
                onChange={(e) => setManualJsonPaste(e.target.value)}
                placeholder={ui.pasteAiJsonPlaceholder}
                className="min-h-[90px] w-full rounded-[12px] border border-white/80 bg-white/75 p-2.5 text-left font-mono text-[12px] outline-none focus:border-[#1F75FE] dark:border-white/15 dark:bg-slate-900/75"
              />
              <button
                type="button"
                onClick={handleSaveManualJson}
                className="primary-glass-cta self-start cursor-pointer rounded-full px-4 py-2 text-[12.5px] font-bold text-white"
              >
                {ui.savePastedAiJsonBtn}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Persistent Separate Books Inspector with JSON + PDF Export */}
      <section className="glass-surface rounded-[22px] p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-[#F05A28]" />
            <h3 className="text-[17px] font-bold text-[#1A1E24] dark:text-slate-100">
              {ui.labSavedBooksHeading(books.length)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#1FA982]">
            <ShieldCheck className="h-4 w-4" />
            <span>{reminderEnabled ? ui.labReminderOpenStatus : ui.labReminderClosedStatus}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {books.map((book) => {
            const isActive = book.id === activeBookId;
            return (
              <div
                key={book.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-[16px] border px-4 py-3 transition-all duration-150 ${
                  isActive
                    ? 'border-[#F05A28]/60 bg-[#F05A28]/10 dark:border-[#F78C2B]/50 dark:bg-[#F05A28]/15'
                    : 'border-white/75 bg-white/55 hover:border-[#1F75FE]/50 dark:border-white/10 dark:bg-slate-900/50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectBook(book.id)}
                  className="min-w-0 flex-1 cursor-pointer text-right"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-bold text-[#1A1E24] dark:text-slate-100">
                      {book.title}
                    </span>
                    {isActive && (
                      <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-[#F05A28]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{ui.labActiveBadge}</span>
                      </span>
                    )}
                  </div>
                  <div className="tabular-nums mt-0.5 text-[12px] text-[#555D6B] dark:text-slate-400">
                    {book.items.length} {ui.pdfQuestionSuffix} · {ui.masteredLabel}: {book.masteredIds.length} · #{book.currentIndex + 1}
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      downloadBookJson(book);
                      onNotify(
                        isAr ? `تم تنزيل JSON لـ «${book.title}»` : `«${book.title}» JSON چۈشۈرۈلدى`,
                        'success'
                      );
                    }}
                    aria-label={`${book.title} JSON`}
                    className="glass-pill cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold text-[#1A1E24] dark:text-slate-100"
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintBookPdf(book)}
                    aria-label={`${book.title} PDF`}
                    className="glass-pill flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold text-[#1F75FE]"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{ui.labExportPdfBtn}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
