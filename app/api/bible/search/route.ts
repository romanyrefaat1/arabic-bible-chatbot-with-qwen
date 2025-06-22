import { NextResponse } from 'next/server';
import { searchBibleVerses, getBibleVerse, getBibleChapter, getBibleBooks } from '@/lib/bible-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'search';

  try {
    switch (action) {
      case 'search': {
        const query = searchParams.get('q') || searchParams.get('query');
        const limit = parseInt(searchParams.get('limit')) || 10;
        const threshold = parseFloat(searchParams.get('threshold')) || 0.7;
        const book = searchParams.get('book');
        const chapter = searchParams.get('chapter') ? parseInt(searchParams.get('chapter')) : null;

        if (!query) {
          return NextResponse.json({
            success: false,
            error: 'Query parameter is required'
          }, { status: 400 });
        }

        const results = await searchBibleVerses(query, {
          limit,
          threshold,
          book,
          chapter
        });

        return NextResponse.json(results);
      }

      case 'verse': {
        const book = searchParams.get('book');
        const chapter = parseInt(searchParams.get('chapter') || '0');
        const verse = parseInt(searchParams.get('verse') || '0');

        if (!book || !chapter || !verse) {
          return NextResponse.json({
            success: false,
            error: 'Book, chapter, and verse parameters are required'
          }, { status: 400 });
        }

        const result = await getBibleVerse(book, chapter, verse);
        return NextResponse.json(result);
      }

      case 'chapter': {
        const book = searchParams.get('book');
        const chapter = parseInt(searchParams.get('chapter'));

        if (!book || !chapter) {
          return NextResponse.json({
            success: false,
            error: 'Book and chapter parameters are required'
          }, { status: 400 });
        }

        const result = await getBibleChapter(book, chapter);
        return NextResponse.json(result);
      }

      case 'books': {
        const result = await getBibleBooks();
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, options = {} } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    const results = await searchBibleVerses(query, options);
    return NextResponse.json(results);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}