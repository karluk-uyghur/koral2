import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

interface GenerateQaRequestBody {
  bookTitle?: string;
  text?: string;
  pdfBase64?: string;
  count?: number;
  language?: 'ug' | 'ar';
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '45mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/karluk-learning-assistant.zip', (_req, res) => {
    const publicZip = path.resolve(process.cwd(), 'public', 'karluk-learning-assistant.zip');
    const distZip = path.resolve(process.cwd(), 'dist', 'karluk-learning-assistant.zip');
    const targetZip = fs.existsSync(publicZip) ? publicZip : distZip;
    if (!fs.existsSync(targetZip)) {
      res.status(404).json({ error: 'ZIP ھۆججىتى تېپىلمىدى.' });
      return;
    }
    res.download(targetZip, 'karluk-learning-assistant.zip');
  });

  app.post('/api/generate-qa', async (req, res) => {
    try {
      const body = (req.body || {}) as GenerateQaRequestBody;
      const rawText = typeof body.text === 'string' ? body.text.trim() : '';
      const rawPdf = typeof body.pdfBase64 === 'string' ? body.pdfBase64.trim() : '';
      const requestedTitle = typeof body.bookTitle === 'string' ? body.bookTitle.trim() : '';
      const targetCount = Math.min(30, Math.max(5, Number(body.count) || 30));
      const targetLang: 'ug' | 'ar' = body.language === 'ar' ? 'ar' : 'ug';

      if (!rawText && !rawPdf) {
        res.status(400).json({
          error:
            targetLang === 'ar'
              ? 'يرجى إدخال نص الكتاب أو إرفاق ملف .pdf / .txt.'
              : 'كىتاب تېكىستى يېزىڭ ياكى .pdf / .txt ھۆججىتى يۈكلەڭ.',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            targetLang === 'ar'
              ? 'مفتاح GEMINI_API_KEY غير مضبوط في إعدادات الأسرار.'
              : 'GEMINI_API_KEY تەڭشەلمىگەن. AI Studio نىڭ Settings > Secrets قىسمىدا GEMINI_API_KEY نى تەكشۈرۈڭ.',
        });
        return;
      }

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (rawPdf) {
        const cleanBase64 = rawPdf.replace(/^data:application\/pdf;base64,/i, '');
        if (cleanBase64.length <= 24_000_000 || !rawText) {
          parts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          });
        }
      }

      const titleHint =
        requestedTitle || (targetLang === 'ar' ? 'محتوى الكتاب المرفق' : 'يۈكلەنگەن كىتاب مەزمۇنى');
      const userPrompt =
        targetLang === 'ar'
          ? [
              `عنوان الكتاب أو الدرس: «${titleHint}».`,
              `استخرج من هذا المصدر أهم ${targetCount} سؤالاً وجواباً علمياً مفصلاً باللغة العربية الفصحى.`,
              rawText ? `\nالنص المصدر:\n${rawText.slice(0, 80000)}` : '',
            ]
              .filter(Boolean)
              .join('\n')
          : [
              `كىتاب ياكى دەرسلىك نامى: «${titleHint}».`,
              `بېرىلگەن مەنبەدىن ئەڭ مۇھىم، ئەڭ تۈپكى ۋە ئۆگىنىشكە تېگىشلىك دەل ${targetCount} دانە تەپسىلىي سۇئال-جاۋابنى ئۇيغۇر تىلىدا چىقىرىپ بەر.`,
              rawText ? `\nمەنبە تېكىستى:\n${rawText.slice(0, 80000)}` : '',
            ]
              .filter(Boolean)
              .join('\n');

      parts.push({ text: userPrompt });

      const systemInstruction =
        targetLang === 'ar'
          ? 'أنت خبير أكاديمي متخصص في تحليل الكتب وتلخيص المناهج العلمية. حلل محتوى الكتاب أو PDF بعمق، وأعدّ أهم الأسئلة والأجوبة باللغة العربية الفصحى الدقيقة والواضحة فقط. يجب أن يكون كل سؤال مركزاً وعميقاً، وكل إجابة واضحة ومنطقية وشاملة.'
          : [
              'سەن پەن، مائارىپ ۋە ئىلمىي ئەسەرلەرنى يەكۈنلەش ساھەسىدىكى ئالىي مۇتەخەسسىس.',
              'بېرىلگەن كىتاب، PDF ياكى دەرسلىك مەزمۇنىنى چوڭقۇر تەھلىل قىلىپ، ئوقۇغۇچىلار ئۆگىنىشى كېرەك بولغان ئەڭ مۇھىم سۇئال-جاۋابلارنى پەقەت ئۇيغۇر تىلىدا (ئەرەب يېزىقى ئاساسىدىكى ھازىرقى زامان ئۇيغۇر يېزىقىدا) تەييارلا.',
              'ھەر بىر سۇئال چوڭقۇر ۋە ئېنىق بولسۇن، جاۋابى بولسا لوگىكىلىق، تەپسىلىي ۋە مۇكەممەل ئۇيغۇرچە جۈملىلەر بىلەن يېزىلسۇن.',
              'ئاتالغۇلار ئىلمىي، ھۆرمەتلىك ۋە مىللىي سالاھىيەتكە ئۇيغۇن بولسۇن («شەرقىي تۈركىستان» قاتارلىق ئەسلىي تارىخىي ئاتالغۇلارنى ئىشلەت).',
            ].join(' ');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bookTitle: {
                type: Type.STRING,
                description: targetLang === 'ar' ? 'عنوان الكتاب أو الدرس' : 'كىتاب ياكى دەرسلىكنىڭ ئۇيغۇرچە ئېنىق نامى',
              },
              items: {
                type: Type.ARRAY,
                description:
                  targetLang === 'ar'
                    ? `قائمة من ${targetCount} سؤالاً وجواباً`
                    : `${targetCount} دانە سۇئال-جاۋاب تىزىملىكى`,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    category: { type: Type.STRING },
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ['id', 'category', 'question', 'answer'],
                },
              },
            },
            required: ['bookTitle', 'items'],
          },
        },
      });

      const rawOutput = (response.text ?? '').trim();
      if (!rawOutput) {
        res.status(502).json({
          error:
            targetLang === 'ar'
              ? 'أرجع النموذج استجابة فارغة، يرجى المحاولة مرة أخرى.'
              : 'AI مودېلدىن بوش جاۋاب قايتتى. قايتا سىناپ بېقىڭ.',
        });
        return;
      }

      const parsed = JSON.parse(rawOutput) as {
        bookTitle?: string;
        items?: Array<{ id?: number; category?: string; question?: string; answer?: string }>;
      };

      const defaultCategory = targetLang === 'ar' ? 'معرفة أساسية' : 'ئاساسىي بىلىم';
      const validItems = Array.isArray(parsed.items)
        ? parsed.items
            .filter((item) => item && typeof item.question === 'string' && typeof item.answer === 'string' && item.question.trim() && item.answer.trim())
            .map((item, idx) => ({
              id: idx + 1,
              category: (item.category || '').trim() || defaultCategory,
              question: item.question!.trim(),
              answer: item.answer!.trim(),
            }))
        : [];

      if (validItems.length === 0) {
        res.status(502).json({
          error:
            targetLang === 'ar'
              ? 'تعذر استخراج أسئلة صالحة من رد الذكاء الاصطناعي.'
              : 'AI جاۋابىدىن ئىناۋەتلىك سۇئال-جاۋاب چىقىرىلمىدى.',
        });
        return;
      }

      res.json({
        bookTitle:
          requestedTitle ||
          (parsed.bookTitle || '').trim() ||
          (targetLang === 'ar' ? 'كتاب جديد' : 'يېڭى كىتاب'),
        language: targetLang,
        items: validItems,
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const statusCode = typeof errorObj?.status === 'number' && errorObj.status >= 400 && errorObj.status < 600
        ? errorObj.status
        : 500;
      const message = errorObj?.message || 'AI سۇئال-جاۋاب ياساشتا مۇلازىمېتىر خاتالىقى كۆرۈلدى.';
      console.error('[/api/generate-qa] error:', err);
      res.status(statusCode).json({ error: message });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karluk Studio server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
