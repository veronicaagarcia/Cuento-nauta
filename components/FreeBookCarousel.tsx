import type React from "react"
import { useEffect, useState, useRef } from "react"
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { searchBooksReadOnLine, type Book } from "@/services/api"
import { useThemeColor } from "@/hooks/useThemeColor"
import BookItem from "./BookItem"
import { IconSymbol } from "@/components/ui/IconSymbol"

type FreeBookCarouselProps = {
  onSelectBook: (book: Book) => void
}

const FreeBookCarousel: React.FC<FreeBookCarouselProps> = ({ onSelectBook }) => {
  const [freeBooks, setFreeBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const borderColor = useThemeColor({}, "tint")
  const textColor = useThemeColor({}, "text")

  useEffect(() => {
    const fetchFreeBooks = async () => {
      try {
        setLoading(true)
        setError(null)
        const books = await searchBooksReadOnLine()
        if (books.length === 0) {
          setError("No se encontraron libros gratuitos.")
        } else {
          setFreeBooks(books)
        }
      } catch (error) {
        console.error("Error fetching free books:", error)
        setError("Error al cargar los libros gratuitos.")
      } finally {
        setLoading(false)
      }
    }

    fetchFreeBooks()
  }, [])

  useEffect(() => {
    if (freeBooks.length > 0) {
      const autoScroll = setInterval(() => {
        const nextIndex = (currentIndex + 1) % freeBooks.length
        scrollToIndex(nextIndex)
      }, 3000)

      return () => clearInterval(autoScroll)
    }
  }, [currentIndex, freeBooks.length])

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 160, animated: true })
      setCurrentIndex(index)
    }
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset
    const index = Math.round(contentOffset.x / 160)
    setCurrentIndex(index)
  }

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + freeBooks.length) % freeBooks.length
    scrollToIndex(prevIndex)
  }

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % freeBooks.length
    scrollToIndex(nextIndex)
  }

  if (loading) {
    return <ActivityIndicator size="large" color={borderColor} />
  }

  if (error) {
    return (
      <ThemedText darkColor={textColor} lightColor={textColor} type="default">
        {error}
      </ThemedText>
    )
  }

  if (freeBooks.length === 0) {
    return (
      <ThemedText darkColor={textColor} lightColor={textColor} type="default">
        No se encontraron libros gratuitos.
      </ThemedText>
    )
  }

  return (
    <View style={styles.container}>
      <ThemedText type="title" darkColor={textColor} lightColor={textColor} style={styles.title}>
        Libros para leer online
      </ThemedText>
      <View style={styles.carouselContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={handlePrevious}>
          <IconSymbol name="chevron.left" size={24} color={borderColor} />
        </TouchableOpacity>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {freeBooks.map((book) => (
            <TouchableOpacity key={book.key} onPress={() => onSelectBook(book)} style={styles.bookItem}>
              <BookItem
                title={book.title.length > 20 ? `${book.title.slice(0, 20)}...` : book.title}
                author={
                  book.author_name
                    ? book.author_name.join(", ").length > 15
                      ? `${book.author_name.join(", ").slice(0, 15)}...`
                      : book.author_name.join(", ")
                    : "Autor desconocido"
                }
                coverUrl={book.cover_i}
                bookKey={book.key}
                onPress={() => onSelectBook(book)}
                style={styles.bookItemCard}
                imageStyle={styles.largeImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.arrowButton} onPress={handleNext}>
          <IconSymbol name="chevron.right" size={24} color={borderColor} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: "100%",
    maxWidth: 800,
    height: "auto",
  },
  title: {
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center'
  },
  scrollView: {
    flexGrow: 0,
  },
  bookItem: {
    width: 200,
    marginHorizontal: 5,
  },
  bookItemCard: {
    alignContent: "center",
    alignItems: "center",
    width: "100%",
    height: 300,
    borderRadius: 8,
    flexDirection: "column",
    justifyContent: 'center',
    margin: 'auto'
  },
  arrowButton: {
    padding: 10,
  },
  largeImage: {
    width: 160,
    margin: "auto",
    height: 210,
  },
})

export default FreeBookCarousel