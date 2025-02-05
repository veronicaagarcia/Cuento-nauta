import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
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

  const refreshFavoriteBooks = async () => {
    const books = await getBookList("favoritos")
    setFavoriteBooks(books)
  }

  useEffect(() => {
    refreshFavoriteBooks()
  }, [refreshFavoriteBooks]) // Added refreshFavoriteBooks to the dependency array

  const addFavoriteBook = async (book: Book) => {
    await saveBookToList(book as BookWithStatus, "favoritos")
    await refreshFavoriteBooks()
  }

  const removeFavoriteBook = async (bookKey: string) => {
    await removeBookFromList(bookKey, "favoritos")
    await refreshFavoriteBooks()
  }

  const updateBookReadingStatus = async (bookKey: string, status: ReadingStatus) => {
    await updateBookStatus(bookKey, status)
    await refreshFavoriteBooks()
  }

  const value = {
    favoriteBooks,
    addFavoriteBook,
    removeFavoriteBook,
    updateBookReadingStatus,
    refreshFavoriteBooks,
  }

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>
}

