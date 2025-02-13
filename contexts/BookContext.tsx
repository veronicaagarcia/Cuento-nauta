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
  addFavoriteBook: (book: Book) => Promise<void>
  removeFavoriteBook: (bookKey: string) => Promise<void>
  updateBookReadingStatus: (bookKey: string, status: ReadingStatus) => Promise<void>
  refreshFavoriteBooks: () => Promise<void>
  toggleFavorite: (book: Book) => Promise<void>
  isFavorite: (bookKey: string) => boolean
  error: string | null
  clearError: () => void
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
  const [error, setError] = useState<string | null>(null)

  // obtiene libros en favoritos
  const refreshFavoriteBooks = useCallback(async () => {
    try {
      const books = await getBookList("favoritos")
      setFavoriteBooks(books)
    } catch (error) {
      setError("Error al cargar los libros favoritos. Por favor, inténtalo de nuevo.")
    }
  }, [])

  // carga libros en favoritos al iniciar, y cada vez q se actualiza la lista
  useEffect(() => {
    refreshFavoriteBooks()
  }, [refreshFavoriteBooks])

  // agrega libro a favoritos
  const addFavoriteBook = async (book: Book) => {
    try {
      await saveBookToList(book as BookWithStatus, "favoritos")
      await refreshFavoriteBooks()
    } catch (error) {
      setError("Error al agregar el libro a favoritos. Por favor, inténtalo de nuevo.")
    }
  }

  // elimina libro de favoritos
  const removeFavoriteBook = async (bookKey: string) => {
    try {
      await removeBookFromList(bookKey, "favoritos")
      await refreshFavoriteBooks()
    } catch (error) {
      setError("Error al remover el libro de favoritos. Por favor, inténtalo de nuevo.")
    }
  }

  // actualiza el estado de lectura del libro
  const updateBookReadingStatus = async (bookKey: string, status: ReadingStatus) => {
    try {
      await updateBookStatus(bookKey, status)
      await refreshFavoriteBooks()
    } catch (error) {
      setError("Error al actualizar el estado de lectura. Por favor, inténtalo de nuevo.")
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
    return favoriteBooks.some((favBook) => favBook.key === bookKey)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    favoriteBooks,
    addFavoriteBook,
    removeFavoriteBook,
    updateBookReadingStatus,
    refreshFavoriteBooks,
    toggleFavorite,
    isFavorite,
    error,
    clearError,
  }

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>
}
