"use client" 

import type React from "react"
import { useState, useEffect } from "react"
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import SearchBar from "./SearchBar"
import BookItem from "./BookItem"
import FreeBookCarousel from "./FreeBookCarousel"
import { searchBooks, getBookDetails, type Book } from "../services/api"
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
  const tint = useThemeColor({}, "tint")

  const { addFavoriteBook, removeFavoriteBook } = useBookContext()

  useEffect(() => {
    if (initialBook) {
      setSelectedBook(initialBook)
    }
  }, [initialBook])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    try {
      const results = await searchBooks(query)
      setBooks(results)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectBook = async (book: Book) => {
    setLoading(true)
    try {
      const fullBookDetails = await getBookDetails(book.key)
      setSelectedBook(fullBookDetails)
    } catch (error) {
      console.error("Error fetching book details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setSelectedBook(null)
  }

  const handleAddToFavorites = async (book: Book) => {
    try {
      await addFavoriteBook(book)
      // Puedes agregar aquí alguna notificación o feedback para el usuario
    } catch (error) {
      console.error("Error al agregar a favoritos:", error)
      setError("Error al agregar el libro a favoritos. Por favor, inténtalo de nuevo.")
    }
  }

  const handleRemoveFromFavorites = async (bookKey: string) => {
    try {
      await removeFavoriteBook(bookKey)
      // Puedes agregar aquí alguna notificación o feedback para el usuario
    } catch (error) {
      console.error("Error al remover de favoritos:", error)
      setError("Error al remover el libro de favoritos. Por favor, inténtalo de nuevo.")
    }
  }

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
        <ActivityIndicator size="large" color={tint} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
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
            />)}
          ListEmptyComponent={
            <ThemedText type="subtitle" darkColor={textColor} lightColor={textColor} style={styles.emptyText}>
              {hasSearched ? "No se encontraron libros." : "Realiza una búsqueda."}
            </ThemedText>
          }
        />)}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 800,
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
  loadingIndicator: {
    marginVertical: 20,
  },
  loadMoreButton: {
    marginVertical: 20,
    alignSelf: "center",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
})

export default HomeSearchBook