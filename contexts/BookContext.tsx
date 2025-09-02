"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  type Book,
  type BookWithStatus,
  getBookList,
  saveBookToList,
  removeBookFromList,
  updateBookStatus,
  type ReadingStatus,
} from "@/services/api"

interface BookContextType {
  favoriteBooks: BookWithStatus[]
  loading: boolean
  error: string | null
  addFavoriteBook: (book: Book) => Promise<void>
  removeFavoriteBook: (bookKey: string) => Promise<void>
  updateBookReadingStatus: (bookKey: string, status: ReadingStatus) => Promise<void>
  refreshFavoriteBooks: () => Promise<void>
  toggleFavorite: (book: Book) => Promise<void>
  isFavorite: (bookKey: string) => boolean
  getBookStatus: (bookKey: string) => ReadingStatus | undefined
  clearError: () => void
  retryLastAction: () => Promise<void>
}

const BookContext = createContext<BookContextType | undefined>(undefined)

export const useBookContext = () => {
  const context = useContext(BookContext)
  if (context === undefined) {
    throw new Error("useBookContext must be used within a BookProvider")
  }
  return context
}

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteBooks, setFavoriteBooks] = useState<BookWithStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFailedAction, setLastFailedAction] = useState<(() => Promise<void>) | null>(null)

  // Helper function to handle errors consistently
  const handleError = useCallback((error: unknown, defaultMessage: string, retryAction?: () => Promise<void>) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    setLastFailedAction(retryAction ? () => retryAction : null);
    console.error('BookContext error:', error);
  }, []);

  // obtiene libros en favoritos
  const refreshFavoriteBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const books = await getBookList("favoritos")
      setFavoriteBooks(books)
      setLastFailedAction(null);
    } catch (error) {
      handleError(error, "Error al cargar los libros favoritos. Por favor, inténtalo de nuevo.", refreshFavoriteBooks);
    } finally {
      setLoading(false);
    }
  }, [handleError])

  // carga libros en favoritos al iniciar, y cada vez q se actualiza la lista
  useEffect(() => {
    refreshFavoriteBooks()
  }, [refreshFavoriteBooks])

  // agrega libro a favoritos con validación y feedback optimista
  const addFavoriteBook = async (book: Book) => {
    if (!book || !book.key) {
      setError("Libro inválido. No se puede agregar a favoritos.");
      return;
    }

    // Optimistic update
    const bookWithStatus: BookWithStatus = { ...book, readingStatus: "Por leer" };
    setFavoriteBooks(prev => [...prev, bookWithStatus]);
    
    const action = async () => {
      await saveBookToList(bookWithStatus, "favoritos");
      await refreshFavoriteBooks();
    };

    try {
      await action();
      setLastFailedAction(null);
    } catch (error) {
      // Revert optimistic update
      setFavoriteBooks(prev => prev.filter(b => b.key !== book.key));
      handleError(error, "Error al agregar el libro a favoritos. Por favor, inténtalo de nuevo.", action);
    }
  }

  // elimina libro de favoritos con validación y feedback optimista
  const removeFavoriteBook = async (bookKey: string) => {
    if (!bookKey) {
      setError("ID de libro inválido. No se puede remover de favoritos.");
      return;
    }

    // Store the book for potential rollback
    const removedBook = favoriteBooks.find(book => book.key === bookKey);
    
    // Optimistic update
    setFavoriteBooks(prev => prev.filter(book => book.key !== bookKey));
    
    const action = async () => {
      await removeBookFromList(bookKey, "favoritos");
      await refreshFavoriteBooks();
    };

    try {
      await action();
      setLastFailedAction(null);
    } catch (error) {
      // Revert optimistic update
      if (removedBook) {
        setFavoriteBooks(prev => [...prev, removedBook]);
      }
      handleError(error, "Error al remover el libro de favoritos. Por favor, inténtalo de nuevo.", action);
    }
  }

  // actualiza el estado de lectura del libro con validación
  const updateBookReadingStatus = async (bookKey: string, status: ReadingStatus) => {
    if (!bookKey || !status) {
      setError("Datos inválidos para actualizar el estado de lectura.");
      return;
    }

    // Store the original status for potential rollback
    const originalBook = favoriteBooks.find(book => book.key === bookKey);
    const originalStatus = originalBook?.readingStatus;
    
    // Optimistic update
    setFavoriteBooks(prev => 
      prev.map(book => 
        book.key === bookKey ? { ...book, readingStatus: status } : book
      )
    );
    
    const action = async () => {
      await updateBookStatus(bookKey, status);
      await refreshFavoriteBooks();
    };

    try {
      await action();
      setLastFailedAction(null);
    } catch (error) {
      // Revert optimistic update
      if (originalStatus && originalBook) {
        setFavoriteBooks(prev => 
          prev.map(book => 
            book.key === bookKey ? { ...book, readingStatus: originalStatus } : book
          )
        );
      }
      handleError(error, "Error al actualizar el estado de lectura. Por favor, inténtalo de nuevo.", action);
    }
  }

  // logica mara agregar o quitar libro de favorito
  const toggleFavorite = async (book: Book) => {
    const isFav = favoriteBooks.some((favBook) => favBook.key === book.key)
    if (isFav) {
      await removeFavoriteBook(book.key)
    } else {
      await addFavoriteBook(book)
    }
  }

  // si es que esta en favoritos
  const isFavorite = (bookKey: string) => {
    if (!bookKey) return false;
    return favoriteBooks.some((favBook) => favBook.key === bookKey)
  }

  // obtener el estado de lectura de un libro
  const getBookStatus = (bookKey: string): ReadingStatus | undefined => {
    if (!bookKey) return undefined;
    const book = favoriteBooks.find((favBook) => favBook.key === bookKey);
    return book?.readingStatus;
  }

  const clearError = () => {
    setError(null);
    setLastFailedAction(null);
  }

  const retryLastAction = async () => {
    if (lastFailedAction) {
      setError(null);
      try {
        await lastFailedAction();
        setLastFailedAction(null);
      } catch (error) {
        handleError(error, "Error al reintentar la acción. Por favor, intenta de nuevo.");
      }
    }
  }

  const value = {
    favoriteBooks,
    loading,
    error,
    addFavoriteBook,
    removeFavoriteBook,
    updateBookReadingStatus,
    refreshFavoriteBooks,
    toggleFavorite,
    isFavorite,
    getBookStatus,
    clearError,
    retryLastAction,
  }

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>
}
