import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BRIGHTNESS_DEFAULT,
  BRIGHTNESS_MAX,
  BRIGHTNESS_MIN,
  buildAiPrompt,
  buildSample30BookJson,
  clampBrightness,
  cleanJsonText,
  detectTextLanguage,
  filterBookItemsForPdf,
  generateLocalQaFromText,
  getDefaultStarterBook,
  joinPdfPagesInRange,
  normalizeLanguage,
  normalizePdfExtractedText,
  parseBookJson,
  serializeBookForExport,
  toggleMasteredItem
} from './karlukCore';

test('buildAiPrompt includes 30 Q&A requirement and book topic', () => {
  const prompt = buildAiPrompt('قۇتادغۇ بىلىك');
  assert.match(prompt, /30/);
  assert.match(prompt, /قۇتادغۇ بىلىك/);
  assert.match(prompt, /"items"/);
});

test('cleanJsonText strips markdown code fences cleanly', () => {
  const wrapped = '```json\n{"bookTitle":"سىناق","items":[{"question":"س1","answer":"ج1"}]}\n```';
  const cleaned = cleanJsonText(wrapped);
  assert.equal(cleaned.startsWith('{'), true);
  assert.equal(cleaned.endsWith('}'), true);
});

test('parseBookJson parses 30-item sample JSON and preserves separate book structure', () => {
  const sampleJson = buildSample30BookJson();
  const parsed = parseBookJson(sampleJson);
  assert.equal(parsed.items.length, 30);
  assert.equal(parsed.title, 'ئىلمىي تەپەككۇر ۋە مەدەنىيەت ئاساسلىرى (30 سۇئال)');
  assert.equal(parsed.currentIndex, 0);
  assert.deepEqual(parsed.masteredIds, []);
});

test('parseBookJson allows overriding book title and round-trips via serializeBookForExport', () => {
  const raw = JSON.stringify({
    bookTitle: 'ئەسلى نامى',
    items: [{ id: 1, category: 'باب', question: 'سۇئال 1', answer: 'جاۋاب 1' }]
  });
  const book = parseBookJson(raw, 'ئايرىم كىتاب نامى');
  assert.equal(book.title, 'ئايرىم كىتاب نامى');

  const exported = serializeBookForExport(book);
  const reimported = parseBookJson(exported);
  assert.equal(reimported.title, 'ئايرىم كىتاب نامى');
  assert.equal(reimported.items[0].question, 'سۇئال 1');
});

test('parseBookJson throws clear Uyghur errors on empty or invalid JSON', () => {
  assert.throws(() => parseBookJson(''), /بوش/);
  assert.throws(() => parseBookJson('{invalid json'), /توغرا ئەمەس/);
  assert.throws(() => parseBookJson('{"items":[]}'), /تېپىلمىدى/);
});

test('parseBookJson handles normal JSON files with BOM, backticks in answers, trailing commas, and diverse schemas', () => {
  // 1. UTF-8 BOM + code fences inside answer string
  const withBomAndBackticks = '\uFEFF' + JSON.stringify({
    title: 'كود كىتابى',
    cards: [
      { front: 'HTML نېمە؟', back: '```html\n<div>مىسال</div>\n```' }
    ]
  });
  const book1 = parseBookJson(withBomAndBackticks);
  assert.equal(book1.title, 'كود كىتابى');
  assert.equal(book1.items[0].question, 'HTML نېمە؟');
  assert.match(book1.items[0].answer, /<div>/);

  // 2. Trailing comma + Uyghur سوئال / جاۋاپ spelling
  const trailingAndUyghur = '{"name":"ئۇيغۇرچە كىتاب","questions":[{"سوئال":"1-سوئال؟","جاۋاپ":"1-جاۋاپ.",},],}';
  const book2 = parseBookJson(trailingAndUyghur);
  assert.equal(book2.title, 'ئۇيغۇرچە كىتاب');
  assert.equal(book2.items[0].question, '1-سوئال؟');
  assert.equal(book2.items[0].answer, '1-جاۋاپ.');

  // 3. Nested chapters
  const nestedChapters = JSON.stringify({
    bookTitle: 'بابلىق كىتاب',
    chapters: [
      { title: '1-باب', items: [{ q: 'س1', a: 'ج1' }] },
      { title: '2-باب', questions: [{ q: 'س2', a: 'ج2' }] }
    ]
  });
  const book3 = parseBookJson(nestedChapters);
  assert.equal(book3.items.length, 2);
  assert.equal(book3.items[0].category, '1-باب');
  assert.equal(book3.items[1].category, '2-باب');

  // 4. Flat Q->A object and tuple array
  const flatDict = JSON.stringify({ 'نېمە ئۈچۈن؟': 'شۇنىڭ ئۈچۈن.' });
  const book4 = parseBookJson(flatDict);
  assert.equal(book4.items[0].question, 'نېمە ئۈچۈن؟');

  const tupleArray = JSON.stringify([['سۇئال ئا', 'جاۋاب ب']]);
  const book5 = parseBookJson(tupleArray);
  assert.equal(book5.items[0].answer, 'جاۋاب ب');
});

