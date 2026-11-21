import { AppLanguage } from './karlukCore';

export interface UiStrings {
  brandTitle: string;
  navWorkbench: string;
  navPrd: string;
  navSpec: string;
  navCode: string;
  zipDownload: string;
  zipDownloadedNote: string;
  settingsLabel: string;
  reminderLabel: string;
  reminderOpen: string;
  reminderClosed: string;
  reminderOnToast: string;
  reminderOffToast: string;
  themeLabel: string;
  brightnessLabel: string;
  booksLabel: string;
  detailedSettingsLabel: string;
  languageLabel: string;
  languageDesc: string;
  languageUg: string;
  languageAr: string;
  remindersCardTitle: string;
  masteredLabel: string;
  noBookOption: string;
  emptyBooksMessage: string;
  showAnswer: string;
  hideAnswer: string;
  answerLabel: string;
  prevBtn: string;
  masterBtn: string;
  masteredBtn: string;
  nextBtn: string;
  addBookBtn: string;
  exportBookBtn: string;
  preparePromptBtn: string;
  collapsePopup: string;
  expandScreen: string;
  booksSavedSummary: (count: number) => string;
  // Modals
  addModalTitle: string;
  exportModalTitle: string;
  promptModalTitle: string;
  settingsModalTitle: string;
  closeLabel: string;
  bookTitleLabel: string;
  bookTitlePlaceholder: string;
  tabAuto: string;
  tabJson: string;
  dropPdfLabel: string;
  readingPdf: string;
  pageRangeLabel: string;
  pageFrom: string;
  pageTo: string;
  qaCountLabel: string;
  pasteStudyTextLabel: string;
  generateAiBtn: (count: number) => string;
  generatingAiBtn: string;
  generateOfflineBtn: (count: number) => string;
  jsonUploadBoxLabel: string;
  jsonPasteLabel: string;
  saveBookJsonBtn: string;
  exportModalDesc: string;
  noBooksSaved: string;
  // Prompt + JSON Modal
  promptModalDesc: string;
  promptTopicLabel: string;
  promptTopicPlaceholder: string;
  promptSourceOptionalLabel: string;
  promptSourceOptionalPlaceholder: string;
  copyPromptBtn: string;
  downloadSampleJsonBtn: string;
  downloadActiveJsonBtn: string;
  pasteAiJsonHeading: string;
  pasteAiJsonPlaceholder: string;
  savePastedAiJsonBtn: string;
  // Settings Modal
  brightnessDesc: string;
  startupReminderTitle: string;
  startupReminderDesc: string;
  testReminderTitle: string;
  testReminderDesc: string;
  testBtn: string;
  privacyFooter: string;
  // Lab panel
  labTitle: (count: number) => string;
  labSubtitle: string;
  labSourceTitleLabel: string;
  labSourceTitlePlaceholder: string;
  labDropZoneHint: string;
  labDropZoneAction: string;
  labPasteLabel: string;
  labJsonUploadBtn: string;
  labSample30Btn: string;
  labTestReminderBtn: string;
  labManualPromptBtn: string;
  labSavedBooksHeading: (count: number) => string;
  labReminderOpenStatus: string;
  labReminderClosedStatus: string;
  labActiveBadge: string;
  labExportPdfBtn: string;
  // PDF Export Modal
  pdfModalTitle: string;
  pdfModeStudy: string;
  pdfModeStudyHint: string;
  pdfModeQuiz: string;
  pdfModeQuizHint: string;
  pdfModeUnmastered: string;
  pdfModeUnmasteredHint: string;
  pdfIncludeCategory: string;
  pdfIncludeAnswerKey: string;
  pdfPrintBtn: string;
  pdfDownloadHtmlBtn: string;
  pdfAnswerKeyLabel: string;
  pdfQuestionSuffix: string;
}

