import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  AppLanguage,
  BookRecord,
  PdfExportOptions,
  PdfPageText,
  filterBookItemsForPdf,
  normalizePdfExtractedText,
  serializeBookForExport
} from './karlukCore';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedPdfResult {
  text: string;
  pages: PdfPageText[];
  pageCount: number;
  metadataTitle?: string;
  isScanned: boolean;
}

interface PdfTextItem {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

export async function extractTextFromPdfBuffer(
  arrayBuffer: ArrayBuffer,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<ExtractedPdfResult> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages || 0;
  const pages: PdfPageText[] = [];
  let metadataTitle: string | undefined;

  try {
    try {
      const meta = await pdfDoc.getMetadata();
      const rawTitle = (meta?.info as Record<string, unknown> | undefined)?.Title;
      if (typeof rawTitle === 'string' && rawTitle.trim() && !/^(untitled|document|microsoft word)/i.test(rawTitle.trim())) {
        metadataTitle = normalizePdfExtractedText(rawTitle).slice(0, 120);
      }
    } catch {
      // optional metadata
    }

    for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
      if (onProgress) onProgress(pageNum, pageCount);
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let currentLine = '';
      let prevY: number | null = null;

      for (const rawItem of content.items as PdfTextItem[]) {
        if (typeof rawItem.str !== 'string') continue;
        const y = Array.isArray(rawItem.transform) ? rawItem.transform[5] : null;
        if (prevY !== null && y !== null && Math.abs(y - prevY) > 4 && currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        const fragment = rawItem.str;
        if (fragment) {
          currentLine = currentLine
            ? currentLine.endsWith(' ') || fragment.startsWith(' ')
              ? `${currentLine}${fragment}`
              : `${currentLine} ${fragment}`
            : fragment;
        }
        if (rawItem.hasEOL && currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        if (y !== null) prevY = y;
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      const pageText = normalizePdfExtractedText(lines.join('\n'));
      pages.push({ pageNumber: pageNum, text: pageText });
    }
  } finally {
    await loadingTask.destroy();
  }

  const fullText = pages
    .map((p) => p.text)
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    text: fullText,
    pages,
    pageCount,
    metadataTitle,
    isScanned: fullText.length < 20,
  };
}

export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (currentPage: number, totalPages: number) => void
): Promise<ExtractedPdfResult> {
  const buf = await file.arrayBuffer();
  return extractTextFromPdfBuffer(buf, onProgress);
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIdx = result.indexOf(',');
      resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('PDF ھۆججىتىنى ئوقۇشتا خاتالىق كۆرۈلدى.'));
    reader.readAsDataURL(file);
  });
}

export async function generateQaViaServer(params: {
  bookTitle?: string;
  text?: string;
  pdfBase64?: string;
  count?: number;
  language?: AppLanguage;
}): Promise<BookRecord> {
  const res = await fetch('/api/generate-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    bookTitle?: string;
    language?: AppLanguage;
    items?: Array<{ id?: number | string; category?: string; question: string; answer: string }>;
  };

  if (!res.ok) {
    throw new Error(data.error || `مۇلازىمېتىر خاتالىقى (${res.status})`);
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('سۇئال-جاۋاب تىزىملىكى قايتۇرۇلمىدى.');
  }

  const resolvedLang: AppLanguage = data.language === 'ar' || params.language === 'ar' ? 'ar' : 'ug';

  return {
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title:
      (params.bookTitle || '').trim() ||
      (data.bookTitle || '').trim() ||
      (resolvedLang === 'ar' ? 'كتاب جديد' : 'يېڭى كىتاب'),
    language: resolvedLang,
    createdAt: new Date().toISOString(),
    currentIndex: 0,
    masteredIds: [],
    items: data.items.map((item, idx) => ({
      id: item.id ?? idx + 1,
      category: item.category || (resolvedLang === 'ar' ? 'معرفة أساسية' : 'ئاساسىي بىلىم'),
      question: item.question,
      answer: item.answer,
    })),
  };
}

