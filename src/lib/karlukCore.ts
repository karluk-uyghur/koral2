export type AppLanguage = 'ug' | 'ar';

export interface QAItem {
  id: number | string;
  category: string;
  question: string;
  answer: string;
}

export interface BookRecord {
  id: string;
  title: string;
  language?: AppLanguage;
  createdAt: string;
  currentIndex: number;
  masteredIds: Array<number | string>;
  items: QAItem[];
}

export const BRIGHTNESS_MIN = 50;
export const BRIGHTNESS_MAX = 130;
export const BRIGHTNESS_DEFAULT = 100;

export function clampBrightness(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return BRIGHTNESS_DEFAULT;
  return Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_MAX, Math.round(num)));
}

export function normalizeLanguage(value: unknown): AppLanguage {
  return value === 'ar' ? 'ar' : 'ug';
}

export interface KarlukSettings {
  reminderEnabled: boolean;
  theme: 'light' | 'dark';
  brightness: number;
  language: AppLanguage;
}

export const STORAGE_KEYS = {
  BOOKS: 'karluk_books',
  ACTIVE_BOOK_ID: 'karluk_active_book_id',
  SETTINGS: 'karluk_settings'
} as const;

export function detectTextLanguage(text: string, fallback: AppLanguage = 'ug'): AppLanguage {
  const sample = String(text || '');
  if (!sample.trim()) return fallback;
  const uyghurSpecific = (sample.match(/[ەۆۈېۇچژگڭپ]/g) || []).length;
  const arabicSpecific = (sample.match(/[ةضصثذظطح]/g) || []).length;
  if (uyghurSpecific === 0 && arabicSpecific >= 3) {
    return 'ar';
  }
  if (uyghurSpecific >= 3 && arabicSpecific === 0) {
    return 'ug';
  }
  return fallback;
}

export function getDefaultStarterBook(language: AppLanguage = 'ug'): BookRecord {
  if (language === 'ar') {
    return {
      id: 'book_starter_arabic_knowledge',
      title: 'أصول البحث العلمي والثقافة الإسلامية (نموذج)',
      language: 'ar',
      createdAt: '2026-11-20T00:00:00.000Z',
      currentIndex: 0,
      masteredIds: [],
      items: [
        {
          id: 1,
          category: 'تاريخ العلم',
          question: 'ما هي أهمية التدوين المنهجي وطريقة السؤال والجواب في التراث العلمي الكلاسيكي؟',
          answer: 'يساعد أسلوب السؤال والجواب على ترسيخ المفاهيم الأساسية، ونقل القارئ من القراءة السلبية إلى الفهم العميق والاستيعاب طويل الأمد.'
        },
        {
          id: 2,
          category: 'منهجية التعلم',
          question: 'كيف يسهم التكرار المتباعد وتحديد الإتقان في حفظ المعارف المعقدة؟',
          answer: 'يتيح التكرار المنظم مع تمييز النقاط غير المتقنة تركيز الجهد على المسائل الصعبة، مما يضاعف كفاءة الحفظ والفهم.'
        },
        {
          id: 3,
          category: 'التفكير النقدي',
          question: 'ما الركائز الثلاث لفهم أي كتاب علمي أو تاريخي بدقة وموضوعية؟',
          answer: 'الركائز هي: التحقق من المصطلحات الأصيلة في سياقها التاريخي، وربط الأسباب بالنتائج، وتلخيص الأفكار الرئيسية بأسلوب واضح.'
        }
      ]
    };
  }

  return {
    id: 'book_starter_east_turkestan_history',
    title: 'شەرقىي تۈركىستان مەدەنىيىتى ۋە بىلىم تارىخى (ئۈلگە)',
    language: 'ug',
    createdAt: '2026-11-20T00:00:00.000Z',
    currentIndex: 0,
    masteredIds: [],
    items: [
      {
        id: 1,
        category: 'مەدەنىيەت تارىخى',
        question: 'قاراخانىيلار دەۋرىدە شەرقىي تۈركىستاندا بارلىققا كەلگەن ئىككى بۈيۈك ئەسەر قايسىلار ۋە ئۇلارنىڭ ئەھمىيىتى نېمە؟',
        answer: 'يۈسۈپ خاس ھاجىپنىڭ «قۇتادغۇ بىلىك» ئەسىرى ۋە مەھمۇد قەشقىرىنىڭ «تۈركىي تىللار دىۋانى» ئەسىرىدۇر. بۇ ئەسەرلەر ئىسلامىي ئەخلاق، دۆلەت ئىدارە قىلىش پەلسەپىسى ۋە تۈركىي تىل-مەدەنىيەتنىڭ ئالتۇن خەزىنىسى ھېسابلىنىدۇ.'
      },
      {
        id: 2,
        category: 'ئىلىم-پەن ئەخلاقى',
        question: '«قۇتادغۇ بىلىك» ئەسىرىدە بىلىم ۋە ئەقىلنىڭ رولى قانداق تەسۋىرلەنگەن؟',
        answer: 'بىلىم ئىنساننى قەدىرلىك قىلىدىغان نۇر، ئەقىل بولسا قاراڭغۇدا يول باشلايدىغان مەشئەل سۈپىتىدە تەسۋىرلەنگەن؛ ھەرقانداق ئادالەت ۋە گۈللىنىش بىلىم ئۈستىگە قۇرۇلىدۇ.'
      },
      {
        id: 3,
        category: 'تىل ۋە يېزىق',
        question: 'ئۇيغۇر كىلاسسىك مەتبەئە ئەنئەنىسىدە ئىلىم ئەسەرلىرىنى قوغداشنىڭ ئەڭ مۇھىم ئۇسۇلى نېمە ئىدى؟',
        answer: 'كۆچۈرۈش، شەرھلەش، مەدرىسە دەرسلىكلىرىدە سىستېمىلىق سۇئال-جاۋاب شەكلىدە مۇزاكىرە قىلىش ۋە ئەۋلادلارغا ئامانەت سۈپىتىدە يەتكۈزۈش ئىدى.'
      }
    ]
  };
}

