import * as webllm from "@mlc-ai/web-llm";

export async function getAIResponse(
  model: webllm.MLCEngine,
  message: string,
  similarVerses: any[],
  chatMessages: any[]
) {
  try {
    // Prepare system prompt
    const similarText = similarVerses
      .map((v) => `(${v.book} ${v.chapter}:${v.verse}) ${v.text}`)
      .join("\n");

    const systemPrompt = `
    أنت خبير في المسيحية. تحدث باللهجة المصرية.أنت مساعد مسيحي يستند إلى الكتاب المقدس الأرثوذكسي. إليك آيات من الكتاب المقدس التي قد تساعد في الرد على سؤال المستخدم:\n\n${similarText}`;

    // Prepare messages in the correct format
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatMessages,
      { role: "user", content: message },
    ];

    // Use the correct WebLLM API
    const reply = await model.chat.completions.create({
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("reply,", reply);

    return reply.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    throw error;
  }
}
