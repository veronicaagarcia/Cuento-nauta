// Componente principal para la busqueda y visualizacion de libros

"use client" 

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import SearchBar from "./SearchBar"
import BookItem from "./BookItem"
import FreeBookCarousel from "./FreeBookCarousel"
import { searchBooks, getBookDetails, searchBooksReadOnLine, type Book } from "../services/api"
import { useThemeColor } from "@/hooks/useThemeColor"
import BookDetail from "@/components/BookDetail"
import { useBookContext } from "@/contexts/BookContext"
import { ThemedButton } from "./ThemedButton"

type HomeSearchBookProps = {
  initialBook?: Book | null
}

const HomeSearchBook: React.FC<HomeSearchBookProps> = ({ initialBook }) => {
  const [query, setQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook || null)
  const [error, setError] = useState<string | null>(null)

  const backgroundColor = useThemeColor({}, "background")
  const textColor = useThemeColor({}, "text")
  const button = useThemeColor({}, "button")

  const { addFavoriteBook, removeFavoriteBook } = useBookContext()

  useEffect(() => {
    if (initialBook) {
      setSelectedBook(initialBook)
    }
  }, [initialBook])

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const [regularBooks, onlineBooks] = await Promise.all([searchBooks(query), searchBooksReadOnLine()])

      // Combinar y eliminar duplicados basados en la clave del libro
      const combinedBooks = [...regularBooks, ...onlineBooks]
      const uniqueBooks = Array.from(new Map(combinedBooks.map((book) => [book.key, book])).values())

      setBooks(uniqueBooks)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("Error al buscar libros. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleSelectBook = useCallback(async (book: Book) => {
    setLoading(true)
    try {
      const fullBookDetails = await getBookDetails(book.key)
      setSelectedBook(fullBookDetails)
    } catch (error) {
      console.error("Error fetching book details:", error)
      setError("Error al obtener detalles del libro. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedBook(null)
  }, [])


  const handleAddToFavorites = useCallback(
    async (book: Book) => {
      try {
        await addFavoriteBook(book)
      } catch (error) {
        console.error("Error al agregar a favoritos:", error)
        setError("Error al agregar el libro a favoritos. Por favor, inténtalo de nuevo.")
      }
    },
    [addFavoriteBook],
  )

  const handleRemoveFromFavorites = useCallback(
    async (bookKey: string) => {
      try {
        await removeFavoriteBook(bookKey)
      } catch (error) {
        console.error("Error al remover de favoritos:", error)
        setError("Error al remover el libro de favoritos. Por favor, inténtalo de nuevo.")
      }
    },
    [removeFavoriteBook],
  )

  const renderBookItem = useCallback(
    ({ item }: { item: Book }) => (
      <BookItem
        key={item.key}
        title={item.title}
        author={item.author_name?.join(", ")}
        coverUrl={item.cover_i}
        bookKey={item.key}
        firstPublishYear={item.first_publish_year}
        editionCount={item.edition_count}
        description={item.description}
        onPress={() => handleSelectBook(item)}
        style={styles.bookItem}
      />
    ),
    [handleSelectBook],
  )

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {!selectedBook && (
        <>
          <FreeBookCarousel onSelectBook={handleSelectBook} />
          <SearchBar value={query} onChangeText={setQuery} onSearch={handleSearch} />
        </>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <ThemedButton title="Cerrar" onPress={() => setError(null)} />
        </View>
      )}

      {selectedBook ? (
        <BookDetail
          book={selectedBook}
          onBack={handleBackToList}
          onSelectBook={handleSelectBook}
          onAddToFavorites={handleAddToFavorites}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      ) : loading ? (
        <ActivityIndicator size="large" color={button} accessibilityLabel="Cargando libros" />
      ) : (
        <FlatList
          contentContainerStyle={styles.bookList}
          data={books}
          keyExtractor={(item) => item.key}
          renderItem={renderBookItem}
          ListEmptyComponent={
            <ThemedText type="subtitle" darkColor={textColor} lightColor={textColor} style={styles.emptyText}>
              {hasSearched ? "No se encontraron libros." : "Realiza una búsqueda."}
            </ThemedText>
          }
          accessibilityLabel="Lista de libros"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
  },
  bookList: {
    display: "flex",
    marginTop: 8,
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap:8
  },
  bookItem: {
    flexDirection: "column",
    marginBottom: 8,
    minHeight: 400,
    maxHeight: 400,
    minWidth: 260,
    maxWidth: 260,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
})

export default HomeSearchBook