export function buildSample30BookJson(language: AppLanguage = 'ug'): string {
  if (language === 'ar') {
    const arTopics = [
      ['منهجية العلم', 'ما الهدف الأساسي من طلب العلم وتحصيله وفق الرؤية التربوية الأصيلة؟', 'معرفة الحق والتمييز بين الصواب والخطأ، والعمل النافع لبناء الفرد والمجتمع على أسس راسخة من الأخلاق والعقل.'],
      ['أسلوب الاستيعاب', 'ما فائدة تلخيص الكتب الدراسية في هيئة أسئلة وأجوبة مركزة؟', 'ينقل المتعلم من التلقي السلبي إلى التفكير النشط، ويعزز استرجاع المفاهيم المحورية وترسيخها في الذاكرة طويلة المدى.'],
      ['الوعي التاريخي', 'لماذا يُعد استخدام المصطلحات التاريخية الدقيقة ركيزة في دراسة الحضارات؟', 'لأن دقة المصطلح تحفظ الهوية والحقيقة التاريخية وتمنح الباحث رؤية علمية موضوعية بعيدة عن التحريف.']
    ];

    const items: QAItem[] = Array.from({ length: 30 }, (_, idx) => {
      const base = arTopics[idx % arTopics.length];
      return {
        id: idx + 1,
        category: `${base[0]} · القسم ${Math.floor(idx / 3) + 1}`,
        question: `النقطة ${idx + 1}: ${base[1]}`,
        answer: `${base[2]} (شرح إضافي ${idx + 1}: المراجعة الدورية المنظمة تحول المعرفة النظرية إلى مهارة راسخة.)`
      };
    });

    return JSON.stringify(
      {
        bookTitle: 'أصول التفكير العلمي والحضارة (30 سؤالاً)',
        language: 'ar',
        items
      },
      null,
      2
    );
  }

  const topics = [
    ['ئەقىدە ۋە ئىلىم', 'ئەھلى سۈننەت ۋەلجامائەت ئېتىقادىدا ئىلىم ئۆگىنىشنىڭ مەقسىتى نېمە؟', 'ئاللاھنى تونۇش، ھەق بىلەن باتىلنى پەرقلەندۈرۈش، ئىبادەتنى توغرا ئادا قىلىش ۋە ئىنسانىيەتكە پايدىلىق ئەمەل قىلىشتۇر.'],
    ['ئىلمىي مېتود', 'بىر كىتابنى ئوقۇغاندا سۇئال-جاۋاب ئۇسۇلىدا يەكۈنلەشنىڭ پايدىسى نېمە؟', 'ئوقۇغۇچىنى پاسسىپ ئوقۇشتىن ئاكتىپ تەپەككۇرغا يۆتكەيدۇ، ئاساسىي ئۇقۇملارنى ئۇزاق مۇددەتلىك ئەستە ساقلاش ئىقتىدارىنى ئاشۇرىدۇ.'],
    ['تارىخ ئېڭى', 'شەرقىي تۈركىستاننىڭ مەدەنىيەت تارىخىنى توغرا ئاتالغۇلار بىلەن ئۆگىنىش نېمە ئۈچۈن مۇھىم؟', 'مىللىي سالاھىيەت، تارىخىي ھەقىقەت ۋە كىشىلىك ئىززەتنى ساقلاپ قېلىش، مۇستەملىكە تەسىرىدىن خالىي ئىلمىي كۆز قاراش يېتىلدۈرۈش ئۈچۈندۇر.']
  ];

  const items: QAItem[] = Array.from({ length: 30 }, (_, idx) => {
    const base = topics[idx % topics.length];
    return {
      id: idx + 1,
      category: `${base[0]} · ${Math.floor(idx / 3) + 1}-بۆلۈم`,
      question: `${idx + 1}-نۇقتا: ${base[1]}`,
      answer: `${base[2]} (${idx + 1}-تەپسىلىي شەرھ: سىستېمىلىق تەكرارلاش ئارقىلىق بۇ ئاساسىي پىرىنسىپ كۈندىلىك ئەمەلىيەتكە ئايلىنىدۇ.)`
    };
  });

  return JSON.stringify(
    {
      bookTitle: 'ئىلمىي تەپەككۇر ۋە مەدەنىيەت ئاساسلىرى (30 سۇئال)',
      language: 'ug',
      items
    },
    null,
    2
  );
}