test('toggleMasteredItem adds and removes item IDs immutably', () => {
  const book = parseBookJson(buildSample30BookJson());
  const updated = toggleMasteredItem(book, 1);
  assert.deepEqual(updated.masteredIds, [1]);
  assert.deepEqual(book.masteredIds, []);

  const reverted = toggleMasteredItem(updated, 1);
  assert.deepEqual(reverted.masteredIds, []);
});

test('generateLocalQaFromText converts explicit Q/A blocks and structured paragraphs into books', () => {
  const explicitText = [
    'سۇئال: قاراخانىيلار دەۋرىدە ئىلىم-پەن قانداق راۋاجلانغان؟',
    'جاۋاب: كاشغەر ۋە بالاساغۇن قاتارلىق شەھەرلەردە مەدرىسەلەر قۇرۇلۇپ، نۇرغۇن ئىلمىي ئەسەرلەر يېزىلغان.',
    'سۇئال: يۈسۈپ خاس ھاجىپ قايسى ئەسەرنى يازغان؟',
    'جاۋاب: 1069-يىلى «قۇتادغۇ بىلىك» ئەسىرىنى تاماملىغان.'
  ].join('\n');

  const bookA = generateLocalQaFromText(explicitText, 'تارىخ خاتىرىسى');
  assert.equal(bookA.title, 'تارىخ خاتىرىسى');
  assert.equal(bookA.items.length, 2);
  assert.match(bookA.items[0].question, /قاراخانىيلار/);

  const proseText = [
    'ئىلىم ئېلىش ئەدەبى',
    'ئىلىم ئېلىش ئۈچۈن ئالدى بىلەن سەۋرچانلىق ۋە ئىخلاس كېرەك بولىدۇ. ئوقۇغۇچى ھەر بىر بابنى تەكرار ئوقۇپ چۈشىنىشى لازىم.',
    '',
    'تىل بايلىقى',
    'ئانا تىلنى ساپ ۋە توغرا قوللىنىش ئىلمىي تەپەككۇرنىڭ ئاساسىدۇر. كلاسسىك ئەسەرلەرنى ئوقۇش تىل سەۋىيەسىنى ئۆستۈرىدۇ.',
    '',
    'ئەمەلىي قوللىنىش',
    'ئۆگەنگەن بىلىمنى كۈندىلىك تۇرمۇشتا ئىشلىتىش ۋە باشقىلارغا يەتكۈزۈش بىلىمنى مۇستەھكەملەيدۇ.'
  ].join('\n');

  const bookB = generateLocalQaFromText(proseText, 'ئۆگىنىش قوللانمىسى');
  assert.equal(bookB.items.length, 3);
  assert.equal(bookB.items[0].category, 'ئىلىم ئېلىش ئەدەبى');

  assert.throws(() => generateLocalQaFromText('قىسقا'), /يېتەرلىك/);
});

