import type React from "react"
import { useEffect, useState, useRef } from "react"
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { searchBooksReadOnLine, type Book } from "@/services/api"
import { useThemeColor } from '@/hooks/useThemeColor';
import BookItem from "./BookItem"
import { IconSymbol } from "@/components/ui/IconSymbol"

type FreeBookCarouselProps = {
  onSelectBook: (book: Book) => void
}

const FreeBookCarousel: React.FC<FreeBookCarouselProps> = ({ onSelectBook }) => {
  const [freeBooks, setFreeBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
   const borderColor = useThemeColor({}, 'tint');

  useEffect(() => {
    const fetchFreeBooks = async () => {
      try {
        const books = await searchBooksReadOnLine()
        const filteredBooks = books.filter((book) => book.isFullyAccessible)
        setFreeBooks(filteredBooks)
      } catch (error) {
        console.error("Error fetching free books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFreeBooks()
  }, [])

  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (freeBooks.length > 0) {
        const nextIndex = (currentIndex + 1) % freeBooks.length
        scrollToIndex(nextIndex)
      }
    }, 3000) // Cambia de libro cada 3 segundos

    return () => clearInterval(autoScroll)
  }, [currentIndex, freeBooks])

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
    return <ActivityIndicator size="large" color="#0000ff" />
  }

  if (freeBooks.length === 0) {
    return <ThemedText type="default">No se encontraron libros gratuitos.</ThemedText>
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Libros para leer online
      </ThemedText>
      <br/>
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
                title={book.title.length > 20 ? `${book.title.slice(0, 20)}...` : book.title} // Acortar título
                author={book.author_name ? (book.author_name.join(", ").length > 20 ? `${book.author_name.join(", ").slice(0, 20)}...` : book.author_name.join(", ")) : 'Autor desconocido'}
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
    height:'auto'
  },
  title: {
    marginBottom: 10,
    fontWeight: "bold",
    margin: 'auto'
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 0,
  },
  bookItem: {
    width: 200,
    marginHorizontal: 5,
  },
  bookItemCard:{
    alignContent:'center',
    alignItems: 'center',
    width:'100%',
    height:300,
    borderRadius: 8,
    flexDirection: 'column'
    
  },
  arrowButton: {
    padding: 10,
  },
  largeImage:{
    width:160,
    margin:'auto',
    height: 210
  }
})

export default FreeBookCarousel