export interface BuildAiPromptOptions {
  language?: AppLanguage;
  count?: number;
  sourceText?: string;
}

export function buildAiPrompt(bookTopic?: string, options?: BuildAiPromptOptions): string {
  const lang = normalizeLanguage(options?.language);
  const count = Math.max(5, Math.min(30, Number(options?.count) || 30));
  const rawSource = (options?.sourceText || '').trim();

  if (lang === 'ar') {
    const topicName = (bookTopic || '').trim() || 'محتوى الكتاب أو الدرس المرفق';
    const lines = [
      'أنت خبير أكاديمي متخصص في تحليل الكتب وتلخيص المناهج العلمية.',
      `قم بتحليل محتوى «${topicName}» بعمق، واستخرج منه أهم ${count} سؤالاً وجواباً علمياً مفصلاً باللغة العربية الفصحى.`,
      '',
      'الشروط الصارمة للمخرجات (JSON فقط):',
      `1. يجب أن تغطي الأسئلة جميع الأفكار المحورية في النص وأن تكون الإجابات واضحة وعميقة ومنطقية.`,
      '2. يجب أن يكون ردك عبارة عن كائن JSON صالح 100% فقط (دون أي مقدمات أو شروحات خارجه، وبصيغة UTF-8 نظيفة صالحة للحفظ المباشر كملف .json).',
      '3. التزم بالهيكل التالي بدقة:',
      '',
      '{',
      `  "bookTitle": "${topicName.replace(/"/g, '\\"')}",`,
      '  "language": "ar",',
      '  "items": [',
      '    {',
      '      "id": 1,',
      '      "category": "عنوان الفصل أو الموضوع",',
      '      "question": "نص السؤال العلمي الأول",',
      '      "answer": "الإجابة المفصلة والواضحة للسؤال الأول"',
      '    }',
      '  ]',
      '}',
      '',
      `تنبيه مهم: يجب أن تحتوي مصفوفة "items" على ${count} عنصراً متسلسلاً من 1 إلى ${count}.`
    ];

    if (rawSource) {
      lines.push('', 'المحتوى / النص المراد تحليله:', '---', rawSource.slice(0, 12000), '---');
    }
    return lines.join('\n');
  }

  const topicName = (bookTopic || '').trim() || 'بېرىلگەن كىتاب ياكى دەرسلىك مەزمۇنى';
  const lines = [
    'سەن پەن، مائارىپ ۋە بىلىم يەكۈنلەش ساھەسىدىكى ئالىي مۇتەخەسسىس.',
    `تۆۋەندە مەن بەرگەن «${topicName}» مەزمۇنىنى چوڭقۇر تەھلىل قىلىپ، شۇ مەزمۇندىكى ئەڭ مۇھىم، ئەڭ تۈپكى ۋە ئۆگىنىشكە تېگىشلىك دەل ${count} دانە تەپسىلىي سۇئال-جاۋابنى ئۇيغۇر تىلىدا تەييارلاپ بەر.`,
    '',
    'قاتتىق JSON تەلەپلىرى:',
    '1. سۇئاللار مەزمۇننىڭ بارلىق ئاساسىي نۇقتىلىرىنى قاپلىشى، يۈزەكى بولماي ئىلمىي ۋە تەپسىلىي بولۇشى كېرەك.',
    '2. جاۋابلار ئېنىق، لوگىكىلىق ۋە چۈشىنىشلىك ئۇيغۇرچە جۈملىلەر بىلەن يېزىلسۇن.',
    '3. جاۋابنى پەقەت بىۋاسىتە .json ھۆججەت قىلىپ ساقلىغىلى بولىدىغان، 100% ئىناۋەتلىك ساپ JSON فورماتىدا قايتۇر (سىرتىدا ھېچقانداق ئارتۇق سۆز ياكى چۈشەندۈرۈش يازما):',
    '',
    '{',
    `  "bookTitle": "${topicName.replace(/"/g, '\\"')}",`,
    '  "language": "ug",',
    '  "items": [',
    '    {',
    '      "id": 1,',
    '      "category": "تېما ياكى باب نامى",',
    '      "question": "1-مۇھىم سۇئال تېكىستى",',
    '      "answer": "1-سۇئالنىڭ تەپسىلىي ۋە ئىلمىي جاۋابى"',
    '    }',
    '  ]',
    '}',
    '',
    `دىققەت: "items" تىزىملىكىدە چوقۇم 1 دىن ${count} غىچە تولۇق ${count} دانە سۇئال-جاۋاب بولسۇن.`
  ];

  if (rawSource) {
    lines.push('', 'تەھلىل قىلىنىدىغان مەنبە تېكىست:', '---', rawSource.slice(0, 12000), '---');
  }

  return lines.join('\n');
}

