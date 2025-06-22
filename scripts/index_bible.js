// scripts/index_bible.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';
import cliProgress from 'cli-progress';
import pRetry from 'p-retry';
import pLimit from 'p-limit';

// Setup path and environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

// Init Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Init embedding model
const extractor = await pipeline('feature-extraction', 'Xenova/distiluse-base-multilingual-cased-v1');

async function generateEmbedding(text) {
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  return Object.values(result.data); // Convert embedding object to array
}

async function insertBatch(batch) {
  const { error } = await supabase.from('bible_verses').upsert(batch, {
    onConflict: ['book', 'chapter', 'verse']
  });
  if (error) throw new Error(JSON.stringify(error, null, 2));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const filePath = path.join(PROJECT_ROOT, 'scripts', 'arabic_bible.json');
  const content = await fs.readFile(filePath, 'utf-8');
  const verses = JSON.parse(content);

  const BATCH_SIZE = 25;
  const CONCURRENCY = 4;
  const DELAY_BETWEEN_BATCHES_MS = 750; // 0.75s delay between batch inserts
  const limit = pLimit(CONCURRENCY);

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(verses.length, 0);

  let success = 0;
  let failed = [];

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const tasks = batch.map(verse =>
      limit(async () => {
        if (!verse.text || !verse.book || !verse.chapter || !verse.verse) return null;
        try {
          const embedding = await pRetry(() => generateEmbedding(verse.text), {
            retries: 3,
            onFailedAttempt: error => {
              console.warn(`Retrying embedding for ${verse.book} ${verse.chapter}:${verse.verse} - ${error.message}`);
            }
          });

          return {
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            embedding
          };
        } catch (err) {
          console.error(`❌ Embedding failed for ${verse.book} ${verse.chapter}:${verse.verse}:`, err.message);
          failed.push({ ...verse, reason: 'embedding error: ' + err.message });
          return null;
        }
      })
    );

    const records = (await Promise.all(tasks)).filter(Boolean);
    success += records.length;

    try {
      if (records.length > 0) {
        await pRetry(() => insertBatch(records), {
          retries: 2,
          onFailedAttempt: error => {
            console.warn(`Retrying insert batch - ${error.message}`);
          }
        });
        await delay(DELAY_BETWEEN_BATCHES_MS);
      }
    } catch (err) {
      console.error(`❌ Inserting batch failed:`, err.message);
      failed.push(...records.map(v => ({ ...v, reason: 'insert error: ' + err.message })));
    }

    progressBar.update(Math.min(i + BATCH_SIZE, verses.length));
  }

  progressBar.stop();

  console.log(`✅ Indexed ${success}/${verses.length} verses.`);
  if (failed.length) {
    await fs.writeFile(
      path.join(PROJECT_ROOT, 'scripts', 'failed_index.json'),
      JSON.stringify(failed, null, 2)
    );
    console.log(`⚠️ Failed ${failed.length} entries saved to failed_index.json`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});