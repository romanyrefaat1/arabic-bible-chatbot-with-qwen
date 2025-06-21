// This file contains type definitions for Web Workers

// Extend the global scope for web workers
declare const self: WorkerGlobalScope & {
  importScripts(...scripts: string[]): void;
};

// Type definitions for the MLCEngine
interface MLCEngine {
  chat: {
    completions: {
      create: (params: {
        messages: Array<{ role: string; content: string }>;
        max_tokens?: number;
        temperature?: number;
      }) => Promise<{
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      }>;
    };
  };
}

declare function CreateMLCEngine(
  model: string,
  options: {
    initProgressCallback?: (report: { progress: number }) => void;
    cacheLocalModel?: boolean;
    revision?: string;
  }
): Promise<MLCEngine>;

// Worker message types
type WorkerMessage =
  | { type: 'INIT' }
  | { type: 'GENERATE'; payload: { message: string; context: any[] } };

type WorkerResponse =
  | { type: 'PROGRESS'; progress: number }
  | { type: 'INIT_DONE' }
  | { type: 'RESPONSE'; response: string }
  | { type: 'ERROR'; error: string };

// Declare the worker context
declare const onmessage: (event: MessageEvent<WorkerMessage>) => void;
declare function postMessage(message: WorkerResponse): void;

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}
