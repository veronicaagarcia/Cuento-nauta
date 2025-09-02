import { useState, useEffect, useCallback } from 'react';
import { searchBooksReadOnLine, type Book } from '../services/api';
import { apiCache } from '../utils/performance';

interface UseFeaturedBooksResult {
  books: Book[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const FEATURED_BOOKS_CACHE_KEY = 'featured_books_main';
const FEATURED_BOOKS_COUNT = 12;

export const useFeaturedBooks = (): UseFeaturedBooksResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedBooks = apiCache.get(FEATURED_BOOKS_CACHE_KEY);
      if (cachedBooks && Array.isArray(cachedBooks)) {
        setBooks(cachedBooks);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const allBooks = await searchBooksReadOnLine();
      
      // Filter books with good covers and descriptions
      const qualityBooks = allBooks.filter(book => 
        book.cover_i && // Has cover image
        book.title && // Has title
        book.author_name && book.author_name.length > 0 && // Has author
        book.description && book.description.length > 50 // Has substantial description
      );

      // Shuffle and take the first N books for variety
      const shuffled = qualityBooks
        .sort(() => 0.5 - Math.random())
        .slice(0, FEATURED_BOOKS_COUNT);

      // Cache the result
      apiCache.set(FEATURED_BOOKS_CACHE_KEY, shuffled);
      setBooks(shuffled);
      
    } catch (err) {
      console.error('Error loading featured books:', err);
      setError('No se pudieron cargar los libros destacados. Verifica tu conexión.');
      
      // Try to show cached books even on error
      const cachedBooks = apiCache.get(FEATURED_BOOKS_CACHE_KEY);
      if (cachedBooks && Array.isArray(cachedBooks)) {
        setBooks(cachedBooks);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    // Clear cache and reload
    apiCache.clear();
    await loadFeaturedBooks();
  }, [loadFeaturedBooks]);

  useEffect(() => {
    loadFeaturedBooks();
  }, [loadFeaturedBooks]);

  return {
    books,
    loading,
    error,
    refresh,
  };
};

// Hook for getting a single random featured book (for hero section)
export const useHeroBook = () => {
  const [heroBook, setHeroBook] = useState<Book | null>(null);
  const { books, loading } = useFeaturedBooks();

  useEffect(() => {
    if (books.length > 0 && !loading) {
      // Pick a random book from featured books
      const randomIndex = Math.floor(Math.random() * books.length);
      setHeroBook(books[randomIndex]);
    }
  }, [books, loading]);

  return heroBook;
};