import { GoogleGenAI } from "@google/genai";
import { Platform, Tone } from '../types';

const buildPrompt = (topic: string, platforms: Platform[], tone: Tone, audience: string, cta: string): string => {
    let platformInstructions = '';
    if (platforms.includes(Platform.BLOG)) {
        platformInstructions += `\n- **لمقالة المدونة:** يجب أن يكون الناتج منظمًا بشكل صارم كالتالي:
        1.  **عنوان رئيسي:** [اكتب العنوان الجذاب هنا]
        2.  **نبذة:** [اكتب نبذة مختصرة وجذابة لا تزيد عن 100 حرف]
        3.  **5 كلمات مفتاحية:** [اكتب 5 كلمات مفتاحية أساسية هنا]
        4.  **المحتوى:** [اكتب المقال الكامل هنا مع استخدام العناوين الفرعية H2, H3]`;
    }

    const ctaInstruction = cta.trim() ? `- **دعوة للعمل (CTA):** "${cta.trim()}" (قم بدمجها بشكل طبيعي في نهاية المحتوى المناسب).` : '';

    return `
    بصفتك خبيرًا في كتابة المحتوى ومتخصصًا في تحسين محركات البحث (SEO) مقيمًا في مصر، مهمتك هي إنشاء محتوى جذاب ومحسن بالكامل لكل منصة من المنصات المطلوبة.

    **المهمة:**
    - كتابة محتوى أصلي باللغة العربية لكل منصة مستهدفة.
    - يجب أن يكون المحتوى متوافقًا تمامًا مع خوارزميات Google SEO وأيضًا خوارزميات منصة Meta (Facebook و Instagram).
    - استهداف الجمهور المصري بلهجة وأسلوب يفهمونه ويتفاعلون معه.
    - استخدام الكلمات الرئيسية طويلة الذيل (Long-tail keywords) بشكل طبيعي ضمن النص.
    - **لمحتوى فيسبوك وانستغرام:** قم بإضافة هاشتاجات (#) ذات صلة وشائعة و**رائجة حاليًا في مصر** ومناسبة للموضوع.
    - **يرجى الفصل بين محتوى كل منصة بعنوان واضح ومميز (مثال: --- محتوى فيسبوك ---).**

    **تعليمات خاصة:**
    ${platformInstructions}

    **تفاصيل الطلب:**
    - **الموضوع الرئيسي:** "${topic}"
    - **المنصات المستهدفة:** "${platforms.join(', ')}"
    - **نبرة المحتوى:** "${tone}"
    - **الجمهور المستهدف:** "${audience}"
    ${ctaInstruction}

    **المطلوب:**
    الرجاء كتابة المحتوى الآن بناءً على التفاصيل والتعليمات المذكورة أعلاه. تأكد من أن الناتج النهائي جاهز للنشر مباشرةً ومنظم بشكل واضح لكل منصة.
  `;
};

export const generateContent = async (
  topic: string,
  platforms: Platform[],
  tone: Tone,
  audience: string,
  cta: string
): Promise<string> => {
  if (!topic.trim()) {
    throw new Error("الموضوع الرئيسي لا يمكن أن يكون فارغًا.");
  }
  if (platforms.length === 0) {
    throw new Error("الرجاء اختيار منصة واحدة على الأقل.");
  }
  
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
      throw new Error("لم يتم العثور على مفتاح API. يرجى التأكد من إعداده بشكل صحيح.");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const prompt = buildPrompt(topic, platforms, tone, audience, cta);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`حدث خطأ أثناء إنشاء المحتوى: ${error.message}`);
    }
    throw new Error("حدث خطأ غير متوقع أثناء إنشاء المحتوى.");
  }
};