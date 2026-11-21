/**
 * قارلۇق ئۆگىنىش ياردەمچىسى — ئارقا سۇپا مۇلازىمەتچىسى (Service Worker)
 * نۆل ئىز قوغلاش، پۈتۈنلەي يەرلىك ساقلاش، تور كۆرگۈچ ئېچىلغاندا ئەسكەرتىش چىقىرىش.
 */
'use strict';

const STORAGE_KEYS = {
  BOOKS: 'karluk_books',
  ACTIVE_BOOK_ID: 'karluk_active_book_id',
  SETTINGS: 'karluk_settings'
};

const NOTIFICATION_ID = 'karluk-startup-reminder';

function normalizeLanguage(val) {
  return val === 'ar' ? 'ar' : 'ug';
}

function getDefaultStarterBook(lang) {
  if (normalizeLanguage(lang) === 'ar') {
    return {
      id: 'book_starter_arabic_knowledge',
      title: 'أصول البحث العلمي والثقافة الإسلامية (نموذج)',
      language: 'ar',
      createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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

function getStorageData(keys) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(result || {});
      });
    } catch (err) {
      reject(err);
    }
  });
}

function setStorageData(payload) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(payload, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function updateBadgeState() {
  try {
    const data = await getStorageData([
      STORAGE_KEYS.BOOKS,
      STORAGE_KEYS.ACTIVE_BOOK_ID,
      STORAGE_KEYS.SETTINGS
    ]);
    const settings = data[STORAGE_KEYS.SETTINGS] || { reminderEnabled: true, theme: 'light', brightness: 100, language: 'ug' };
    const books = Array.isArray(data[STORAGE_KEYS.BOOKS]) ? data[STORAGE_KEYS.BOOKS] : [];

    if (!settings.reminderEnabled || books.length === 0) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const activeBook = books.find((b) => b.id === data[STORAGE_KEYS.ACTIVE_BOOK_ID]) || books[0];
    const masteredSet = new Set(Array.isArray(activeBook.masteredIds) ? activeBook.masteredIds : []);
    const remaining = Array.isArray(activeBook.items)
      ? activeBook.items.filter((item) => !masteredSet.has(item.id)).length
      : 0;

    await chrome.action.setBadgeBackgroundColor({ color: '#F05A28' });
    await chrome.action.setBadgeText({ text: remaining > 0 ? String(remaining) : '✓' });
  } catch (err) {
    console.error('Badge update error:', err);
  }
}

async function triggerStartupReminder() {
  try {
    const data = await getStorageData([
      STORAGE_KEYS.BOOKS,
      STORAGE_KEYS.ACTIVE_BOOK_ID,
      STORAGE_KEYS.SETTINGS
    ]);
    const settings = data[STORAGE_KEYS.SETTINGS] || { reminderEnabled: true, theme: 'light', brightness: 100, language: 'ug' };
    if (!settings.reminderEnabled) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const books = Array.isArray(data[STORAGE_KEYS.BOOKS]) ? data[STORAGE_KEYS.BOOKS] : [];
    if (books.length === 0) {
      return;
    }

    const activeBook = books.find((b) => b.id === data[STORAGE_KEYS.ACTIVE_BOOK_ID]) || books[0];
    const items = Array.isArray(activeBook.items) ? activeBook.items : [];
    if (items.length === 0) {
      return;
    }

    const masteredSet = new Set(Array.isArray(activeBook.masteredIds) ? activeBook.masteredIds : []);
    const pendingItems = items.filter((item) => !masteredSet.has(item.id));
    const pool = pendingItems.length > 0 ? pendingItems : items;
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    await updateBadgeState();

    const lang = normalizeLanguage(settings.language);
    const notifTitle = lang === 'ar' ? `تنبيه قارلۇق · ${activeBook.title}` : `قارلۇق ئەسكەرتىش · ${activeBook.title}`;

    chrome.notifications.create(NOTIFICATION_ID, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: notifTitle,
      message: chosen.question,
      priority: 2
    });
  } catch (err) {
    console.error('Startup reminder error:', err);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const existing = await getStorageData([
      STORAGE_KEYS.BOOKS,
      STORAGE_KEYS.ACTIVE_BOOK_ID,
      STORAGE_KEYS.SETTINGS
    ]);
    const updates = {};

    if (!Array.isArray(existing[STORAGE_KEYS.BOOKS]) || existing[STORAGE_KEYS.BOOKS].length === 0) {
      const starter = getDefaultStarterBook(existing[STORAGE_KEYS.SETTINGS] && existing[STORAGE_KEYS.SETTINGS].language);
      updates[STORAGE_KEYS.BOOKS] = [starter];
      updates[STORAGE_KEYS.ACTIVE_BOOK_ID] = starter.id;
    }

    if (!existing[STORAGE_KEYS.SETTINGS]) {
      updates[STORAGE_KEYS.SETTINGS] = {
        reminderEnabled: true,
        theme: 'light',
        brightness: 100,
        language: 'ug'
      };
    } else if (!existing[STORAGE_KEYS.SETTINGS].language) {
      updates[STORAGE_KEYS.SETTINGS] = Object.assign({}, existing[STORAGE_KEYS.SETTINGS], { language: 'ug' });
    }

    if (Object.keys(updates).length > 0) {
      await setStorageData(updates);
    }

    await updateBadgeState();
  } catch (err) {
    console.error('onInstalled initialization error:', err);
  }
});

chrome.runtime.onStartup.addListener(() => {
  triggerStartupReminder();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes[STORAGE_KEYS.BOOKS] || changes[STORAGE_KEYS.ACTIVE_BOOK_ID] || changes[STORAGE_KEYS.SETTINGS])) {
    updateBadgeState();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === NOTIFICATION_ID) {
    try {
      chrome.notifications.clear(NOTIFICATION_ID);
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 396,
        height: 640
      });
    } catch (err) {
      console.error('Notification click error:', err);
    }
  }
});
