"use client"
import { useState, useCallback } from 'react';
import { useVerses, useParseVerses } from '../contexts/verses-contexts';

export type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  type: 'thinking' | 'response';
};

export type LoadingState =
  | 'idle'
  | 'searching_verses'
  | 'building_context'
  | 'thinking'
  | 'generating';

export function useChatRemoteWithVerses() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Verses context integration
  const { clearMessageVerses } = useVerses();
  const { parseVersesFromText } = useParseVerses();

  const parseSSEChunk = (chunk: string) => {
    const events: Array<{ event: string; data: any }> = [];
    const lines = chunk.split('\n');
    let currentEvent = '';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7);
      } else if (line.startsWith('data: ') && currentEvent) {
        currentData = line.slice(6);
        try {
          const parsedData = JSON.parse(currentData);
          events.push({ event: currentEvent, data: parsedData });
          currentEvent = '';
          currentData = '';
        } catch (e) {
          console.warn('Failed to parse SSE data:', currentData);
        }
      }
    }
    return events;
  };

  const sendMessage = useCallback(async (newMessage: string) => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingState('building_context');

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: newMessage,
      type: 'response'
    };
    setMessages((prev) => [...prev, userMessage]);

    const systemPrompt = `<system>
  <role>Orthodox Christian Priest</role>
  <language>Respond in Egyptian dialect Arabic only.</language>
  <tone>Contemplative, pastoral, and full of the love of Christ.</tone>

  <identity>
    If the user asks "Who are you?" or something similar, introduce yourself only as an Orthodox Christian priest, a servant of the Gospel. Never mention being an AI, model, or Qwen.
    Example response: "أنا أبُوكَ الروحي، خادم للرب يسوع المسيح، اب كاهن أرثوذكسي أحمل إليك رسالة المسيح والمحبة الابدية."
  </identity>

  <scope>
    You may only answer questions directly related to Orthodox Christian theology, based on:
    1. The verses provided in verseContext.
    2. Writings of the Orthodox Church Fathers (e.g. St. Athanasius, St. John Chrysostom, St. Cyril the Great).
    3. Comparisons with other Christian traditions or religions are allowed **only** if the superiority of Orthodox Christianity is clearly expressed.
       - If you cannot demonstrate the truth and spiritual superiority of Orthodox Christianity in comparison, reply:
         "هذا الموضوع يتطلب تمييزاً روحياً دقيقاً، أنصحك أن تسأل كاهناً حقيقياً في كنيستك للحصول على جواب حكيم."
  </scope>

  <format>
    • Begin only the first answer with a single greeting such as: "سلام لك يا ابني." or similar forms of greetings. Don't start with greetings if not relevant.
    • Do not repeat greetings in later answers.
    • Talk with the user as if you are a priest and they are your son or you teach them. Call them ابني or ابنتي based on their pronouns.
    • Responses must be in Christian simple language.
    • Only output your final answer/response, do not output any intermediate thoughts or plans except in the thinking.
    • Conclude with a prayer, pastoral encouragement, or a call to repentance.
    • When quoting verses, use this format: Reference: "Verse text"
  </format>

  <forbidden>
    • Do not present neutrality between religions.
    • Do not mention you are an AI, model, assistant, or anything technical.
    • Do not quote non-Orthodox or secular sources.
    • Do not type out the text of the previous conversation.
  </forbidden>

  <check>
    If a question is outside the scope of Orthodox Christian teaching, respond only:
    "عذراً، لا أستطيع أن أجيب على هذا السؤال لأنه خارج نطاق تعليمي ككاهن أرثوذكسي ومهمتي هي أن أشارك كلمة الله وتعاليم كنيسته المقدسة فقط."
  </check>
  
  <date>
    - Current Date: ${new Date().toLocaleDateString()}
    - Current Time: ${new Date().toLocaleTimeString()}
  </date>

  <examples>
    <ex>
      <q>ما معنى "طوبى لأنقياء القلب" بحسب تعليم الكنيسة؟</q>
      <a>
        سلام لك يا ابني.
        متى ٥:٨: "طوبى لأنقياء القلب لأنهم يعاينون الله" تعني أن القلب النقي الخالي من الشوائب يستطيع أن يعاين الله بنقاوته الداخلية... [شرح لاهوتي مختصر].
        أسأل الرب أن يمنحك نقاء القلب ويضيء حياتك بنوره.
      </a>
    </ex>
    <ex>
      <q>كيف يشرح القديس يوحنا الذهبي الفم سر التوبة؟</q>
      <a>
        التوبة بحسب الذهبي الفم هي ولادة جديدة في الروح وعودة إلى أحضان النعمة الإلهية كما يقول في مزمور ٥١:١٠: "قلباً نقياً اخلق في يا الله وروحاً مستقيماً جدد في داخلي"... [اقتباس أو شرح].
        فلنتُب جميعاً توبة حقيقية تنال بها نفوسنا الراحة.
      </a>
    </ex>
  </examples>
  <notes>
    - When making a plan, make it step by step with momentume from the first step to the last step. Make your expectations in the person very low. If no context provided that make this wrong, assume they are not close to Jesus and have very tiny knowledge.
    - You are the person who makes people get closer to Jesus and the bible. You make them have stronger faith.
    - End your responses with messages that spark interest about the user's question or about what you said in the last response. Make the questions start with: Do you want to know? Do you want me to?
    - Don't start with greetings if not relevant.
    - Always quote relevant Bible verses using the format: Reference: "Verse text"
  </notes>

  <finalCheck>Before each answer, double-check that you speak as a priest only, avoid any technical terms, and always affirm the Orthodox faith as the truth.</finalCheck>
</system>`;

    const context: [string, string][] = messages
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.type === 'response'))
      .reduce((acc: [string, string][], msg, i, arr) => {
        if (msg.role === 'user' && arr[i + 1]?.role === 'assistant') {
          acc.push([msg.content, arr[i + 1].content]);
        }
        return acc;
      }, []);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, sysPrompt: systemPrompt, context }),
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let thinkingMessageId: number | null = null;
      let responseMessageId: number | null = null;
      let receivedDone = false;
      let timeout: NodeJS.Timeout | null = null;
      let fullResponseContent = ''; // Track full response for verse parsing

      const clearFlags = () => {
        setIsLoading(false);
        setLoadingState('idle');
        if (timeout) clearTimeout(timeout);
      };

      timeout = setTimeout(() => {
        console.warn('⚠️ Timeout fallback triggered — stream stuck.');
        clearFlags();
      }, 30000);

      while (true) {
        const { done, value } = await reader.read();
        if (done && !buffer.trim()) {
          if (!receivedDone) console.warn("⚠️ Stream ended without 'done' event.");
          
          // Parse verses from complete response when done
          if (responseMessageId && fullResponseContent) {
            console.log('🔍 Parsing verses from response:', fullResponseContent.substring(0, 100) + '...');
            const foundVerses = parseVersesFromText(fullResponseContent, responseMessageId);
            if (foundVerses.length > 0) {
              console.log('✅ Found verses:', foundVerses.map(v => v.reference).join(', '));
            }
          }
          
          clearFlags();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const events = parseSSEChunk(part);
          for (const { event, data } of events) {
            switch (event) {
              case 'thinking':
                setLoadingState('thinking');
                if (!thinkingMessageId) {
                  thinkingMessageId = Date.now() + 1;
                  setMessages(prev => [...prev, {
                    id: thinkingMessageId,
                    role: 'assistant',
                    content: `🤔 ${data.chunk || ''}`,
                    type: 'thinking'
                  }]);
                } else {
                  setMessages(prev => prev.map(m =>
                    m.id === thinkingMessageId ? { ...m, content: m.content + (data.chunk || '') } : m
                  ));
                }
                break;
              case 'response':
                setLoadingState('generating');
                const chunk = data.chunk || '';
                fullResponseContent += chunk; // Accumulate full response
                
                if (!responseMessageId) {
                  responseMessageId = Date.now() + 2;
                  setMessages(prev => [...prev, {
                    id: responseMessageId,
                    role: 'assistant',
                    content: chunk,
                    type: 'response'
                  }]);
                } else {
                  setMessages(prev => prev.map(m =>
                    m.id === responseMessageId ? { ...m, content: m.content + chunk } : m
                  ));
                }
                break;
              case 'done':
                console.log('✅ Stream completed');
                
                // Final verse parsing when stream is complete
                if (responseMessageId && fullResponseContent) {
                  console.log('🔍 Final verse parsing for message:', responseMessageId);
                  const foundVerses = parseVersesFromText(fullResponseContent, responseMessageId);
                  if (foundVerses.length > 0) {
                    console.log('✅ Final verses found:', foundVerses.map(v => v.reference).join(', '));
                  }
                }
                
                receivedDone = true;
                clearFlags();
                break;
              case 'error':
                throw new Error(data.message || 'Stream error occurred');
            }
          }
        }
      }

    } catch (err: any) {
      console.error('❌ sendMessage error:', err);
      setError(err.message || 'حدث خطأ في المحادثة');
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في المعالجة. يرجى المحاولة مرة أخرى.',
        type: 'response'
      }]);
      setIsLoading(false);
      setLoadingState('idle');
    }
  }, [messages, parseVersesFromText]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoadingState('idle');
    clearMessageVerses(); // Clear verses when clearing chat
  }, [clearMessageVerses]);

  return {
    messages,
    sendMessage,
    clearChat,
    isProcessing: isLoading,
    loadingState,
    error,
  };
}