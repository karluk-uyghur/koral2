import React, { useEffect, useState } from 'react';
import { BellRing, Download, X } from 'lucide-react';
import {
  AppLanguage,
  BRIGHTNESS_DEFAULT,
  BookRecord,
  KarlukSettings,
  PdfExportOptions,
  STORAGE_KEYS,
  clampBrightness,
  getDefaultStarterBook,
  normalizeLanguage,
  toggleMasteredItem
} from './lib/karlukCore';
import { getUiStrings } from './lib/i18n';
import { ExtensionSimulator } from './components/ExtensionSimulator';
import { TestLabPanel } from './components/TestLabPanel';
import { DocViewer } from './components/DocViewer';
import { SourceCodeViewer, SourceFileEntry } from './components/SourceCodeViewer';
import { PrintableBookSheet } from './components/PrintableBookSheet';
import { PdfExportModal } from './components/PdfExportModal';
import { downloadExtensionZip } from './lib/pdfAndAiClient';

import manifestRaw from '../extension/manifest.json?raw';
import popupHtmlRaw from '../extension/popup.html?raw';
import popupJsRaw from '../extension/popup.js?raw';
import backgroundJsRaw from '../extension/background.js?raw';
import prdRaw from '../docs/PRD.md?raw';
import specRaw from '../docs/SPEC.md?raw';
import styleGuideRaw from '../design/style.md?raw';

type MainTab = 'workbench' | 'prd' | 'spec' | 'code';

const SOURCE_FILES: SourceFileEntry[] = [
  { id: 'manifest', label: 'manifest.json', path: 'extension/manifest.json', content: manifestRaw },
  { id: 'popup_html', label: 'popup.html', path: 'extension/popup.html', content: popupHtmlRaw },
  { id: 'popup_js', label: 'popup.js', path: 'extension/popup.js', content: popupJsRaw },
  { id: 'background_js', label: 'background.js', path: 'extension/background.js', content: backgroundJsRaw },
  { id: 'style_md', label: 'design/style.md', path: 'design/style.md', content: styleGuideRaw }
];

function loadInitialBooks(): BookRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to default starter book
  }
  return [getDefaultStarterBook()];
}

function loadInitialActiveId(books: BookRecord[]): string | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_BOOK_ID);
    if (saved) {
      const cleaned = saved.replace(/^"|"$/g, '');
      if (books.some((b) => b.id === cleaned)) {
        return cleaned;
      }
    }
  } catch {
    // ignore
  }
  return books[0]?.id || null;
}