const UG_STRINGS: UiStrings = {
  brandTitle: 'قارلۇق ئۆگىنىش ياردەمچىسى',
  navWorkbench: 'سىناق كۆزنىكى',
  navPrd: 'PRD ھۆججىتى',
  navSpec: 'SPEC ھۆججىتى',
  navCode: 'كود ۋە قاچىلاش',
  zipDownload: 'ZIP چۈشۈرۈش',
  zipDownloadedNote: 'ZIP چۈشۈرۈلدى! ئالدى بىلەن يېشىپ (Extract)، ئاندىن chrome://extensions دا Load unpacked ئارقىلىق قىسقۇچنى تاللاڭ.',
  settingsLabel: 'تەڭشەك',
  reminderLabel: 'ئەسكەرتىش',
  reminderOpen: 'ئوچۇق',
  reminderClosed: 'تاقاق',
  reminderOnToast: 'تور كۆرگۈچ ئېچىلغاندا ئەسكەرتىش قوزغىتىلدى',
  reminderOffToast: 'تور كۆرگۈچ ئېچىلغاندا ئەسكەرتىش ئېتىۋېتىلدى',
  themeLabel: 'كۈندۈز / تۈن',
  brightnessLabel: 'يورۇقلۇق',
  booksLabel: 'كىتابلار',
  detailedSettingsLabel: 'تەپسىلىي تەڭشەك',
  languageLabel: 'تىل / اللغة',
  languageDesc: 'ئۇيغۇرچە ياكى ئەرەبچە ماتېرىيال ۋە كۆرۈنمە تىلىنى تاللاڭ',
  languageUg: 'ئۇيغۇرچە',
  languageAr: 'العربية',
  remindersCardTitle: 'ئەسكەرتىملەر',
  masteredLabel: 'ئۆگەنگەن',
  noBookOption: 'كىتاب يوق',
  emptyBooksMessage: 'ھازىرچە كىتاب تېپىلمىدى. «كىتاپ قوشۇش» نى بېسىڭ.',
  showAnswer: 'جاۋابنى كۆرۈش',
  hideAnswer: 'جاۋابنى يوشۇرۇش',
  answerLabel: 'جاۋاب:',
  prevBtn: 'ئالدىنقى',
  masterBtn: 'ئۆگەندىم',
  masteredBtn: 'ئۆگىنىلدى',
  nextBtn: 'كېيىنكى',
  addBookBtn: 'كىتاپ قوشۇش',
  exportBookBtn: 'كىتاپ چىقىرىش',
  preparePromptBtn: 'ئىئاي ئۈچۈن پىرۇمپىت تەييارلاش (JSON)',
  collapsePopup: 'كىچىك كۆزنەك',
  expandScreen: 'چوڭ ئېكران ھالىتى',
  booksSavedSummary: (count) => `${count} كىتاب ساقلاندى · نۆل ئىز قوغلاش`,
  addModalTitle: 'كىتاپ قوشۇش (PDF / تېكىست / JSON)',
  exportModalTitle: 'كىتاپ چىقىرىش (JSON / PDF) ۋە باشقۇرۇش',
  promptModalTitle: 'ئىئاي ئۈچۈن پىرۇمپىت ۋە JSON تەييارلاش',
  settingsModalTitle: 'تەڭشەك ۋە ئەسكەرتىش',
  closeLabel: 'كۆزنەكنى تاقاش',
  bookTitleLabel: 'كىتاب ياكى بىلىم نامى (ئىختىيارىي)',
  bookTitlePlaceholder: 'مەسىلەن: شەرقىي تۈركىستان تارىخى',
  tabAuto: 'PDF / تېكىستتىن ياساش',
  tabJson: 'JSON يۈكلەش',
  dropPdfLabel: '.pdf ياكى .txt ھۆججەت قېتىش',
  readingPdf: 'PDF تېكىستى ئوقۇلۇۋاتىدۇ...',
  pageRangeLabel: 'بەت دائىرىسى:',
  pageFrom: 'باش',
  pageTo: 'ئاخىر',
  qaCountLabel: 'تۈزۈلىدىغان سۇئال-جاۋاب سانى:',
  pasteStudyTextLabel: 'ياكى كىتاب / دەرسلىك مەزمۇنىنى چاپلاڭ:',
  generateAiBtn: (count) => `بىۋاسىتە ${count} سۇئال-جاۋاب ياساش (AI)`,
  generatingAiBtn: 'AI سۇئال-جاۋاب ياساۋاتىدۇ...',
  generateOfflineBtn: (count) => `تور سىرتىدا تېز ياساش (${count} سۇئال)`,
  jsonUploadBoxLabel: '.json ھۆججەت تاللاش ياكى تاشلاش',
  jsonPasteLabel: 'ياكى JSON مەزمۇنىنى چاپلاڭ:',
  saveBookJsonBtn: 'ساقلاش ۋە كىتاب قوشۇش',
  exportModalDesc: 'ھەر بىر كىتاب ئايرىم ساقلانغان بولۇپ، بىر قېتىم يۈكلەنگەندىن كېيىن يوقاپ كەتمەيدۇ. خالىغان كىتابنى JSON ياكى رەتلىك PDF قىلىپ چىقىرىپ ساقلىيالايسىز.',
  noBooksSaved: 'ساقلانغان كىتاب يوق.',
  promptModalDesc: 'تۆۋەندىكى پىرۇمپىت AI غا ساپ JSON قايتۇرۇشنى بۇيرۇيدۇ. كۆچۈرۈپ AI غا بېرىڭ، ئاندىن AI چىقىرىپ بەرگەن JSON نى تۆۋەنگە چاپلاپ بىۋاسىتە ساقلىيالايسىز.',
  promptTopicLabel: 'كىتاب ياكى دەرسلىك نامى:',
  promptTopicPlaceholder: 'مەسىلەن: قۇتادغۇ بىلىك ئاساسلىرى',
  promptSourceOptionalLabel: 'مەنبە تېكىست قوشۇش (ئىختىيارىي — پىرۇمپىت ئىچىگە كىرىدۇ):',
  promptSourceOptionalPlaceholder: 'ئەگەر تېكىستنى پىرۇمپىت بىلەن بىللە كۆچۈرمەكچى بولسىڭىز بۇ يەرگە چاپلاڭ...',
  copyPromptBtn: 'پىرۇمپىتنى كۆچۈرۈش',
  downloadSampleJsonBtn: '30 سۇئاللىق JSON قېلىپ چۈشۈرۈش',
  downloadActiveJsonBtn: 'نۆۋەتتىكى كىتاب JSON نى چۈشۈرۈش',
  pasteAiJsonHeading: 'AI چىقىرىپ بەرگەن JSON نى بۇ يەرگە چاپلاپ ساقلاڭ:',
  pasteAiJsonPlaceholder: '{"bookTitle":"...","language":"ug","items":[{"id":1,"question":"...","answer":"..."}]}',
  savePastedAiJsonBtn: 'بۇ JSON نى كىتاب قىلىپ ساقلاش',
  brightnessDesc: 'ئوقۇشقا قولايلىق يورۇقلۇقنى يۇقىرى-تۆۋەن تەڭشەڭ',
  startupReminderTitle: 'تور كۆرگۈچ ئېچىلغاندا ئەسكەرتىش',
  startupReminderDesc: 'ھەر قېتىم Chrome ئېچىلغاندا سۇئال چىقىرىدۇ',
  testReminderTitle: 'ئەسكەرتىشنى ھازىر سىناش',
  testReminderDesc: 'تور كۆرگۈچ ئۇقتۇرۇش كۆرۈنۈشى',
  testBtn: 'سىناش',
  privacyFooter: 'بارلىق مەلۇماتلار پەقەت ئۆز كومپيۇتېرىڭىزدىلا ساقلىنىدۇ؛ ھېچقانداق تاشقى مۇلازىمېتىرغا ئەۋەتىلمەيدۇ.',
  labTitle: (count) => `بىۋاسىتە ${count} سۇئال-جاۋاب ياساش (PDF ياكى تېكىستتىن)`,
  labSubtitle: 'سىرتقى AI پروگراممىلىرىغا بېرىپ يۈرمەستىن، .pdf ھۆججىتى ياكى دەرسلىك تېكىستىنى قېتىپ بىۋاسىتە سۇئال-جاۋاب ياساپ ساقلاڭ ۋە PDF/JSON چىقىرىڭ.',
  labSourceTitleLabel: 'كىتاب ياكى دەرسلىك نامى:',
  labSourceTitlePlaceholder: 'مەسىلەن: شەرقىي تۈركىستان مەدەنىيىتى',
  labDropZoneHint: '.pdf ياكى .txt ھۆججەتنى بۇ يەرگە تاشلاڭ ياكى تاللاڭ',
  labDropZoneAction: 'PDF / تېكىست قېتىش',
  labPasteLabel: 'ياكى كىتاب / ماقالە مەزمۇنىنى بۇ يەرگە چاپلاڭ:',
  labJsonUploadBtn: 'JSON ھۆججەت يۈكلەش',
  labSample30Btn: '30 سۇئاللىق ئۈلگە قوشۇش',
  labTestReminderBtn: 'ئېچىلىش ئەسكەرتىشى سىنىقى',
  labManualPromptBtn: 'AI پىرۇمپىت ۋە JSON',
  labSavedBooksHeading: (count) => `ساقلانغان ئايرىم كىتابلار (${count})`,
  labReminderOpenStatus: 'ئېچىلىش ئەسكەرتىشى: ئوچۇق',
  labReminderClosedStatus: 'ئېچىلىش ئەسكەرتىشى: تاقاق',
  labActiveBadge: 'ئاكتىپ',
  labExportPdfBtn: 'PDF چىقىرىش',
  pdfModalTitle: 'A4 PDF كۆرۈنۈشى ۋە چىقىرىش',
  pdfModeStudy: 'تولۇق نۇسخا',
  pdfModeStudyHint: 'سۇئال ۋە تەپسىلىي جاۋابلار بىللە',
  pdfModeQuiz: 'سىناق قەغىزى',
  pdfModeQuizHint: 'يېزىش سىزىقى + ئاخىرىدا جاۋاب ئاچقۇچى',
  pdfModeUnmastered: 'ئۆگەنمىگەنلىرىلا',
  pdfModeUnmasteredHint: 'پەقەت تېخى ئۆگەنمىگەن سۇئاللارلا چىقىدۇ',
  pdfIncludeCategory: 'تېما / باب خەتكۈچىنى كۆرسىتىش',
  pdfIncludeAnswerKey: 'ئاخىرقى بەتكە جاۋاب ئاچقۇچىنى قوشۇش',
  pdfPrintBtn: 'PDF ساقلاش / بېسىش',
  pdfDownloadHtmlBtn: 'تور بېتى (HTML) قىلىپ ساقلاش',
  pdfAnswerKeyLabel: 'جاۋاب ئاچقۇچى',
  pdfQuestionSuffix: 'سۇئال'
};