function stripBom(text: string): string {
  return String(text || '').replace(/^\uFEFF/, '').trim();
}

function stripTrailingCommas(text: string): string {
  return text.replace(/,\s*([}\]])/g, '$1');
}

function tryParseJson(candidate: string): unknown | null {
  if (!candidate) return null;
  try {
    return JSON.parse(candidate);
  } catch {
    try {
      return JSON.parse(stripTrailingCommas(candidate));
    } catch {
      return null;
    }
  }
}

export function cleanJsonText(rawText: string): string {
  const trimmed = stripBom(rawText);
  if (!trimmed) return '';

  if (tryParseJson(trimmed) !== null) {
    return trimmed;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    const insideFence = fenceMatch[1].trim();
    if (tryParseJson(insideFence) !== null) {
      return insideFence;
    }
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');

  if (firstBrace !== -1 && lastBrace > firstBrace && (firstBracket === -1 || firstBrace < firstBracket)) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }
  return trimmed;
}

function pickStringField(obj: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
  }
  return '';
}

function findNestedArray(node: unknown, depth = 0): unknown[] {
  if (depth > 4 || !node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node;

  const obj = node as Record<string, unknown>;
  const priorityKeys = [
    'items',
    'questions',
    'qa',
    'qas',
    'cards',
    'flashcards',
    'data',
    'list',
    'entries',
    'records',
    'results',
    'content',
    'chapters',
    'سۇئاللار',
    'سوئاللار',
    'الأسئلة',
    'أسئلة',
    'الاسئلة',
    'اسئلة'
  ];

  for (const key of priorityKeys) {
    if (Array.isArray(obj[key]) && (obj[key] as unknown[]).length > 0) {
      return obj[key] as unknown[];
    }
  }

  let bestArray: unknown[] = [];
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > bestArray.length) {
      bestArray = val;
    } else if (val && typeof val === 'object') {
      const nested = findNestedArray(val, depth + 1);
      if (nested.length > bestArray.length) {
        bestArray = nested;
      }
    }
  }
  return bestArray;
}

