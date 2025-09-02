import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/performance';
import { searchBooks } from '../services/api';
import type { Book } from '../services/api';

interface UseSearchResult {
  books: Book[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearSearch: () => void;
}

export const useSearch = (debounceDelay: number = 300): UseSearchResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBooks([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous search
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const results = await searchBooks(query, 20);
      
      // Check if this request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setBooks(results);
    } catch (err) {
      // Check if this request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al buscar libros';
      setError(errorMessage);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(performSearch, debounceDelay),
    [performSearch, debounceDelay]
  );

  const search = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    abortControllerRef.current?.abort();
    setBooks([]);
    setLoading(false);
    setError(null);
  }, []);

  return {
    books,
    loading,
    error,
    search,
    clearSearch,
  };
};