const AR_STRINGS: UiStrings = {
  brandTitle: 'مساعد قارلۇق للتعلّم',
  navWorkbench: 'منصة الاختبار',
  navPrd: 'وثيقة PRD',
  navSpec: 'وثيقة SPEC',
  navCode: 'الكود والتثبيت',
  zipDownload: 'تنزيل ZIP',
  zipDownloadedNote: 'تم تنزيل ZIP! قم بفك الضغط أولاً، ثم في chrome://extensions اختر Load unpacked وحدد المجلد.',
  settingsLabel: 'الإعدادات',
  reminderLabel: 'التنبيهات',
  reminderOpen: 'مفعّل',
  reminderClosed: 'متوقف',
  reminderOnToast: 'تم تفعيل تنبيه التعلم عند فتح المتصفح',
  reminderOffToast: 'تم إيقاف تنبيه التعلم عند فتح المتصفح',
  themeLabel: 'نهار / ليل',
  brightnessLabel: 'السطوع',
  booksLabel: 'الكتب',
  detailedSettingsLabel: 'إعدادات مفصّلة',
  languageLabel: 'اللغة / تىل',
  languageDesc: 'اختر لغة الواجهة والمواد (الأويغورية أو العربية)',
  languageUg: 'ئۇيغۇرچە',
  languageAr: 'العربية',
  remindersCardTitle: 'المراجعات',
  masteredLabel: 'المُتقن',
  noBookOption: 'لا توجد كتب',
  emptyBooksMessage: 'لا توجد كتب بعد. اضغط على «إضافة كتاب».',
  showAnswer: 'إظهار الإجابة',
  hideAnswer: 'إخفاء الإجابة',
  answerLabel: 'الإجابة:',
  prevBtn: 'السابق',
  masterBtn: 'أتقنتُها',
  masteredBtn: 'تم الإتقان',
  nextBtn: 'التالي',
  addBookBtn: 'إضافة كتاب',
  exportBookBtn: 'تصدير الكتاب',
  preparePromptBtn: 'إعداد موجه JSON للذكاء الاصطناعي',
  collapsePopup: 'نافذة مصغّرة',
  expandScreen: 'وضع الشاشة الكاملة',
  booksSavedSummary: (count) => `تم حفظ ${count} كتاب · بدون تتبع`,
  addModalTitle: 'إضافة كتاب (PDF / نص / JSON)',
  exportModalTitle: 'تصدير الكتب (JSON / PDF) وإدارتها',
  promptModalTitle: 'إعداد موجه الذكاء الاصطناعي وملف JSON',
  settingsModalTitle: 'الإعدادات والتنبيهات',
  closeLabel: 'إغلاق النافذة',
  bookTitleLabel: 'اسم الكتاب أو المادة (اختياري)',
  bookTitlePlaceholder: 'مثال: أصول الفقه أو تاريخ الحضارة',
  tabAuto: 'إنشاء من PDF / نص',
  tabJson: 'تحميل JSON',
  dropPdfLabel: 'إرفاق ملف .pdf أو .txt',
  readingPdf: 'جارٍ قراءة نص PDF...',
  pageRangeLabel: 'نطاق الصفحات:',
  pageFrom: 'من',
  pageTo: 'إلى',
  qaCountLabel: 'عدد الأسئلة المطلوبة:',
  pasteStudyTextLabel: 'أو الصق محتوى الكتاب / الدرس هنا:',
  generateAiBtn: (count) => `إنشاء ${count} سؤالاً وجواباً بالذكاء الاصطناعي`,
  generatingAiBtn: 'الذكاء الاصطناعي يحلل النص...',
  generateOfflineBtn: (count) => `إنشاء سريع دون إنترنت (${count} سؤالاً)`,
  jsonUploadBoxLabel: 'اختر أو اسحب ملف .json هنا',
  jsonPasteLabel: 'أو الصق محتوى JSON هنا:',
  saveBookJsonBtn: 'حفظ وإضافة الكتاب',
  exportModalDesc: 'يُحفظ كل كتاب بشكل مستقل ولا يضيع بعد إضافته. يمكنك تصدير أي كتاب بصيغة JSON أو PDF منسّق.',
  noBooksSaved: 'لا توجد كتب محفوظة.',
  promptModalDesc: 'يوجّه هذا النص الذكاء الاصطناعي لإخراج ملف JSON نقي فقط. انسخه وأعطه لأي نموذج ذكاء اصطناعي، ثم الصق الرد أدناه لحفظه فوراً ككتاب.',
  promptTopicLabel: 'عنوان الكتاب أو الدرس:',
  promptTopicPlaceholder: 'مثال: مقدمة ابن خلدون',
  promptSourceOptionalLabel: 'إدراج نص المادة داخل الموجه (اختياري):',
  promptSourceOptionalPlaceholder: 'الصق مقتطفاً من الدرس إذا أردت نسخه مع الموجه مباشرة...',
  copyPromptBtn: 'نسخ الموجه (Prompt)',
  downloadSampleJsonBtn: 'تنزيل قالب JSON (30 سؤالاً)',
  downloadActiveJsonBtn: 'تنزيل JSON للكتاب الحالي',
  pasteAiJsonHeading: 'الصق رد JSON من الذكاء الاصطناعي هنا لحفظه فوراً:',
  pasteAiJsonPlaceholder: '{"bookTitle":"...","language":"ar","items":[{"id":1,"question":"...","answer":"..."}]}',
  savePastedAiJsonBtn: 'حفظ JSON وإضافته للكتب',
  brightnessDesc: 'اضبط سطوع الشاشة لقراءة مريحة للعين',
  startupReminderTitle: 'تنبيه عند فتح المتصفح',
  startupReminderDesc: 'يعرض سؤالاً مهماً تلقائياً عند تشغيل Chrome',
  testReminderTitle: 'تجربة التنبيه الآن',
  testReminderDesc: 'معاينة شكل إشعار المتصفح',
  testBtn: 'تجربة',
  privacyFooter: 'تحفظ جميع البيانات محلياً على جهازك فقط ولا ترسل إلى أي خادم خارجي.',
  labTitle: (count) => `إنشاء ${count} سؤالاً وجواباً مباشرة (من PDF أو نص)`,
  labSubtitle: 'أرفق ملف .pdf أو نصاً عربياً أو أويغورياً لإنشاء الأسئلة وحفظها وتصديرها بصيغة PDF أو JSON مباشرة.',
  labSourceTitleLabel: 'اسم الكتاب أو المقرر:',
  labSourceTitlePlaceholder: 'مثال: تاريخ الأدب العربي',
  labDropZoneHint: 'اسحب أو اختر ملف .pdf أو .txt هنا',
  labDropZoneAction: 'إرفاق PDF / نص',
  labPasteLabel: 'أو الصق محتوى الكتاب / المقالة هنا:',
  labJsonUploadBtn: 'تحميل ملف JSON',
  labSample30Btn: 'إضافة نموذج 30 سؤالاً',
  labTestReminderBtn: 'اختبار تنبيه التشغيل',
  labManualPromptBtn: 'موجه AI وقوالب JSON',
  labSavedBooksHeading: (count) => `الكتب المستقلة المحفوظة (${count})`,
  labReminderOpenStatus: 'تنبيه الفتح: مفعّل',
  labReminderClosedStatus: 'تنبيه الفتح: متوقف',
  labActiveBadge: 'نشط',
  labExportPdfBtn: 'تصدير PDF',
  pdfModalTitle: 'معاينة وتصدير A4 PDF',
  pdfModeStudy: 'نسخة الدراسة الكاملة',
  pdfModeStudyHint: 'الأسئلة مع الإجابات المفصلة',
  pdfModeQuiz: 'ورقة اختبار',
  pdfModeQuizHint: 'أسطر للكتابة + مفتاح الإجابات في النهاية',
  pdfModeUnmastered: 'غير المتقنة فقط',
  pdfModeUnmasteredHint: 'تصدير الأسئلة التي لم تُتقن بعد فقط',
  pdfIncludeCategory: 'إظهار تصنيف / عنوان الموضوع',
  pdfIncludeAnswerKey: 'إضافة صفحة مفتاح الإجابات في النهاية',
  pdfPrintBtn: 'حفظ PDF / طباعة',
  pdfDownloadHtmlBtn: 'حفظ كصفحة ويب (HTML)',
  pdfAnswerKeyLabel: 'مفتاح الإجابات',
  pdfQuestionSuffix: 'سؤال'
};

export function getUiStrings(lang: AppLanguage): UiStrings {
  return lang === 'ar' ? AR_STRINGS : UG_STRINGS;
}