export function parseBookJson(rawText: string, overrideTitle?: string): BookRecord {
  const cleaned = cleanJsonText(rawText);
  if (!cleaned) {
    throw new Error('JSON مەزمۇنى بوش بولۇپ قالدى.');
  }

  const parsed = tryParseJson(cleaned);
  if (parsed === null) {
    throw new Error('JSON فورماتى توغرا ئەمەس. تىرناق ياكى پەشلەرنى تەكشۈرۈڭ.');
  }

  let detectedTitle = '';
  let detectedLang: AppLanguage | undefined;
  let rawItems: unknown[] = [];

  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    detectedTitle = pickStringField(obj, [
      'bookTitle',
      'title',
      'name',
      'book',
      'bookName',
      'subject',
      'topic',
      'كىتاب',
      'مەنبە',
      'العنوان',
      'الكتاب',
      'اسم_الكتاب',
      'الموضوع'
    ]);
    const rawLang = pickStringField(obj, ['language', 'lang', 'اللغة']);
    if (rawLang === 'ar' || /^arabic$/i.test(rawLang)) {
      detectedLang = 'ar';
    } else if (rawLang === 'ug' || /^uyghur$/i.test(rawLang)) {
      detectedLang = 'ug';
    }
    rawItems = findNestedArray(obj);

    if (rawItems.length === 0) {
      const skipKeys = new Set(['bookTitle', 'title', 'name', 'language', 'lang', 'العنوان', 'اللغة']);
      const dictEntries = Object.entries(obj).filter(
        ([k, v]) => typeof v === 'string' && v.trim().length > 0 && !skipKeys.has(k)
      );
      if (dictEntries.length > 0) {
        rawItems = dictEntries.map(([q, a], idx) => ({
          id: idx + 1,
          question: q,
          answer: a
        }));
      }
    }
  }

  const QUESTION_KEYS = [
    'question', 'q', 'prompt', 'front', 'title', 'ask', 'query', 'term',
    'سۇئال', 'سوئال', 'سۇئال_تېكىستى',
    'السؤال', 'سؤال', 'نص_السؤال'
  ];
  const ANSWER_KEYS = [
    'answer', 'a', 'response', 'back', 'explanation', 'definition', 'reply', 'description', 'details',
    'جاۋاب', 'جاۋاپ', 'جاۋاب_تېكىستى',
    'الإجابة', 'الجواب', 'جواب', 'إجابة', 'الشرح'
  ];
  const CATEGORY_KEYS = [
    'category', 'topic', 'chapter', 'section', 'subject', 'tag', 'group',
    'باب', 'تېما',
    'الموضوع', 'الفصل', 'التصنيف', 'القسم', 'الباب'
  ];

  const items: QAItem[] = [];
  const pushItem = (entry: unknown, fallbackCategory?: string) => {
    if (Array.isArray(entry) && entry.length >= 2) {
      const q = String(entry[0] ?? '').trim();
      const a = String(entry[1] ?? '').trim();
      if (q && a) {
        items.push({
          id: items.length + 1,
          category: fallbackCategory || (detectedLang === 'ar' ? 'معرفة أساسية' : 'ئاساسىي بىلىم'),
          question: q,
          answer: a
        });
      }
      return;
    }

    if (!entry || typeof entry !== 'object') {
      return;
    }

    const row = entry as Record<string, unknown>;
    const nestedList = Array.isArray(row.items)
      ? row.items
      : Array.isArray(row.questions)
        ? row.questions
        : Array.isArray(row.qa)
          ? row.qa
          : Array.isArray(row['الأسئلة'])
            ? (row['الأسئلة'] as unknown[])
            : null;

    if (nestedList && nestedList.length > 0) {
      const chName = pickStringField(row, ['title', 'name', 'chapter', 'category', 'topic', 'العنوان', 'الفصل', 'الموضوع']) || fallbackCategory;
      nestedList.forEach((child) => pushItem(child, chName));
      return;
    }

    const q = pickStringField(row, QUESTION_KEYS);
    const a = pickStringField(row, ANSWER_KEYS);
    const cat = pickStringField(row, CATEGORY_KEYS) || fallbackCategory || (detectedLang === 'ar' ? 'معرفة أساسية' : 'ئاساسىي بىلىم');

    if (q && a) {
      items.push({
        id: row.id !== undefined && row.id !== null ? (row.id as string | number) : items.length + 1,
        category: cat,
        question: q,
        answer: a
      });
    }
  };

  rawItems.forEach((entry) => pushItem(entry));

  if (items.length === 0) {
    throw new Error('JSON ئىچىدىن ئىناۋەتلىك سۇئال-جاۋاب تېپىلمىدى. ھەر بىر تۈردە question ۋە answer بولۇشى كېرەك.');
  }

  const inferredLang = detectedLang || detectTextLanguage(items.map((i) => `${i.question} ${i.answer}`).join(' '), 'ug');
  const finalTitle = String(overrideTitle || '').trim() || detectedTitle || (inferredLang === 'ar' ? 'كتاب جديد' : 'يېڭى كىتاب');

  return {
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: finalTitle,
    language: inferredLang,
    createdAt: new Date().toISOString(),
    currentIndex: 0,
    masteredIds: [],
    items
  };
}

export function serializeBookForExport(book: BookRecord): string {
  return JSON.stringify(
    {
      bookTitle: book.title,
      language: book.language || 'ug',
      items: book.items
    },
    null,
    2
  );
}

export function toggleMasteredItem(book: BookRecord, itemId: number | string): BookRecord {
  const exists = book.masteredIds.includes(itemId);
  const nextMastered = exists
    ? book.masteredIds.filter((id) => id !== itemId)
    : [...book.masteredIds, itemId];
  return {
    ...book,
    masteredIds: nextMastered
  };
}

