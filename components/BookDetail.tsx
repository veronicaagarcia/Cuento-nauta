import type React from "react"
import { useEffect, useState } from "react"
import { View, ScrollView, Image, StyleSheet, ActivityIndicator, Linking, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { ThemedText } from "@/components/ThemedText"
import { getRecommendedBooks, getBookDetails, type ReadingStatus, type Book } from "@/services/api"
import { ThemedButton } from "@/components/ThemedButton"
import BookItemFixed from "./BookItemFixed"
import { Picker } from "@react-native-picker/picker"
import { ThemedView } from "./ThemedView"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useBookContext } from "@/contexts/BookContext"
import ModernButton from "./ModernButton"
import AnimatedFadeIn from "./AnimatedFadeIn"
import AnimatedSlideIn from "./AnimatedSlideIn"
import { ModernColors } from "@/constants/ModernColors"

type BookDetailProps = {
  book: Book
  onBack: () => void
  onSelectBook: (book: Book) => void
  onAddToFavorites: (book: Book) => Promise<void>
  onRemoveFromFavorites: (bookKey: string) => Promise<void>
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onSelectBook}) => {
  const [loading, setLoading] = useState(true)
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([])
  const [currentBook, setCurrentBook] = useState<Book>(book)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | undefined>(undefined)

  const { updateBookReadingStatus, toggleFavorite, isFavorite, getBookStatus } = useBookContext()

  // Get current book status
  useEffect(() => {
    const status = getBookStatus(currentBook.key)
    setSelectedStatus(status)
  }, [currentBook.key, getBookStatus])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recommended, fullBookDetails] = await Promise.all([
          getRecommendedBooks(currentBook.key),
          getBookDetails(currentBook.key),
        ])
        setRecommendedBooks(recommended)
        setCurrentBook(fullBookDetails)
      } catch (error) {
        console.error("Error fetching book data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentBook.key])

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(currentBook)
      setSaveMessage(isFavorite(currentBook.key) ? "Libro eliminado de favoritos" : "Libro guardado en favoritos")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("Error al modificar favoritos:", error)
      setSaveMessage("Error al modificar favoritos")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleStatusChange = async (status: ReadingStatus) => {
    try {
      await updateBookReadingStatus(currentBook.key, status)
      setSelectedStatus(status)
      setCurrentBook((prev) => ({ ...prev, readingStatus: status }))
      setSaveMessage(`✅ Estado actualizado a: ${status}`)
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("Error al actualizar el estado del libro:", error)
      setSaveMessage("❌ Error al actualizar el estado")
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleSelectRecommendedBook = async (selectedBook: Book) => {
    setLoading(true)
    try {
      const fullBookDetails = await getBookDetails(selectedBook.key)
      setCurrentBook(fullBookDetails)
      onSelectBook(fullBookDetails)
    } catch (error) {
      console.error("Error fetching book details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReadOnline = () => {
    if (currentBook.previewLink) {
      Linking.openURL(currentBook.previewLink)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <AnimatedFadeIn duration={600}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <LinearGradient
                colors={ModernColors.gradients.secondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.backButtonGradient}
              >
                <Text style={styles.backButtonText}>←</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles del Libro</Text>
          </View>
        </AnimatedFadeIn>

        {/* Book Cover and Basic Info */}
        <AnimatedSlideIn direction="up" delay={200} duration={800}>
          <View style={styles.bookHeroSection}>
            <View style={styles.coverContainer}>
              {currentBook.cover_i ? (
                <View style={styles.coverImageContainer}>
                  <Image
                    source={{ uri: currentBook.cover_i }}
                    style={[styles.coverImage, imageLoaded && styles.coverImageLoaded]}
                    resizeMode="cover"
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && <View style={styles.coverShimmer} />}
                </View>
              ) : (
                <LinearGradient
                  colors={ModernColors.gradients.primary}
                  style={styles.coverPlaceholder}
                >
                  <Text style={styles.coverPlaceholderText}>📚</Text>
                </LinearGradient>
              )}
              
              {/* Favorite Button */}
              <TouchableOpacity
                style={[styles.favoriteButton, isHovered && styles.favoriteButtonHovered]}
                onPress={handleToggleFavorite}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <LinearGradient
                  colors={isFavorite(currentBook.key) 
                    ? ['#ff6b6b', '#ee5a5a'] 
                    : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                  }
                  style={styles.favoriteGradient}
                >
                  <Text style={[
                    styles.favoriteIcon,
                    { color: isFavorite(currentBook.key) ? 'white' : ModernColors.neutral[600] }
                  ]}>
                    {isFavorite(currentBook.key) ? '♥' : '♡'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {isHovered && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    {isFavorite(currentBook.key) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.bookInfoContainer}>
              <Text style={styles.bookTitle} numberOfLines={3}>
                {currentBook.title}
              </Text>
              <Text style={styles.bookAuthor}>
                por {currentBook.author_name?.join(', ') || 'Autor desconocido'}
              </Text>
              
              <View style={styles.bookMeta}>
                {currentBook.first_publish_year && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Publicado:</Text>
                    <Text style={styles.metaValue}>{currentBook.first_publish_year}</Text>
                  </View>
                )}
                {currentBook.edition_count && currentBook.edition_count > 0 && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Páginas:</Text>
                    <Text style={styles.metaValue}>{currentBook.edition_count}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </AnimatedSlideIn>

        {/* Description */}
        {currentBook.description && (
          <AnimatedSlideIn direction="up" delay={400} duration={600}>
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>📝 Descripción</Text>
              <Text style={styles.descriptionText}>
                {currentBook.description}
              </Text>
            </View>
          </AnimatedSlideIn>
        )}

        {/* Status and Actions */}
        <AnimatedSlideIn direction="up" delay={600} duration={600}>
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Selecciona tu progreso de lectura</Text>
            
            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity 
                style={[styles.statusOption, selectedStatus === "Por leer" && styles.statusOptionActive]}
                onPress={() => handleStatusChange("Por leer")}
              >
                <View style={styles.statusIndicator}>
                  <Text style={[styles.statusIcon, selectedStatus === "Por leer" && styles.statusIconActive]}>📚</Text>
                </View>
                <Text style={[styles.statusLabel, selectedStatus === "Por leer" && styles.statusLabelActive]}>Por leer</Text>
                <Text style={styles.statusDescription}>Lo añadiré a mi lista</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, selectedStatus === "Leyendo" && styles.statusOptionActive]}
                onPress={() => handleStatusChange("Leyendo")}
              >
                <View style={styles.statusIndicator}>
                  <Text style={[styles.statusIcon, selectedStatus === "Leyendo" && styles.statusIconActive]}>👀</Text>
                </View>
                <Text style={[styles.statusLabel, selectedStatus === "Leyendo" && styles.statusLabelActive]}>Leyendo</Text>
                <Text style={styles.statusDescription}>Estoy disfrutándolo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.statusOption, selectedStatus === "Leído" && styles.statusOptionActive]}
                onPress={() => handleStatusChange("Leído")}
              >
                <View style={styles.statusIndicator}>
                  <Text style={[styles.statusIcon, selectedStatus === "Leído" && styles.statusIconActive]}>✅</Text>
                </View>
                <Text style={[styles.statusLabel, selectedStatus === "Leído" && styles.statusLabelActive]}>Leído</Text>
                <Text style={styles.statusDescription}>Ya lo terminé</Text>
              </TouchableOpacity>
            </View>

            {saveMessage && (
              <View style={styles.messageContainer}>
                <Text style={styles.messageText}>{saveMessage}</Text>
              </View>
            )}

            {/* Read Online Button */}
            {currentBook.isFullyAccessible && currentBook.previewLink ? (
              <ModernButton
                title="Leer en línea"
                variant="secondary"
                size="large"
                onPress={handleReadOnline}
                style={styles.readOnlineButton}
              />
            ) : (
              <View style={styles.notAvailableContainer}>
                <Text style={styles.notAvailableText}>
                  📵 Este libro no está disponible para lectura gratuita en línea
                </Text>
              </View>
            )}
          </View>
        </AnimatedSlideIn>

        {/* Recommended Books */}
        {recommendedBooks.length > 0 && (
          <AnimatedSlideIn direction="up" delay={800} duration={600}>
            <View style={styles.recommendedSection}>
              <Text style={styles.sectionTitle}>Más libros del autor</Text>
              <View style={styles.recommendedBooks}>
                {recommendedBooks.map((recBook, index) => (
                  <AnimatedSlideIn
                    key={recBook.key}
                    direction="up"
                    delay={1000 + index * 100}
                    duration={500}
                    distance={30}
                  >
                    <BookItemFixed
                      title={recBook.title}
                      author={recBook.author_name?.join(", ")}
                      coverUrl={recBook.cover_i}
                      bookKey={recBook.key}
                      firstPublishYear={recBook.first_publish_year}
                      description={recBook.description}
                      onPress={() => handleSelectRecommendedBook(recBook)}
                      style={styles.recommendedBook}
                    />
                  </AnimatedSlideIn>
                ))}
              </View>
            </View>
          </AnimatedSlideIn>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ModernColors.primary[500]} />
            <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ModernColors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ModernColors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  backButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.neutral[800],
  },
  bookHeroSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: ModernColors.light.surface,
    marginBottom: 16,
  },
  coverContainer: {
    position: 'relative',
    marginRight: 20,
  },
  coverImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  coverImage: {
    width: 120,
    height: 180,
    opacity: 0,
  },
  coverImageLoaded: {
    opacity: 1,
  },
  coverShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ModernColors.neutral[200],
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  favoriteButtonHovered: {
    transform: [{ scale: 1.1 }],
  },
  favoriteGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tooltip: {
    position: 'absolute',
    top: 44,
    right: -8,
    backgroundColor: ModernColors.neutral[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 100,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    color: ModernColors.neutral[50],
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  bookInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: ModernColors.neutral[800],
    lineHeight: 32,
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    color: ModernColors.primary[600],
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 22,
  },
  bookMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    marginRight: 8,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: ModernColors.neutral[800],
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: ModernColors.light.surface,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ModernColors.neutral[200],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ModernColors.neutral[800],
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: ModernColors.neutral[700],
    lineHeight: 24,
  },
  actionSection: {
    backgroundColor: ModernColors.primary[50],
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ModernColors.primary[200],
  },
  statusButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    backgroundColor: ModernColors.light.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: ModernColors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionActive: {
    borderColor: ModernColors.primary[500],
    backgroundColor: ModernColors.primary[50],
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  statusIconActive: {
    opacity: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernColors.neutral[800],
    marginBottom: 2,
    flex: 1,
  },
  statusLabelActive: {
    color: ModernColors.primary[700],
  },
  statusDescription: {
    fontSize: 14,
    color: ModernColors.neutral[500],
    fontStyle: 'italic',
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -7 }],
  },
  messageContainer: {
    backgroundColor: ModernColors.success[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ModernColors.success[200],
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    color: ModernColors.success[700],
    fontWeight: '600',
    textAlign: 'center',
  },
  readOnlineButton: {
    alignSelf: 'stretch',
  },
  notAvailableContainer: {
    backgroundColor: ModernColors.neutral[100],
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ModernColors.neutral[300],
  },
  notAvailableText: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendedSection: {
    margin: 16,
  },
  recommendedBooks: {
    gap: 16,
  },
  recommendedBook: {
    width: '100%',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    marginTop: 12,
  },
})

export default BookDetail;
