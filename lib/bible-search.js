// lib/bible-search.js

import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize embedding model (same as used for indexing)
let extractor = null;

async function getEmbeddingModel() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/distiluse-base-multilingual-cased-v1');
  }
  return extractor;
}

async function generateEmbedding(text) {
  const model = await getEmbeddingModel();
  const result = await model(text, { pooling: 'mean', normalize: true });
  return Object.values(result.data);
}

/**
 * Search for similar Bible verses using vector similarity
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {number} options.limit - Maximum number of results (default: 10)
 * @param {number} options.threshold - Similarity threshold 0-1 (default: 0.7)
 * @param {string} options.book - Filter by specific book
 * @param {number} options.chapter - Filter by specific chapter
 * @returns {Object} Search results
 */
export async function searchBibleVerses(query, options = {}) {
  try {
    const {
      limit = 10,
      threshold = 0.7,
      book = null,
      chapter = null
    } = options;

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Build the SQL query
    let sqlQuery = supabase
      .rpc('search_bible_verses', {
        query_embedding: queryEmbedding,
        similarity_threshold: threshold,
        match_count: limit
      });

    // Add filters if provided
    if (book) {
      sqlQuery = sqlQuery.eq('book', book);
    }
    if (chapter) {
      sqlQuery = sqlQuery.eq('chapter', chapter);
    }

    const { data, error } = await sqlQuery;

    if (error) {
      console.error('Supabase search error:', error);
      return {
        success: false,
        error: 'Search failed',
        results: []
      };
    }

    return {
      success: true,
      results: data || [],
      query,
      count: data?.length || 0
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

/**
 * Get a specific Bible verse
 */
export async function getBibleVerse(book, chapter, verse) {
  try {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Verse not found'
      };
    }

    return {
      success: true,
      result: data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all verses from a specific chapter
 */
export async function getBibleChapter(book, chapter) {
  try {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .order('verse');

    if (error) {
      return {
        success: false,
        error: 'Chapter not found'
      };
    }

    return {
      success: true,
      results: data || [],
      count: data?.length || 0
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get list of all Bible books
 */
export async function getBibleBooks() {
  try {
    const { data, error } = await supabase
      .from('bible_verses')
      .select('book')
      .order('book');

    if (error) {
      return {
        success: false,
        error: 'Failed to fetch books'
      };
    }

    // Get unique books
    const uniqueBooks = [...new Set(data.map(row => row.book))];

    return {
      success: true,
      results: uniqueBooks,
      count: uniqueBooks.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}