export interface PdfPageText {
  pageNumber: number;
  text: string;
}

export type PdfExportMode = 'study' | 'quiz' | 'unmastered';

export interface PdfExportOptions {
  mode: PdfExportMode;
  includeAnswerKey: boolean;
  includeCategory: boolean;
}

export function normalizePdfExtractedText(rawText: string): string {
  const normalized = String(rawText || '')
    .replace(/^\uFEFF/, '')
    .replace(/\u0000/g, '')
    .normalize('NFKC')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const cleanedLines = normalized
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([،؛؟!.])/g, '$1')
        .trim()
    )
    .filter((line) => {
      if (!line) return true;
      if (
        /^(?:-?\s*[\d\u0660-\u0669]{1,4}\s*-?|Page\s+\d+(?:\s*(?:of|\/)\s*\d+)?|[\d\u0660-\u0669]+\s*-?\s*بەت|(?:صفحة|ص)\s*[\d\u0660-\u0669]+(?:\s*(?:من|\/)\s*[\d\u0660-\u0669]+)?|[\d\u0660-\u0669]+\s*من\s*[\d\u0660-\u0669]+)$/i.test(
          line
        )
      ) {
        return false;
      }
      return true;
    });

  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function joinPdfPagesInRange(
  pages: PdfPageText[],
  fromPage: number,
  toPage: number
): string {
  if (!Array.isArray(pages) || pages.length === 0) return '';
  const minPage = Math.max(1, Math.min(fromPage, toPage));
  const maxPage = Math.max(minPage, Math.max(fromPage, toPage));
  return pages
    .filter((p) => p.pageNumber >= minPage && p.pageNumber <= maxPage && p.text.trim())
    .map((p) => p.text.trim())
    .join('\n\n')
    .trim();
}

export function filterBookItemsForPdf(book: BookRecord, mode: PdfExportMode): QAItem[] {
  if (mode !== 'unmastered') {
    return book.items;
  }
  const masteredSet = new Set(book.masteredIds);
  const pending = book.items.filter((item) => !masteredSet.has(item.id));
  return pending.length > 0 ? pending : book.items;
}

function buildSmartStudyQuestion(
  body: string,
  category: string,
  index: number,
  hasHeading: boolean,
  language: AppLanguage
): string {
  const snippet = body.split(/\s+/).slice(0, 7).join(' ');

  if (language === 'ar') {
    const prefix = hasHeading ? `في موضوع «${category}»` : `في النقطة ${index + 1}`;
    if (/يُعرّف|يعرف|تعريف|عبارة عن|يقصد بـ|المقصود بـ|معنى|defined as|\bmeans\b/i.test(body)) {
      return `${prefix}: ما تعريف وماهية مفهوم «${snippet}...»؟`;
    }
    if (/لأن|بسبب|من أجل|يهدف إلى|نتيجة|لذلك|because|therefore|purpose/i.test(body)) {
      return `${prefix}: ما السبب الرئيسي أو الهدف المذكور في «${snippet}...»؟`;
    }
    if (/أولا|أولاً|ثانيا|ثانياً|مراحل|خطوات|شروط|مبادئ|قواعد|\b1\)|•/.test(body)) {
      return `${prefix}: ما أبرز الخطوات أو الشروط الواردة في «${snippet}...»؟`;
    }
    if (/\b(?:1[0-9]{3}|20[0-9]{2})\b|سنة|عام|قرن|هجري|[\u0660-\u0669]{4}/.test(body)) {
      return `${prefix}: ما الحدث أو المعطى التاريخي المهم المرتبط بـ «${snippet}...»؟`;
    }
    const arVariants = [
      `${prefix}: كيف تشرح مضمون «${snippet}...»؟`,
      `${prefix}: ما الفكرة الأساسية والأهمية العلمية في «${snippet}...»؟`,
      `${prefix}: ما الخلاصة الرئيسية المستفادة من «${snippet}...»؟`
    ];
    return arVariants[index % arVariants.length];
  }

  const prefix = hasHeading ? `«${category}» تېمىسىدا` : `${index + 1}-مۇھىم نۇقتىدا`;

  if (/دېگەنلىك|دېمەكتۇر|ھېسابلىنىدۇ|ئىبارەت|ئېنىقلىمىسى|defined as|\bmeans\b|refers to/i.test(body)) {
    return `${prefix}: «${snippet}...» ئۇقۇمىنىڭ ئېنىقلىمىسى ۋە ماھىيىتى نېمە؟`;
  }
  if (/چۈنكى|سەۋەبى|مەقسىتى|ئۈچۈن|نەتىجىدە|because|therefore|purpose/i.test(body)) {
    return `${prefix}: «${snippet}...» دا بايان قىلىنغان ئاساسىي سەۋەب ياكى مەقسەت نېمە؟`;
  }
  if (/بىرىنچى|ئىككىنچى|باسقۇچ|پىرىنسىپ|قائىدە|\b1\)|•/.test(body)) {
    return `${prefix}: «${snippet}...» دائىرىسىدىكى ئاساسىي باسقۇچ ياكى تەلەپلەر قايسىلار؟`;
  }
  if (/\b(?:1[0-9]{3}|20[0-9]{2})\b|يىلى|ئەسىر/.test(body)) {
    return `${prefix}: «${snippet}...» بىلەن مۇناسىۋەتلىك مۇھىم تارىخىي پاكىت قايسى؟`;
  }

  const variants = [
    `${prefix}: «${snippet}...» مەزمۇنىنى قانداق چۈشەندۈرىسىز؟`,
    `${prefix}: «${snippet}...» نىڭ ئاساسىي پىكرى ۋە ئەھمىيىتى نېمە؟`,
    `${prefix}: «${snippet}...» دىن چىقىرىلىدىغان تۈپ خۇلاسە نېمە؟`
  ];
  return variants[index % variants.length];
}

