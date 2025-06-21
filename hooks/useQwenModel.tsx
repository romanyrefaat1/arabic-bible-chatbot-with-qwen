import { useEffect, useState, useCallback } from "react";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

export default function useQwenModel(revision?: string) {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadModel = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize the engine with progress callback
      console.log("Will start installing model, creating MLC Engine...");
      const engine = await CreateMLCEngine("Qwen2-0.5B-Instruct-q0f16-MLC", {
        revision,
        cacheLocalModel: true, // ✅ Enable Cache API for offline
        initProgressCallback: ({ progress: pct }) => {
          // progress is a value between
          setProgress(Math.round(pct));
        },
      });
      console.log("Model Loaded:", engine);

      // Optionally, I can explicitly reload to force re-download if needed
      // await engine.reload(modelName, { modelId: modelName, revision, cacheLocalModel: true });

      setEngine(engine);
    } catch (err) {
      console.error("Failed to load WebLLM model:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [revision]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return {
    engine,
    loading,
    progress, // 0 to 100
    error,
    reload: loadModel, // expose reload function
  };
}
