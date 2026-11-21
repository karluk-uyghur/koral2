# تېخنىكىلىق لايىھە ۋە قۇرۇلما ئۆلچىمى (SPEC)
## قارلۇق ئۆگىنىش ياردەمچىسى — Chrome Manifest V3

**ھۆججەت تۈرى:** Enterprise Technical Specification  
**ئۆلچەم:** Chrome Extension Manifest V3  
**ساقلاش ئۇسۇلى:** `chrome.storage.local` (يەرلىك، تاشقى تور ئالاقىسىسىز)

---

## 1. سىستېما قۇرۇلمىسى (Architecture)

```text
karluk-learning-assistant/
├── manifest.json          # MV3 ئاساسىي سەپلىمە، قاتتىق CSP، ئەڭ تۆۋەن ئىجازەتلەر
├── popup.html             # 376px RTL سۈزۈك ئەينەك كۆرۈنمە يۈزى ۋە قىستۇرما CSS
├── popup.js               # ساپ JavaScript مەنتىقىسى، JSON دەلىللەش، ساقلاش، ئۆگىنىش كارتىسى
├── background.js          # تور كۆرگۈچ ئېچىلغاندا (onStartup) ئەسكەرتىش چىقىرىش مۇلازىمەتچىسى
└── icons/
    ├── icon16.png         # قورال بالدىقى كىچىك سىنبەلگە
    ├── icon48.png         # قىستۇرمىلار بېتى سىنبەلگە
    └── icon128.png        # ئۇقتۇرۇش ۋە ئاساسىي سىنبەلگە
```

---

## 2. بىخەتەرلىك ۋە CSP قۇرۇلمىسى (Security Specification)

### 2.1 ئەڭ تۆۋەن ئىجازەت پىرىنسىپى (Least Privilege)
- `permissions`: پەقەت `["storage", "notifications"]` تەلەپ قىلىنىدۇ.
- `host_permissions`: **قۇرۇق (يوق)**. `<all_urls>` ياكى باشقا تور بېكەتلەرگە كىرىش ھوقۇقى قەتئىي ئېلىنمايدۇ.

### 2.2 قاتتىق مەزمۇن بىخەتەرلىك سىياسىتى (Strict CSP)
```json
"content_security_policy": {
  "extension_pages": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
}
```
- ھېچقانداق `eval()`, `new Function()`, سىرتقى CDN ياكى `inline <script>` ئىشلىتىلمەيدۇ.
- بارلىق ئىشلەتكۈچى كىرگۈزگەن ياكى JSON دىن ئوقۇلغان تېكىستلەر DOM غا پەقەت `textContent` ئارقىلىق يېزىلىدۇ (`innerHTML` چەكلىنىدۇ).

---

## 3. سانلىق مەلۇمات قۇرۇلمىسى (Data & Storage Schema)

### 3.1 `chrome.storage.local` ئاچقۇچلىرى
| ئاچقۇچ نامى | تىپى | چۈشەندۈرۈشى |
| :--- | :--- | :--- |
| `karluk_books` | `BookRecord[]` | يۈكلەنگەن بارلىق كىتابلار تىزىملىكى (ھەر بىرى ئايرىم ساقلىنىدۇ) |
| `karluk_active_book_id` | `string` | نۆۋەتتە تاللانغان كىتاب ID سى |
| `karluk_settings` | `Settings` | ئەسكەرتىش ھالىتى، كۆرۈنۈش ھالىتى (يورۇق/قاراڭغۇ) |

### 3.2 كىتاب JSON فورماتى (AI چىقىرىش ۋە يۈكلەش ئۆلچىمى)
```json
{
  "bookTitle": "كىتاب ياكى دەرسلىكنىڭ ئىسمى",
  "language": "ug",
  "items": [
    {
      "id": 1,
      "category": "تېما ياكى باب نامى",
      "question": "تەپسىلىي ۋە مۇھىم سۇئال",
      "answer": "ئېنىق، ئىلمىي ۋە تەپسىلىي جاۋاب"
    }
  ]
}
```

### 3.3 ئىچكى ساقلاش ئوبىيېكتى (`BookRecord`)
- `id`: ئۆزگىچە كىتاب كىملىكى (`book_<timestamp>_<rand>`)
- `title`: كىتاب ئىسمى
- `createdAt`: يۈكلەنگەن ۋاقىت (ISO string)
- `currentIndex`: نۆۋەتتە ئوقۇلۇۋاتقان سۇئال نومۇرى
- `masteredIds`: ئۆگىنىپ بولغان سۇئال ID تىزىملىكى (`string[] | number[]`)
- `items`: سۇئال-جاۋابلار تىزمىسى (ھەر بىرىدە `id`, `category`, `question`, `answer`)

---

## 4. تور كۆرگۈچ ئېچىلغاندا ئەسكەرتىش مېخانىزمى (`onStartup`)

1. `background.js` دا `chrome.runtime.onStartup` ھادىسىسى تىڭشىلىدۇ.
2. ساقلىغۇچتىن `karluk_settings.reminderEnabled` تەكشۈرۈلىدۇ.
3. ئەگەر `true` بولسا ۋە كىتاب بار بولسا:
   - نۆۋەتتىكى تاللانغان كىتابتىن تېخى ئۆگىنىلمىگەن (ياكى رەت بويىچە كېيىنكى) بىر سۇئال تاللىنىدۇ.
   - `chrome.notifications.create` ئارقىلىق ئىشلەتكۈچىگە ئەسكەرتىش كۆرسىتىلىدۇ.
   - قىستۇرما سىنبەلگىسى ئۈستىگە قىزغۇچ ئاپېلسىن رەڭلىك سان بەلگىسى (`Badge`) قويۇلىدۇ.
4. ئىشلەتكۈچى ئۇقتۇرۇشنى باسقاندا `popup.html` ئېچىلىدۇ.
5. تەڭشەك ستونىدىكى ۋىكليۇچاتېل ئارقىلىق `reminderEnabled = false` قىلىنسا، ئۇقتۇرۇش ۋە Badge دەرھال توختىتىلىدۇ.

---

## 5. JSON دەلىللەش ۋە خاتالىق بىر تەرەپ قىلىش

- بارلىق JSON ئانالىزى `parseBookJson()` فۇنكسىيەسى ئارقىلىق `try/catch` ئىچىدە ئېلىپ بېرىلىدۇ.
- ئەگەر AI مودېلى جاۋابنى Markdown ```json ... ``` ئىچىگە ئوراپ بەرگەن بولسا، ئاپتوماتىك پاكىزلاپ JSON قىسمى ئايرىلىدۇ.
- `items` ياكى `questions` قاتارلىق ئاساسىي تىزمىلار تەكشۈرۈلىدۇ، بوش ياكى خاتا سۇئاللار سۈزۈپ تاشلىنىدۇ.
- يېڭى كىتاب قوشقاندا مەۋجۇت كىتابلارغا تەسىر يەتمەيدۇ (ئايرىم ID بىلەن قوشۇلىدۇ).