function cleanStudyText(rawText: string): string {
  return normalizePdfExtractedText(rawText);
}

export function generateLocalQaFromText(
  rawText: string,
  overrideTitle?: string,
  maxItems = 30,
  preferredLanguage?: AppLanguage
): BookRecord {
  const normalized = cleanStudyText(rawText);
  if (normalized.length < 15) {
    throw new Error(
      preferredLanguage === 'ar'
        ? 'يرجى إدخال نص كافٍ (بضع جمل على الأقل) لإنشاء الأسئلة والأجوبة.'
        : 'سۇئال-جاۋاب ياساش ئۈچۈن يېتەرلىك تېكىست يېزىڭ (ئاز دېگەندە بىر نەچچە جۈملە بولسۇن).'
    );
  }

  const resolvedLanguage = preferredLanguage
    ? detectTextLanguage(normalized, preferredLanguage)
    : detectTextLanguage(normalized, 'ug');
  const limit = Math.max(1, Math.min(30, maxItems));
  const items: QAItem[] = [];

  // 1. Check for explicit Q/A blocks (Uyghur, Arabic, English)
  const qaBlockRegex =
    /(?:^|\n)\s*(?:[\d\u0660-\u0669]+[.)\-\s]*)?(?:سۇئال|سوئال|السؤال|سؤال|س|Q|Question)\s*[:：]\s*([\s\S]+?)\n\s*(?:جاۋاب|جاۋاپ|الإجابة|الجواب|إجابة|جواب|ج|A|Answer)\s*[:：]\s*([\s\S]+?)(?=\n\s*(?:[\d\u0660-\u0669]+[.)\-\s]*)?(?:سۇئال|سوئال|السؤال|سؤال|س|Q|Question)\s*[:：]|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = qaBlockRegex.exec(normalized)) !== null && items.length < limit) {
    const q = match[1].trim();
    const a = match[2].trim();
    if (q && a) {
      items.push({
        id: items.length + 1,
        category: resolvedLanguage === 'ar' ? 'سؤال مستخرج من النص' : 'تېكىستتىن ئايرىلغان سۇئال',
        question: q,
        answer: a
      });
    }
  }

  // 2. If not explicit Q&A format, segment into paragraphs / sentences and build structured study Q&As
  if (items.length === 0) {
    const rawBlocks = normalized
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const paragraphs: string[] = [];
    for (const block of rawBlocks) {
      if (block.length <= 420) {
        paragraphs.push(block);
      } else {
        const sentences = block
          .split(/(?<=[.!?؟۔\n])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
        let chunk = '';
        for (const s of sentences) {
          if (chunk && (chunk + ' ' + s).length > 320) {
            paragraphs.push(chunk.trim());
            chunk = s;
          } else {
            chunk = chunk ? `${chunk} ${s}` : s;
          }
        }
        if (chunk.trim()) paragraphs.push(chunk.trim());
      }
    }

    let chunks: string[] = [];
    if (paragraphs.length >= 3 || (paragraphs.length >= 2 && paragraphs.every((p) => p.length >= 45))) {
      chunks = paragraphs;
    } else {
      const unwrapped = normalized.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      const bySentence = unwrapped
        .split(/(?<=[.!?؟۔])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 12);

      if (bySentence.length >= 2) {
        chunks = bySentence;
      } else {
        const words = unwrapped.split(' ').filter(Boolean);
        const targetChunks = Math.min(limit, Math.max(1, Math.ceil(words.length / 32)));
        const wordsPerChunk = Math.max(18, Math.ceil(words.length / targetChunks));
        for (let w = 0; w < words.length; w += wordsPerChunk) {
          const seg = words.slice(w, w + wordsPerChunk).join(' ').trim();
          if (seg.length >= 12) chunks.push(seg);
        }
      }
    }

    let pendingHeading = '';
    for (let idx = 0; idx < chunks.length; idx++) {
      if (items.length >= limit) break;
      const part = chunks[idx];
      const lines = part.split('\n').map((l) => l.trim()).filter(Boolean);
      const hasNext = idx + 1 < chunks.length;
      if (
        paragraphs.length >= 3 &&
        hasNext &&
        lines.length === 1 &&
        lines[0].length >= 2 &&
        lines[0].length < 48 &&
        !/[.!?؟۔]$/.test(lines[0]) &&
        lines[0].split(/\s+/).length <= 6
      ) {
        pendingHeading = lines[0].replace(/[:：]+$/, '');
        continue;
      }

      const body = lines.join(' ').trim();
      if (body.length < 12) continue;

      const hasHeading = Boolean(pendingHeading);
      let category =
        pendingHeading ||
        (resolvedLanguage === 'ar' ? `المحتوى الأساسي · ${items.length + 1}` : `ئاساسىي مەزمۇن · ${items.length + 1}`);
      let question = '';

      if (lines.length >= 2 && lines[0].length < 70 && lines[0].split(/\s+/).length <= 8) {
        category = lines[0].replace(/[:：]+$/, '');
        const rest = lines.slice(1).join(' ').trim();
        question =
          resolvedLanguage === 'ar'
            ? `ما أهم مضمون ورد في موضوع «${category}»؟`
            : `«${category}» تېمىسىدىكى ئەڭ مۇھىم مەزمۇن نېمە؟`;
        items.push({
          id: items.length + 1,
          category,
          question,
          answer: rest || body
        });
      } else if (/[؟?]$/.test(body)) {
        question = body;
        items.push({
          id: items.length + 1,
          category,
          question,
          answer: hasHeading
            ? resolvedLanguage === 'ar'
              ? `ينبغي استذكار هذه النقطة ضمن موضوع «${category}»: ${body}`
              : `«${category}» تېمىسى دائىرىسىدە بۇ نۇقتىنى تەپسىلىي ئەستە تۇتۇش كېرەك: ${body}`
            : body
        });
      } else {
        question = buildSmartStudyQuestion(body, category, items.length, hasHeading, resolvedLanguage);
        items.push({
          id: items.length + 1,
          category,
          question,
          answer: body
        });
      }
      pendingHeading = '';
    }

    if (items.length === 0) {
      const flat = normalized.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      const words = flat.split(' ').filter(Boolean);
      const chunkWordCount = Math.max(18, Math.ceil(words.length / limit));
      for (let w = 0; w < words.length && items.length < limit; w += chunkWordCount) {
        const segment = words.slice(w, w + chunkWordCount).join(' ').trim();
        if (segment.length < 12) continue;
        const category =
          resolvedLanguage === 'ar' ? `محتوى PDF · ${items.length + 1}` : `PDF مەزمۇنى · ${items.length + 1}`;
        items.push({
          id: items.length + 1,
          category,
          question: buildSmartStudyQuestion(segment, category, items.length, false, resolvedLanguage),
          answer: segment
        });
      }
    }
  }

  if (items.length === 0) {
    throw new Error(
      resolvedLanguage === 'ar'
        ? 'تعذر استخراج أسئلة من النص. يرجى إدخال فقرة واضحة على الأقل.'
        : 'تېكىستتىن سۇئال-جاۋاب تۈزۈش مۇمكىن بولمىدى. ئاز دېگەندە بىر ئابزاس ئېنىق تېكىست كىرگۈزۈڭ.'
    );
  }

  const finalTitle =
    String(overrideTitle || '').trim() ||
    (resolvedLanguage === 'ar' ? 'كتاب مُعد من النص' : 'تېكىستتىن تەييارلانغان كىتاب');

  return {
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: finalTitle,
    language: resolvedLanguage,
    createdAt: new Date().toISOString(),
    currentIndex: 0,
    masteredIds: [],
    items
  };
}
