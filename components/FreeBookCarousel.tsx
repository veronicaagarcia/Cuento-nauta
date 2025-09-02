import type React from "react"
import { useEffect, useState, useRef } from "react"
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from "react-native"
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from "@/components/ThemedText"
import { searchBooksReadOnLine, type Book } from "@/services/api"
import { useThemeColor } from "@/hooks/useThemeColor"
import BookItemFixed from "./BookItemFixed"
import { IconSymbol } from "@/components/ui/IconSymbol"
import AnimatedSlideIn from "./AnimatedSlideIn"
import AnimatedFadeIn from "./AnimatedFadeIn"
import { ModernColors } from "@/constants/ModernColors"

type FreeBookCarouselProps = {
  onSelectBook: (book: Book) => void
}

const FreeBookCarousel: React.FC<FreeBookCarouselProps> = ({ onSelectBook }) => {
  const [freeBooks, setFreeBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const buttonColor = useThemeColor({}, "button")
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
    if (freeBooks.length > 1) {
      const autoScroll = setInterval(() => {
        const nextIndex = (currentIndex + 1) % freeBooks.length
        scrollToIndex(nextIndex)
      }, 5000) // Increased interval for better UX

      return () => clearInterval(autoScroll)
    }
  }, [currentIndex, freeBooks.length])

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * 320, animated: true })
      setCurrentIndex(index)
    }
  }

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset
    const index = Math.round(contentOffset.x / 320)
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ModernColors.primary[500]} />
        <Text style={styles.loadingText}>Cargando libros gratuitos...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (freeBooks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyText}>No se encontraron libros gratuitos</Text>
      </View>
    )
  }

  return (
    <AnimatedFadeIn duration={800}>
      <View style={styles.container}>
        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            onPress={handlePrevious}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={ModernColors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navButtonGradient}
            >
              <IconSymbol name="chevron.left" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleNext}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={ModernColors.gradients.secondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navButtonGradient}
            >
              <IconSymbol name="chevron.right" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={320}
          snapToAlignment="start"
        >
          {freeBooks.map((book, index) => (
            <AnimatedSlideIn
              key={book.key}
              direction="up"
              delay={index * 100}
              duration={500}
              distance={20}
            >
              <View style={styles.bookItemWrapper}>
                <BookItemFixed
                  title={book.title}
                  author={book.author_name?.join(", ") || "Autor desconocido"}
                  coverUrl={book.cover_i}
                  bookKey={book.key}
                  description={book.description}
                  onPress={() => onSelectBook(book)}
                  style={styles.bookItem}
                />
                
              </View>
            </AnimatedSlideIn>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {freeBooks.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      </View>
    </AnimatedFadeIn>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: ModernColors.error[50],
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: ModernColors.error[200],
  },
  errorEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ModernColors.error[700],
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: ModernColors.error[600],
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: ModernColors.neutral[50],
    borderRadius: 16,
    margin: 16,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: ModernColors.neutral[600],
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 10,
    transform: [{ translateY: -20 }],
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  bookItemWrapper: {
    width: 300,
    marginHorizontal: 8,
    position: 'relative',
  },
  bookItem: {
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ModernColors.neutral[300],
  },
  activeDot: {
    backgroundColor: ModernColors.primary[500],
    width: 24,
    borderRadius: 12,
  },
})

export default FreeBookCarousel