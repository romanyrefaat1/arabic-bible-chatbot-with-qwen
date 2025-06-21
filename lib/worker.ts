// // worker.ts
// import { CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
// import { MODEL_CONFIG, ERROR_MESSAGES } from '@/config/model';

// type WorkerMessage =
//   | { type: 'INIT' }
//   | { type: 'GENERATE'; payload: { message: string; context: any[] } };

// type WorkerResponse =
//   | { type: 'PROGRESS'; progress: number }
//   | { type: 'INIT_DONE' }
//   | { type: 'RESPONSE'; response: string }
//   | { type: 'ERROR'; error: string };

// declare const self: WorkerGlobalScope & {
//   engine?: any;
//   postMessage(message: WorkerResponse): void;
// };

// const postMessage = (message: WorkerResponse) => {
//   self.postMessage(message);
// };

// self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
//   const { type } = e.data;
//   const payload = 'payload' in e.data ? e.data.payload : undefined;

//   try {
//     switch (type) {
//       case 'INIT':
//         await initializeModel();
//         break;
//       case 'GENERATE':
//         if (!payload) throw new Error('No payload provided for GENERATE');
//         await generateResponse(payload);
//         break;
//       default:
//         throw new Error(`Unknown message type: ${type}`);
//     }
//   } catch (error) {
//     postMessage({
//       type: 'ERROR',
//       error: error instanceof Error ? error.message : 'Unknown error occurred',
//     });
//   }
// };

// self.onerror = (error) => {
//   postMessage({ type: 'ERROR', error: 'Uncaught error in worker' });
//   return true;
// };

// async function initializeModel() {
//   try {
//     const engine = await CreateMLCEngine(MODEL_CONFIG.MODEL_NAME, {
//       initProgressCallback: (report) => {
//         postMessage({ type: 'PROGRESS', progress: Math.floor(report.progress * 100) });
//       },
//       appConfig: {
//         ...prebuiltAppConfig,
//         useIndexedDBCache: true,
//       },
//     });

//     self.engine = engine;
//     postMessage({ type: 'INIT_DONE' });
//   } catch (error) {
//     throw new Error(
//       ERROR_MESSAGES.MODEL_NOT_INITIALIZED +
//       '\n' +
//       (error instanceof Error ? error.message : 'Unknown error')
//     );
//   }
// }

// async function generateResponse(payload: { message: string; context: any[] }) {
//   const { message, context = [] } = payload;
//   const engine = self.engine;
//   if (!engine) throw new Error(ERROR_MESSAGES.MODEL_NOT_INITIALIZED);

//   const systemMessage = context.find(m => m.role === 'system');
//   const conversationHistory = context.filter(m => m.role !== 'system');
//   const chatMessages = [
//     ...(systemMessage ? [systemMessage] : []),
//     ...conversationHistory,
//     { role: 'user', content: message },
//   ];

//   try {
//     const response = await engine.chat.completions.create({
//       messages: chatMessages,
//       max_tokens: MODEL_CONFIG.MAX_TOKENS,
//       temperature: MODEL_CONFIG.TEMPERATURE,
//     });

//     if (!response.choices?.[0]?.message?.content) {
//       throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
//     }

//     postMessage({ type: 'RESPONSE', response: response.choices[0].message.content });
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
//     throw new Error(errorMessage);
//   }
// }

// export {};
