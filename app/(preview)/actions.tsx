"use server";

import { createAI, createStreamableValue, getMutableAIState } from "ai/rsc";
import { CoreMessage, generateId } from "ai";
import { TextStreamMessage } from "@/components/message";
import getEmbedding from "@/lib/send-message/getVector";
import findSimilarVerses from "@/lib/send-message/findSimilarVerses";
// Updated sendMessage to work with client-side AI processing
export const sendMessage = async (message: string, aiResponse?: string) => {
  const messages = getMutableAIState("messages");
  const chatMessages = messages.get() || ([] as CoreMessage[]);

  // Add user message to the state
  messages.update([...chatMessages, { role: "user", content: message }]);

  const contentStream = createStreamableValue("");
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  if (aiResponse) {
    // If AI response is provided (from client), just stream it
    contentStream.update(aiResponse);
    contentStream.done();
    messages.done([
      ...messages.get(),
      { role: "assistant", content: aiResponse },
    ]);
  } else {
    // If no AI response, return empty stream (this shouldn't happen in normal flow)
    contentStream.update("Processing...");
    contentStream.done();
  }

  return textComponent;
};

// Server action to get embedding and similar verses
export const getContextualData = async (message: string) => {
  const embedding = await getEmbedding(message);
  const similarVerses = await findSimilarVerses(embedding);
  return { embedding, similarVerses };
};

type UIState = any; // Define your UI state type
type AnimationState = any; // Define your animation state type

export const AI = createAI<AnimationState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
    getContextualData,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";
    if (done) {
      // Optional: save state to DB here
    }
  },
});
