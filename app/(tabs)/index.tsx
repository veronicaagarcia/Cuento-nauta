import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import SearchBarOptimized from '@/components/SearchBarOptimized';
import BookDetail from '@/components/BookDetail';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSearch } from '@/hooks/useSearch';
import { useBookContext } from '@/contexts/BookContext';
import { getBookDetails, type Book } from '@/services/api';
import { LoadingState, EmptyState, BookListSkeleton } from '@/components/LoadingState';
import ErrorBoundary from '@/components/ErrorBoundary';
import BookItemFixed from '@/components/BookItemFixed';
import FreeBookCarousel from '@/components/FreeBookCarousel';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import AnimatedSlideIn from '@/components/AnimatedSlideIn';
import { ModernColors } from '@/constants/ModernColors';

export default function HomeScreen() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  
  const { books, loading: searchLoading, error, search, clearSearch } = useSearch();
  const { addFavoriteBook, removeFavoriteBook, error: contextError } = useBookContext();

  const handleBookSelect = useCallback(async (book: Book) => {
    setBookLoading(true);
    try {
      const fullBookDetails = await getBookDetails(book.key);
      setSelectedBook(fullBookDetails);
    } catch (err) {
      console.error('Error fetching book details:', err);
    } finally {
      setBookLoading(false);
    }
  }, []);

  const handleBackToHome = useCallback(() => {
    setSelectedBook(null);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      search(query);
    } else {
      clearSearch();
    }
  }, [search, clearSearch]);

  const handleSearchSubmit = useCallback((query: string) => {
    setSearchQuery(query);
    search(query);
  }, [search]);

  const renderSearchResults = () => {
    if (searchLoading) {
      return <BookListSkeleton count={6} />;
    }

    if (error) {
      return (
        <EmptyState
          title="Error en la búsqueda"
          message={error}
          emoji="😔"
          actionButton={
            <SearchBarOptimized
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSearch={handleSearchSubmit}
              placeholder="Intenta con otra búsqueda..."
            />
          }
        />
      );
    }

    if (books.length === 0 && searchQuery.trim()) {
      return (
        <EmptyState
          title="No se encontraron libros"
          message="Intenta con diferentes palabras clave o revisa la ortografía"
          emoji="🔍"
        />
      );
    }

    return (
      <View style={styles.searchResults}>
        <View style={styles.booksGrid}>
          {books.map((book, index) => (
            <AnimatedSlideIn
              key={book.key}
              direction="up"
              delay={index * 100}
              duration={500}
              distance={30}
            >
              <BookItemFixed
                title={book.title}
                author={book.author_name?.join(', ')}
                coverUrl={book.cover_i}
                bookKey={book.key}
                firstPublishYear={book.first_publish_year}
                description={book.description}
                onPress={() => handleBookSelect(book)}
                style={styles.bookItem}
              />
            </AnimatedSlideIn>
          ))}
        </View>
      </View>
    );
  };

  if (selectedBook) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <BookDetail
          book={selectedBook}
          onBack={handleBackToHome}
          onSelectBook={handleBookSelect}
          onAddToFavorites={addFavoriteBook}
          onRemoveFromFavorites={removeFavoriteBook}
        />
        {bookLoading && (
          <LoadingState
            message="Cargando detalles del libro..."
            overlay
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <AnimatedFadeIn duration={1000}>
            <View style={styles.heroSection}>
              <LinearGradient
                colors={ModernColors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroContent}>
                  <AnimatedSlideIn direction="down" delay={200} duration={800}>
                    <Text style={styles.heroTitle}>📚 Cuento Nauta</Text>
                  </AnimatedSlideIn>
                  
                  <AnimatedSlideIn direction="up" delay={400} duration={800}>
                    <Text style={styles.heroSubtitle}>
                      Descubre tu próxima gran aventura literaria
                    </Text>
                  </AnimatedSlideIn>
                  
                  <AnimatedFadeIn delay={600} duration={1000}>
                    <View style={styles.heroStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>10K+</Text>
                        <Text style={styles.statLabel}>Libros</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>Gratis</Text>
                        <Text style={styles.statLabel}>Acceso</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>24/7</Text>
                        <Text style={styles.statLabel}>Disponible</Text>
                      </View>
                    </View>
                  </AnimatedFadeIn>
                </View>
              </LinearGradient>
            </View>
          </AnimatedFadeIn>
          
          {/* Search Bar */}
          <AnimatedSlideIn direction="up" delay={800} duration={600}>
            <View style={styles.searchSection}>
              <SearchBarOptimized
                value={searchQuery}
                onChangeText={handleSearchChange}
                onSearch={handleSearchSubmit}
                placeholder="Buscar por título, autor..."
                autoFocus={false}
              />
            </View>
          </AnimatedSlideIn>

          {/* Search Results or Featured Books */}
          {searchQuery.trim() ? (
            renderSearchResults()
          ) : (
            <AnimatedFadeIn delay={1000} duration={800}>
              <View style={styles.featuredSection}>
                <AnimatedSlideIn direction="up" delay={1200} duration={600}>
                  <Text style={styles.sectionTitle}>
                    Libros Destacados
                  </Text>
                </AnimatedSlideIn>
                <AnimatedSlideIn direction="up" delay={1400} duration={600}>
                  <FreeBookCarousel onSelectBook={handleBookSelect} />
                </AnimatedSlideIn>
              </View>
            </AnimatedFadeIn>
          )}

          {/* Error Display */}
          {(error || contextError) && (
            <View style={[styles.errorContainer, { backgroundColor: `${primaryColor}20` }]}>
              <EmptyState
                title="Algo salió mal"
                message={error || contextError || 'Error desconocido'}
                emoji="😓"
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ModernColors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroGradient: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: ModernColors.light.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredSection: {
    padding: 20,
    backgroundColor: ModernColors.light.background,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ModernColors.neutral[800],
    marginBottom: 20,
    textAlign: 'center',
  },
  searchResults: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  booksGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  bookItem: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  errorContainer: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: ModernColors.error[50],
    borderWidth: 1,
    borderColor: ModernColors.error[200],
  },
});