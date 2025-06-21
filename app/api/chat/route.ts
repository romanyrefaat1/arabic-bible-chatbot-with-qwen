// api/chat.ts — updated to emit 'done' manually if not sent by job

import { NextRequest } from 'next/server';
import { Client } from "@gradio/client";

// A type definition for the expected structure of the assistant's message
type AssistantContent = {
  type: 'text' | 'tool';
  content: string;
};

let cachedClient: Client | null = null;
async function getQwenClient() {
  try {
    console.log('Connecting to Qwen/Qwen3-Demo client...');
    cachedClient = await Client.connect("Qwen/Qwen3-Demo") as Client;
    console.log('Client connected.');
    return cachedClient;
  } catch (error) {
    console.error('Client connection error:', error);
    throw new Error('Failed to connect to AI service');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sysPrompt, context } = await request.json();
    if (!message) return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });

    const client = await getQwenClient();

    const conversationHistory = context && context.length > 0 
      ? "\n\nالمحادثة السابقة:\n" + context.map(([u, a]) => `سائل: ${u}\nكاهن: ${a}`).join("\n")
      : "";
    const fullSystemPrompt = sysPrompt + conversationHistory;

    const stream = new ReadableStream({
      async start(controller) {
        let lastResponseText = "";
        let lastThinkingText = "";
        let receivedFinalStatus = false;

        const pushData = (event: string, data: any) => {
          controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        try {
          const job = client.submit("/add_message", {
            input_value: `USER MESSAGE: ${message}\nFOLLOW THESE RULES: ${fullSystemPrompt}`,
            settings_form_value: {
              model: "qwen3-235b-a22b",
              sys_prompt: fullSystemPrompt,
              thinking_budget: 38,
            },
          });

          for await (const event of job) {
            if (event.type === "data") {
              const data = event.data;
              const uiPayload = data.find((entry: any) => Array.isArray(entry?.value) && entry.value.length >= 2);
              if (!uiPayload) continue;

              const assistantMsg = uiPayload.value[1];
              if (!assistantMsg?.content || !Array.isArray(assistantMsg.content)) continue;

              const thinkingPart = assistantMsg.content.find((c: any) => c.type === 'tool');
              if (thinkingPart?.content && thinkingPart.content !== lastThinkingText) {
                const chunk = thinkingPart.content.slice(lastThinkingText.length);
                lastThinkingText = thinkingPart.content;
                pushData('thinking', { chunk });
              }

              const responsePart = assistantMsg.content.find((c: any) => c.type === 'text');
              if (responsePart?.content && responsePart.content !== lastResponseText) {
                const chunk = responsePart.content.slice(lastResponseText.length);
                lastResponseText = responsePart.content;
                pushData('response', { chunk });
              }

            } else if (event.type === "status") {
              const status = event;
              console.log(`Job status: ${status.status} at stage ${status.stage}`);
              if (status.status === "completed") {
                pushData('done', { message: 'Stream finished' });
                receivedFinalStatus = true;
                controller.close();
                break;
              } else if (status.status === "error") {
                pushData('error', { message: status.message || 'An error occurred' });
                controller.error(new Error(status.message));
                break;
              }
            }
          }

          if (!receivedFinalStatus) {
            console.warn("⚠️ No final status received. Forcing done event.");
            pushData('done', { message: 'Forced done' });
            controller.close();
          }

        } catch (err: any) {
          console.error('❌ Job processing error:', err);
          pushData('error', { message: 'Failed to process AI job.', details: err.message });
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err: any) {
    console.error('❌ Top-level API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