function loadInitialSettings(): KarlukSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        reminderEnabled: parsed.reminderEnabled !== undefined ? Boolean(parsed.reminderEnabled) : true,
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
        brightness: clampBrightness(parsed.brightness),
        language: normalizeLanguage(parsed.language)
      };
    }
  } catch {
    // ignore
  }
  return { reminderEnabled: true, theme: 'light', brightness: BRIGHTNESS_DEFAULT, language: 'ug' };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('workbench');
  const [books, setBooks] = useState<BookRecord[]>(() => loadInitialBooks());
  const [activeBookId, setActiveBookId] = useState<string | null>(() => loadInitialActiveId(loadInitialBooks()));
  const [settings, setSettings] = useState<KarlukSettings>(() => loadInitialSettings());
  const [isSimulatorExpanded, setIsSimulatorExpanded] = useState(false);
  const [printBook, setPrintBook] = useState<BookRecord | null>(() => loadInitialBooks()[0] || null);
  const [pdfPreviewBook, setPdfPreviewBook] = useState<BookRecord | null>(null);
  const [pdfExportOptions, setPdfExportOptions] = useState<PdfExportOptions>({
    mode: 'study',
    includeAnswerKey: true,
    includeCategory: true
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [startupPreview, setStartupPreview] = useState<{ title: string; question: string } | null>(null);

  const ui = getUiStrings(settings.language);
  const isAr = settings.language === 'ar';

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const level = clampBrightness(settings.brightness);
    document.documentElement.style.filter = level === BRIGHTNESS_DEFAULT ? '' : `brightness(${level}%)`;
  }, [settings.brightness]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    document.documentElement.dir = 'rtl';
  }, [settings.language]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
      window.localStorage.setItem(STORAGE_KEYS.ACTIVE_BOOK_ID, JSON.stringify(activeBookId));
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // storage quota ignored gracefully
    }
  }, [books, activeBookId, settings]);

  const notify = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  const handleAddBook = (newBook: BookRecord) => {
    setBooks((prev) => [newBook, ...prev]);
    setActiveBookId(newBook.id);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== bookId);
      if (activeBookId === bookId) {
        setActiveBookId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleUpdateBookIndex = (bookId: string, nextIndex: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, currentIndex: nextIndex } : b))
    );
  };

  const handleToggleMastered = (bookId: string, itemId: number | string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? toggleMasteredItem(b, itemId) : b))
    );
  };

  const handleToggleReminder = () => {
    setSettings((prev) => {
      const next = { ...prev, reminderEnabled: !prev.reminderEnabled };
      const nextUi = getUiStrings(next.language);
      notify(next.reminderEnabled ? nextUi.reminderOnToast : nextUi.reminderOffToast, 'success');
      return next;
    });
  };

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const handleChangeBrightness = (nextValue: number) => {
    setSettings((prev) => ({
      ...prev,
      brightness: clampBrightness(nextValue)
    }));
  };

  const handleChangeLanguage = (nextLang: AppLanguage) => {
    const normalized = normalizeLanguage(nextLang);
    setSettings((prev) => ({
      ...prev,
      language: normalized
    }));
    notify(
      normalized === 'ar'
        ? 'تم تغيير اللغة إلى العربية (العربية)'
        : 'تىل ئۇيغۇرچىغا ئۆزگەرتىلدى',
      'success'
    );
  };

  const handlePrintBookPdf = (book: BookRecord) => {
    setPrintBook(book);
    setPdfPreviewBook(book);
  };

  const handleTriggerStartupPreview = () => {
    if (!settings.reminderEnabled) {
      notify(
        isAr
          ? 'التنبيه متوقف حالياً. فعّله من مفتاح الإعدادات.'
          : 'ئەسكەرتىش ھازىر ئېتىۋېتىلگەن. قوزغىتىش ئۈچۈن تەڭشەكتىكى ۋىكليۇچاتېلنى ئېچىڭ.',
        'error'
      );
      return;
    }
    const activeBook = books.find((b) => b.id === activeBookId) || books[0];
    if (!activeBook || activeBook.items.length === 0) {
      notify(isAr ? 'لا توجد كتب لعرض التنبيه.' : 'ئەسكەرتىش چىقىرىش ئۈچۈن كىتاب يوق.', 'error');
      return;
    }
    const pending = activeBook.items.filter((i) => !activeBook.masteredIds.includes(i.id));
    const pool = pending.length > 0 ? pending : activeBook.items;
    const item = pool[Math.floor(Math.random() * pool.length)];
    setStartupPreview({
      title: isAr ? `تنبيه قارلۇق · ${activeBook.title}` : `قارلۇق ئەسكەرتىش · ${activeBook.title}`,
      question: item.question
    });
  };

  return (
    <>
      <div className="no-print liquid-canvas min-h-screen overflow-x-hidden text-[#1A1E24] dark:text-slate-100">
        {/* 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-[#0E131B]/85">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 sm:px-6 md:gap-8 md:py-3.5">
            {/* Zone 1: Brand Title */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('workbench');
              }}
              className="text-[16px] font-bold text-[#1A1E24] whitespace-nowrap shrink-0 md:text-[18px] dark:text-slate-100"
            >
              {ui.brandTitle}
            </a>

            {/* Zone 2: 4 Single-line Nav Tabs */}
            <nav className="order-3 flex w-full items-center justify-between gap-3 overflow-x-auto text-[13px] font-semibold md:order-2 md:w-auto md:justify-center md:gap-6 md:text-[14px]" aria-label={ui.brandTitle}>
              {(
                [
                  ['workbench', ui.navWorkbench],
                  ['prd', ui.navPrd],
                  ['spec', ui.navSpec],
                  ['code', ui.navCode]
                ] as Array<[MainTab, string]>
              ).map(([tabKey, label]) => {
                const isCurrent = activeTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`cursor-pointer border-b-2 pb-1 whitespace-nowrap shrink-0 transition-colors ${
                      isCurrent
                        ? 'border-[#F05A28] text-[#F05A28]'
                        : 'border-transparent text-[#555D6B] hover:text-[#1A1E24] dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary CTA */}
            <div className="order-2 shrink-0 md:order-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await downloadExtensionZip();
                    notify(ui.zipDownloadedNote, 'success');
                  } catch (err) {
                    notify(err instanceof Error ? err.message : 'ZIP download error', 'error');
                  }
                }}
                className="primary-glass-cta inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold text-white whitespace-nowrap shrink-0 transition-transform duration-150 hover:-translate-y-0.5 active:scale-97 md:px-5 md:py-2 md:text-[13.5px]"
              >
                <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>{ui.zipDownload}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
          {startupPreview && (
            <div
              role="alert"
              className="glass-surface mb-6 flex items-start justify-between gap-4 rounded-[22px] border-[#F05A28]/50 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="primary-glass-cta flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#F05A28]">
                    {isAr
                      ? `معاينة تنبيه فتح Chrome — ${startupPreview.title}`
                      : `Chrome ئېچىلغاندا چىقىدىغان ئۇقتۇرۇش ئۈلگىسى — ${startupPreview.title}`}
                  </div>
                  <p className="uyghur-paragraph mt-1 text-[14px] text-[#1A1E24] dark:text-slate-100">
                    {startupPreview.question}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStartupPreview(null)}
                aria-label={ui.closeLabel}
                className="glass-pill flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {activeTab === 'workbench' && (
            <div className={`grid items-start gap-8 ${isSimulatorExpanded ? 'grid-cols-1' : 'lg:grid-cols-[400px_1fr]'}`}>
              {/* Right (in RTL) Live Chrome Extension Frame */}
              <div className="flex min-w-0 flex-col items-center">
                <ExtensionSimulator
                  books={books}
                  activeBookId={activeBookId}
                  settings={settings}
                  isExpanded={isSimulatorExpanded}
                  onToggleExpand={() => setIsSimulatorExpanded((v) => !v)}
                  onSelectBook={setActiveBookId}
                  onAddBook={handleAddBook}
                  onDeleteBook={handleDeleteBook}
                  onUpdateBookIndex={handleUpdateBookIndex}
                  onToggleMastered={handleToggleMastered}
                  onToggleReminder={handleToggleReminder}
                  onToggleTheme={handleToggleTheme}
                  onChangeBrightness={handleChangeBrightness}
                  onChangeLanguage={handleChangeLanguage}
                  onTriggerStartupPreview={handleTriggerStartupPreview}
                  onPrintBookPdf={handlePrintBookPdf}
                  onNotify={notify}
                />
              </div>

              {/* Left Companion Test Lab */}
              <div className="min-w-0">
                <TestLabPanel
                  books={books}
                  activeBookId={activeBookId}
                  reminderEnabled={settings.reminderEnabled}
                  language={settings.language}
                  onChangeLanguage={handleChangeLanguage}
                  onSelectBook={setActiveBookId}
                  onAddBook={handleAddBook}
                  onPrintBookPdf={handlePrintBookPdf}
                  onTriggerStartupPreview={handleTriggerStartupPreview}
                  onNotify={notify}
                />
              </div>
            </div>
          )}

          {activeTab === 'prd' && (
            <DocViewer
              title={isAr ? 'وثيقة متطلبات المنتج (PRD)' : 'مەھسۇلات تەلەپلىرى ھۆججىتى (PRD)'}
              filename="PRD.md"
              content={prdRaw}
              onNotify={notify}
            />
          )}

          {activeTab === 'spec' && (
            <DocViewer
              title={isAr ? 'المواصفات التقنية والمعمارية (SPEC)' : 'تېخنىكىلىق لايىھە ۋە قۇرۇلما ئۆلچىمى (SPEC)'}
              filename="SPEC.md"
              content={specRaw}
              onNotify={notify}
            />
          )}

          {activeTab === 'code' && (
            <SourceCodeViewer files={SOURCE_FILES} onNotify={notify} />
          )}
        </main>

        {/* Global Toast */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-5 left-1/2 z-50 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border px-5 py-2.5 text-center text-[13px] font-bold shadow-xl backdrop-blur-md sm:rounded-full ${
              toast.type === 'error'
                ? 'border-[#E03E36]/40 bg-white/95 text-[#C52D26] dark:bg-slate-900/95 dark:text-red-400'
                : 'border-[#1FA982]/40 bg-white/95 text-[#137A5D] dark:bg-slate-900/95 dark:text-emerald-400'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>

      <PdfExportModal
        book={pdfPreviewBook}
        options={pdfExportOptions}
        language={settings.language}
        onChangeOptions={setPdfExportOptions}
        onClose={() => setPdfPreviewBook(null)}
        onNotify={notify}
      />

      <PrintableBookSheet book={printBook} options={pdfExportOptions} language={settings.language} />
    </>
  );
}