test('extension manifest.json enforces MV3, strict CSP, and least privilege', () => {
  const manifestRaw = fs.readFileSync(path.resolve('extension/manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);

  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage', 'notifications']);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifestRaw.includes('<all_urls>'), false);
  assert.match(manifest.content_security_policy.extension_pages, /script-src 'self'/);
});

test('extension, docs, server, and core files contain zero prohibited terms or external tracking URLs', () => {
  const prohibited = [
    '\u062c\u06c7\u06ad\u06af\u0648',
    '\u0634\u0649\u0646\u062c\u0627\u06ad',
    '\u0634\u0649\u0646\u0644\u0627\u06ad',
    '\u062e\u06d5\u0646\u0632\u06c7'
  ];
  const filesToAudit = [
    'extension/manifest.json',
    'extension/popup.html',
    'extension/popup.js',
    'extension/background.js',
    'docs/PRD.md',
    'docs/SPEC.md',
    'design/style.md',
    'src/lib/karlukCore.ts',
    'server.ts'
  ];

  for (const relPath of filesToAudit) {
    const content = fs.readFileSync(path.resolve(relPath), 'utf8');
    for (const banned of prohibited) {
      assert.equal(
        content.includes(banned),
        false,
        `Prohibited term found in ${relPath}: ${banned}`
      );
    }
    assert.equal(/baidu|tencent|alibaba|google-analytics|googletagmanager/i.test(content), false);
  }
});

test('clampBrightness enforces valid 50..130 range and handles invalid inputs', () => {
  assert.equal(clampBrightness(undefined), BRIGHTNESS_DEFAULT);
  assert.equal(clampBrightness('not-a-number'), BRIGHTNESS_DEFAULT);
  assert.equal(clampBrightness(10), BRIGHTNESS_MIN);
  assert.equal(clampBrightness(250), BRIGHTNESS_MAX);
  assert.equal(clampBrightness(85.4), 85);
});

test('generateLocalQaFromText handles dense single-line-wrapped PDF text reliably', () => {
  const wrappedPdfText = [
    'شەرقىي تۈركىستان مەدەنىيىتى ئەسىرلەر بويى',
    'بىلىم ۋە سەنئەت جەھەتتىن يۈكسەك',
    'تەرەققىياتقا ئېرىشكەن بولۇپ كاشغەر',
    'ۋە تۇرپان قاتارلىق شەھەرلەر ئىلىم',
    'مەركەزلىرى سۈپىتىدە تونۇلغان ئىدى'
  ].join('\n');

  const book = generateLocalQaFromText(wrappedPdfText, 'PDF سىناق');
  assert.equal(book.title, 'PDF سىناق');
  assert.ok(book.items.length >= 1);
  assert.match(book.items[0].answer, /شەرقىي تۈركىستان/);
});

test('normalizePdfExtractedText converts Arabic Presentation Forms to canonical Uyghur Unicode and strips page noise', () => {
  const messyPdf = '\uFE8F\uFEF0\uFEE0\uFEF0\uFEE2 \uFEFB \n- 12 -\nPage 3 of 10\n5-بەت\n14';
  const cleaned = normalizePdfExtractedText(messyPdf);
  assert.equal(cleaned.includes('\uFE8F'), false);
  assert.equal(cleaned.includes('- 12 -'), false);
  assert.equal(cleaned.includes('Page 3 of 10'), false);
  assert.equal(cleaned.includes('5-بەت'), false);
  assert.match(cleaned, /بىلىم لا/);
});

test('joinPdfPagesInRange slices requested page range cleanly and handles reversed bounds', () => {
  const pages = [
    { pageNumber: 1, text: '1-بەت مەزمۇنى' },
    { pageNumber: 2, text: '2-بەت مەزمۇنى' },
    { pageNumber: 3, text: '3-بەت مەزمۇنى' },
    { pageNumber: 4, text: '4-بەت مەزمۇنى' }
  ];
  assert.equal(joinPdfPagesInRange(pages, 2, 3), '2-بەت مەزمۇنى\n\n3-بەت مەزمۇنى');
  assert.equal(joinPdfPagesInRange(pages, 4, 2), '2-بەت مەزمۇنى\n\n3-بەت مەزمۇنى\n\n4-بەت مەزمۇنى');
  assert.equal(joinPdfPagesInRange([], 1, 2), '');
});

test('filterBookItemsForPdf filters unmastered items and falls back gracefully when all mastered', () => {
  const book = parseBookJson(
    JSON.stringify({
      bookTitle: 'سىناق',
      items: [
        { id: 1, question: 'س1', answer: 'ج1' },
        { id: 2, question: 'س2', answer: 'ج2' }
      ]
    })
  );
  const partial = { ...book, masteredIds: [1] };
  assert.deepEqual(
    filterBookItemsForPdf(partial, 'unmastered').map((i) => i.id),
    [2]
  );
  assert.equal(filterBookItemsForPdf(partial, 'study').length, 2);

  const allDone = { ...book, masteredIds: [1, 2] };
  assert.equal(filterBookItemsForPdf(allDone, 'unmastered').length, 2);
});

test('generateLocalQaFromText tailors question stems to definitions and historical years', () => {
  const academicText = [
    'مەدەنىيەت دېگەنلىك بىر خەلقنىڭ ئەسىرلەر بويى توپلىغان مەنىۋى ۋە ماددىي بايلىقىدۇر.',
    '',
    '1069-يىلى يۈسۈپ خاس ھاجىپ كاشغەردە قۇتادغۇ بىلىك ئەسىرىنى تاماملاپ تەقدىم قىلغان.',
    '',
    'بىلىم ئېلىشنىڭ مەقسىتى ئەقىلنى نۇرلاندۇرۇش ۋە جەمئىيەتكە پايدا يەتكۈزۈش ئۈچۈن تىرىشىشتۇر.'
  ].join('\n');

  const book = generateLocalQaFromText(academicText, 'ئىلمىي نەزەرىيە', 10);
  assert.equal(book.items.length, 3);
  assert.match(book.items[0].question, /ئېنىقلىمىسى/);
  assert.match(book.items[1].question, /تارىخىي پاكىت/);
  assert.match(book.items[2].question, /سەۋەب ياكى مەقسەت/);
});

test('normalizeLanguage and detectTextLanguage distinguish Uyghur and Arabic scripts accurately', () => {
  assert.equal(normalizeLanguage('ar'), 'ar');
  assert.equal(normalizeLanguage('ug'), 'ug');
  assert.equal(normalizeLanguage('unknown'), 'ug');

  assert.equal(
    detectTextLanguage('أصول البحث العلمي والثقافة الإسلامية وقواعد التفكير المنطقي', 'ug'),
    'ar'
  );
  assert.equal(
    detectTextLanguage('ئۇيغۇر كىلاسسىك مەدەنىيىتى ۋە ئەدەبىيات تارىخىنىڭ ئاساسى', 'ar'),
    'ug'
  );
});

test('buildAiPrompt and buildSample30BookJson generate strict Arabic JSON schemas and 30-item templates', () => {
  const arPrompt = buildAiPrompt('منهج البحث العلمي', {
    language: 'ar',
    count: 20,
    sourceText: 'يتناول هذا الدرس قواعد التوثيق التاريخي وتحليل المصادر.'
  });
  assert.match(arPrompt, /20 سؤالاً/);
  assert.match(arPrompt, /"language": "ar"/);
  assert.match(arPrompt, /منهج البحث العلمي/);
  assert.match(arPrompt, /قواعد التوثيق التاريخي/);

  const sampleArJson = buildSample30BookJson('ar');
  const parsedAr = parseBookJson(sampleArJson);
  assert.equal(parsedAr.language, 'ar');
  assert.equal(parsedAr.items.length, 30);

  const starterAr = getDefaultStarterBook('ar');
  assert.equal(starterAr.language, 'ar');
  assert.equal(starterAr.items.length, 3);
});

test('parseBookJson supports Arabic JSON field names cleanly', () => {
  const arabicSchemaJson = JSON.stringify({
    الكتاب: 'مبادئ المنطق والنقد',
    اللغة: 'ar',
    الأسئلة: [
      {
        id: 1,
        الفصل: 'التمهيد',
        السؤال: 'ما أهمية التفكير المنهجي في البحث؟',
        الإجابة: 'يساعد على التمييز الدقيق بين الأدلة الصحيحة والافتراضات غير المثبتة.'
      }
    ]
  });

  const book = parseBookJson(arabicSchemaJson);
  assert.equal(book.title, 'مبادئ المنطق والنقد');
  assert.equal(book.language, 'ar');
  assert.equal(book.items.length, 1);
  assert.equal(book.items[0].category, 'التمهيد');
  assert.match(book.items[0].question, /التفكير المنهجي/);
});

test('normalizePdfExtractedText strips Arabic page numbers and preserves Arabic content', () => {
  const noisyArabicPdf = 'مقدمة في أصول المعرفة\nصفحة 5\nص ١٢\n١٢ من ٥٠\nتبدأ المعرفة بطرح السؤال الصحيح.';
  const cleaned = normalizePdfExtractedText(noisyArabicPdf);
  assert.equal(cleaned.includes('صفحة 5'), false);
  assert.equal(cleaned.includes('ص ١٢'), false);
  assert.equal(cleaned.includes('١٢ من ٥٠'), false);
  assert.match(cleaned, /مقدمة في أصول المعرفة/);
  assert.match(cleaned, /تبدأ المعرفة/);
});

test('generateLocalQaFromText processes Arabic explicit Q/A blocks and Arabic prose paragraphs', () => {
  const arabicExplicit = [
    'سؤال: ما الركيزة الأولى في دراسة التاريخ؟',
    'جواب: الاعتماد على المصادر الأولية الموثوقة ومقارنة الروايات.',
    'سؤال: كيف نربط بين الأسباب والنتائج؟',
    'جواب: بتتبع السياق الزمني والاجتماعي للحدث بدقة وموضوعية.'
  ].join('\n');

  const bookExplicit = generateLocalQaFromText(arabicExplicit, 'مذكرة التاريخ', 30, 'ar');
  assert.equal(bookExplicit.language, 'ar');
  assert.equal(bookExplicit.items.length, 2);
  assert.match(bookExplicit.items[0].question, /الركيزة الأولى/);

  const arabicProse = [
    'تعريف المنهج العلمي يُعرّف بأنه أسلوب منظم لاكتشاف الحقائق والوصول إلى نتائج دقيقة.',
    '',
    'الهدف من التلخيص هو تثبيت المفاهيم الأساسية لأن المراجعة الدورية تعزز الاستيعاب العميق.'
  ].join('\n');

  const bookProse = generateLocalQaFromText(arabicProse, 'أصول الدراسة', 10, 'ar');
  assert.equal(bookProse.language, 'ar');
  assert.equal(bookProse.items.length, 2);
  assert.match(bookProse.items[0].question, /ما تعريف وماهية/);
  assert.match(bookProse.items[1].question, /ما السبب الرئيسي/);
});


