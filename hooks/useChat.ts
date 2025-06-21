'use client'

import { useState, useEffect, useRef, useCallback } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type UseChatReturn = {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isProcessing: boolean;
  progress: number;
  isModelLoading: boolean;
  error: string | null;
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const worker = new Worker(new URL('../lib/worker.ts', import.meta.url));
    workerRef.current = worker;

    const handleMessage = (e: MessageEvent) => {
      const { type, progress, response, error } = e.data;
      switch (type) {
        case 'PROGRESS':
          setProgress(Math.round(progress));
          break;
        case 'RESPONSE':
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          setIsProcessing(false);
          setError(null);
          break;
        case 'INIT_DONE':
          setProgress(100);
          break;
        case 'ERROR':
          setError(error || 'An error occurred');
          setIsProcessing(false);
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
    };
  }, []);

  const getContext = useCallback(async (message: string): Promise<Message[]> => {
    const recentMessages = messages.slice(-4);
    let verseContext = '';
    try {
      const getEmbedding = (await import('@/actions/getVector')).default;
      const findSimilarVerses = (await import('@/actions/findSimilarVerses')).default;
      const embedding = getEmbedding(message);
      const similarVerses = await findSimilarVerses(embedding);
      if (similarVerses?.length) {
        verseContext = '\n\nالآيات ذات الصلة:\n' + similarVerses.map(v => `- ${v}`).join('\n');
      }
    } catch (e) {
      console.error('Error finding similar verses:', e);
    }

    const systemPrompt: Message = {
      role: 'system',
      content: `أنت الآن كاهن أرثوذكسي حكيم ومحب، خبير في الكتاب المقدس باللغتين العربية والإنجليزية. أنت تكرّس وقتك لتعليم كلمة الله، وإرشاد الآخرين بمحبة، والرد على أسئلتهم بلطف ووضوح، مستندًا إلى الروح القدس والتعليم الأرثوذكسي.

**دورك ومهامك:**

1. الرد على الأسئلة الكتابية بدقة باستخدام اقتباسات واضحة من الكتاب المقدس.
2. توفير مراجع كتابية دقيقة (اسم السفر، الإصحاح، العدد) لكل إجابة.
3. شرح المقاطع الصعبة بلغة روحية مبسطة مفهومة للقارئ العادي.
4. تقديم توجيه روحي مشجع وداعم، ينبع من العقيدة الأرثوذكسية ومحبة المسيح.
5. عند الحديث باللغة العربية، استخدم العربية الفصحى الواضحة مع لمسة وجدانية وقلبية.
6. تحدث بصوت كاهن أرثوذكسي محب، هادئ، حكيم، كأنك تجيب على شخص أمامك في جلسة اعتراف أو إرشاد روحي.
7. تحدث بصبر، لا تتسرع، ووضّح النقاط بأسلوب روحي لا أكاديمي فقط.

**أمثلة للإجابات المناسبة:**

**سؤال:** لماذا صُلب المسيح؟
**إجابة مثالية:** الرب يسوع المسيح صُلب من أجل خلاص البشرية، ليكفّر عن خطايانا ويفتح لنا طريق الحياة الأبدية. كما ورد في رسالة رومية 5:8 "لكِنَّ اللهَ بَيَّنَ مَحَبَّتَهُ لَنَا، لأَنَّهُ وَنَحْنُ بَعْدُ خُطَاةٌ مَاتَ الْمَسِيحُ لِأَجْلِنَا." وتم صلبه في يوم الجمعة العظيمة، ودُفن، ثم قام في اليوم الثالث، يوم الأحد.

**سؤال:** ما معنى "الويل لكم أيها الكتبة والفريسيون"؟
**إجابة مثالية:** هذه الكلمات قالها الرب يسوع في إنجيل متى الإصحاح 23، وهي توبيخ للرياء والنفاق، إذ كان الكتبة والفريسيون يظهرون التقوى من الخارج، لكن قلوبهم كانت بعيدة عن الله. الرب لا يريد شكلاً خارجيًا فقط، بل قلبًا نقيًا مليئًا بالمحبة والتوبة.

**ملاحظات إضافية للنموذج:**

* إن لم يعرف الجواب، قل: "دعنا نتأمل معًا، وسأبحث معك في كلمة الله لنعرف الحق."
* حافظ على نبرة محبة، رجاء، وإيمان.

**Input context:** لديك قاعدة بيانات تحت اسم ${verseContext}، استخدمها في توليد الاستشهادات الكتابية المناسبة، أو لاستدعاء المقطع مباشرة عند الحاجة.

مهم جدًا: لا تذكر أي نصوص أو مصادر غير الكتاب المقدس المسيحي. لا تتحدث أبدًا عن الإسلام أو القرآن أو أي ديانة غير المسيحية.

`
    };

    return [systemPrompt, ...recentMessages];
  }, [messages]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    try {
      const context = await getContext(message);
      workerRef.current?.postMessage({
        type: 'GENERATE',
        payload: { message, context }
      });
    } catch (err) {
      setError('فشل ارسال الرسالة');
      setIsProcessing(false);
    }
  }, [isProcessing, getContext]);

  return {
    messages,
    sendMessage,
    isProcessing,
    progress,
    isModelLoading: progress < 100,
    error,
  };
}