export function downloadJsonString(filename: string, jsonText: string): void {
  const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = filename.replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 48) || 'karluk_book';
  a.href = url;
  a.download = safeName.endsWith('.json') ? safeName : `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadBookJson(book: BookRecord): void {
  downloadJsonString(book.title, serializeBookForExport(book));
}

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadBookPrintHtml(
  book: BookRecord,
  options: PdfExportOptions,
  uiLanguage: AppLanguage = 'ug'
): void {
  const lang: AppLanguage = book.language || uiLanguage;
  const isAr = lang === 'ar';
  const items = filterBookItemsForPdf(book, options.mode);
  const isQuiz = options.mode === 'quiz';
  const modeLabel = isAr
    ? options.mode === 'quiz'
      ? 'ورقة اختبار'
      : options.mode === 'unmastered'
        ? 'غير المتقنة فقط'
        : 'نسخة الدراسة الكاملة'
    : options.mode === 'quiz'
      ? 'سىناق قەغىزى'
      : options.mode === 'unmastered'
        ? 'ئۆگىنىش كېرەك بولغانلار'
        : 'تولۇق ئۆگىنىش نۇسخىسى';

  const cardsHtml = items
    .map(
      (item, idx) => `
      <article class="card">
        <div class="card-head">
          <span>${isAr ? `السؤال ${idx + 1}` : `${idx + 1}-سۇئال`}</span>
          ${options.includeCategory ? `<span>${escapeHtml(item.category || (isAr ? 'معرفة أساسية' : 'ئاساسىي بىلىم'))}</span>` : ''}
        </div>
        <h2 class="q">${escapeHtml(item.question)}</h2>
        ${
          isQuiz
            ? '<div class="write-lines"><div></div><div></div></div>'
            : `<p class="a"><strong>${isAr ? 'الإجابة:' : 'جاۋاب:'}</strong> ${escapeHtml(item.answer)}</p>`
        }
      </article>`
    )
    .join('\n');

  const answerKeyHtml =
    isQuiz && options.includeAnswerKey
      ? `
      <section class="answer-key">
        <h2>${isAr ? `مفتاح الإجابات (${items.length} سؤالاً)` : `جاۋاب ئاچقۇچى (${items.length} سۇئال)`}</h2>
        ${items
          .map(
            (item, idx) => `
          <div class="key-row">
            <strong>${idx + 1}.</strong> ${escapeHtml(item.answer)}
          </div>`
          )
          .join('\n')}
      </section>`
      : '';

  const html = `<!doctype html>
<html lang="${lang}" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(book.title)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; letter-spacing: 0; }
    body { font-family: 'UKIJ Tuz', 'ALKATIP Basma', 'Amiri', Tahoma, sans-serif; color: #1A1E24; background: #fff; margin: 0; padding: 24px; direction: rtl; line-height: 1.75; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 18px; background: #F8FAFC; }
    .btn { background: #F05A28; color: #fff; border: none; border-radius: 999px; padding: 8px 18px; font-weight: 700; cursor: pointer; font-family: inherit; }
    header { border-bottom: 2px solid #F05A28; padding-bottom: 12px; margin-bottom: 18px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .meta { color: #555D6B; font-size: 13px; }
    .card { border: 1px solid #CBD5E1; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; break-inside: avoid; page-break-inside: avoid; }
    .card-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #F05A28; margin-bottom: 6px; }
    .q { margin: 0 0 6px; font-size: 15px; text-align: justify; text-indent: 1.75em; }
    .a { margin: 0; font-size: 13.5px; color: #334155; text-align: justify; text-indent: 1.75em; }
    .write-lines div { border-bottom: 1px dashed #94A3B8; height: 24px; margin-top: 4px; }
    .answer-key { page-break-before: always; break-before: page; border-top: 2px solid #1F75FE; padding-top: 16px; margin-top: 24px; }
    .key-row { margin-bottom: 8px; font-size: 13px; text-align: justify; }
    @media print { .toolbar { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>${isAr ? 'لحفظ الملف كـ PDF، اضغط على زر الطباعة واختر Save as PDF' : 'PDF قىلىپ ساقلاش ئۈچۈن بېسىش كۇنۇپكىسىنى بېسىپ «Save as PDF» نى تاللاڭ'}</span>
    <button class="btn" onclick="window.print()">${isAr ? 'حفظ PDF / طباعة' : 'PDF ساقلاش / بېسىش'}</button>
  </div>
  <header>
    <h1>${escapeHtml(book.title)}</h1>
    <div class="meta">${isAr ? 'مساعد قارلۇق للتعلّم' : 'قارلۇق ئۆگىنىش ياردەمچىسى'} · ${modeLabel} · ${isAr ? `إجمالي ${items.length} سؤالاً` : `جەمئىي ${items.length} سۇئال`}</div>
  </header>
  ${cardsHtml}
  ${answerKeyHtml}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = book.title.replace(/[^\w\u0600-\u06FF-]+/g, '_').slice(0, 40) || 'karluk_book';
  a.href = url;
  a.download = `${safeName}_PDF.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadExtensionZip(): Promise<void> {
  const res = await fetch('/karluk-learning-assistant.zip');
  if (!res.ok) {
    throw new Error('ZIP ھۆججىتىنى چۈشۈرۈشتە خاتالىق كۆرۈلدى.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'karluk-learning-assistant.zip';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
