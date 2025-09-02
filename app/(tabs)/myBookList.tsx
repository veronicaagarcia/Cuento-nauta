"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, FlatList, Modal, Text, TouchableOpacity, useColorScheme, TextInput, ScrollView } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import ParallaxScrollView from "@/components/ParallaxScrollView"
import * as Animatable from "react-native-animatable"
import { ThemedText } from "@/components/ThemedText"
import {
  getBookList,
  removeBookFromList,
  type BookWithStatus,
  type Book,
  saveCurrentPage,
  getCurrentPage,
} from "@/services/api"
import BookItemFixed from "@/components/BookItemFixed"
import BookDetail from "@/components/BookDetail"
import { ThemedButton } from "@/components/ThemedButton"
import ModernButton from "@/components/ModernButton"
import { ThemedView } from "@/components/ThemedView"
import { useThemeColor } from "@/hooks/useThemeColor"
import AnimatedFadeIn from "@/components/AnimatedFadeIn"
import AnimatedSlideIn from "@/components/AnimatedSlideIn"
import { ModernColors } from "@/constants/ModernColors"

export default function MyBookList() {
  const [favoriteBooks, setFavoriteBooks] = useState<BookWithStatus[]>([])
  const [selectedBook, setSelectedBook] = useState<BookWithStatus | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [bookToRemove, setBookToRemove] = useState<string | null>(null)
  const [pageInputVisible, setPageInputVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState<string>("")
  const [pageInputBook, setPageInputBook] = useState<BookWithStatus | null>(null);

  const colorScheme = useColorScheme()
  const headerColor = useThemeColor({}, "tint")
  const textColor = useThemeColor({}, "text")

  useEffect(() => {
    loadFavoriteBooks()
  }, [])

  const loadFavoriteBooks = async () => {
    const books = await getBookList("favoritos")
    setFavoriteBooks(books)
  }

  const handleSelectBook = async (book: BookWithStatus) => {
    const page = await getCurrentPage(book.key)
    setSelectedBook({ ...book, currentPage: page })
  }

  const handleBackToList = () => {
    setSelectedBook(null)
    loadFavoriteBooks() // Recargar la lista por si se han hecho cambios
  }

  const handleRemoveBook = async () => {
    if (bookToRemove) {
      await removeBookFromList(bookToRemove, "favoritos")
      loadFavoriteBooks()
      setModalVisible(false)
    }
  }

  const confirmRemoveBook = (bookKey: string) => {
    setBookToRemove(bookKey)
    setModalVisible(true)
  }

  const handleSavePage = async () => {
    if (pageInputBook && currentPage) {
      const pageNumber = Number.parseInt(currentPage)
      if (!isNaN(pageNumber)) {
        await saveCurrentPage(pageInputBook.key, pageNumber)
        setPageInputVisible(false)
        // Actualizar el libro en la lista local
        setFavoriteBooks((prevBooks) =>
          prevBooks.map((book) => (book.key === pageInputBook.key ? { ...book, currentPage: pageNumber } : book)),
        )
        // Si el libro seleccionado es el que se está actualizando, actualizarlo también
        if (selectedBook && selectedBook.key === pageInputBook.key) {
          setSelectedBook((prevBook) => (prevBook ? { ...prevBook, currentPage: pageNumber } : null))
        }
      } else {
        // Manejar el caso de un número de página inválido
        alert("Por favor, ingresa un número de página válido.")
      }
    }
  }

  const handleUpdatePage = (book: BookWithStatus) => {
    setPageInputBook(book)
    setCurrentPage(book.currentPage?.toString() || "")
    setPageInputVisible(true)
  }

  const categorizeBook = (book: BookWithStatus): string => {
    const title = book.title.toLowerCase();
    const author = (book.author_name?.join(' ') || '').toLowerCase();
    const content = `${title} ${author}`;
    
    if (content.includes('mystery') || content.includes('misterio') || content.includes('detective') || content.includes('crime')) {
      return 'Misterio';
    }
    if (content.includes('romance') || content.includes('love') || content.includes('amor')) {
      return 'Romance';
    }
    if (content.includes('science fiction') || content.includes('sci-fi') || content.includes('ciencia ficción') || content.includes('fantasy') || content.includes('fantasía')) {
      return 'Ciencia Ficción / Fantasía';
    }
    if (content.includes('history') || content.includes('historia') || content.includes('historical') || content.includes('históric')) {
      return 'Historia';
    }
    if (content.includes('biography') || content.includes('biografía') || content.includes('memoir')) {
      return 'Biografías';
    }
    if (content.includes('business') || content.includes('negocio') || content.includes('management') || content.includes('leadership')) {
      return 'Negocios';
    }
    return 'Ficción General';
  };

  const filteredBooks = favoriteBooks.filter((book) => {
    const statusMatch = filter ? book.readingStatus === filter : true;
    const categoryMatch = categoryFilter ? categorizeBook(book) === categoryFilter : true;
    return statusMatch && categoryMatch;
  }).sort((a, b) => {
    // Si no hay filtro aplicado (todos los libros), ordenar por prioridad de estado
    if (!filter) {
      const statusPriority = { 
        "Leyendo": 1, 
        "Por leer": 2, 
        "Leído": 3,
        undefined: 4 // Sin estado va al final
      };
      
      const priorityA = statusPriority[a.readingStatus as keyof typeof statusPriority] || 4;
      const priorityB = statusPriority[b.readingStatus as keyof typeof statusPriority] || 4;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
    }
    
    // Si tienen el mismo estado o hay filtro, ordenar alfabéticamente por título
    return a.title.localeCompare(b.title);
  })

  const getFilterDescription = () => {
    switch (filter) {
      case "Por leer":
        return "📚 Libros que planeas leer próximamente. ¡Tu lista de lectura pendiente!"
      case "Leyendo":
        return '📖 Libros que estás leyendo actualmente. Puedes actualizar tu progreso para no perder el hilo.'
      case "Leído":
        return "✅ Libros que ya has terminado de leer. ¡Tus logros literarios!"
      default:
        return "📋 Todos tus libros favoritos organizados por categoría."
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <AnimatedFadeIn duration={800}>
          <LinearGradient
            colors={ModernColors.gradients.secondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modernHeader}
          >
            <AnimatedSlideIn direction="down" delay={200} duration={600}>
              <Text style={styles.modernHeaderTitle}>📚 Mi Biblioteca</Text>
            </AnimatedSlideIn>
            <AnimatedSlideIn direction="up" delay={400} duration={600}>
              <Text style={styles.modernHeaderSubtitle}>
                Organiza y sigue el progreso de tus lecturas
              </Text>
            </AnimatedSlideIn>
          </LinearGradient>
        </AnimatedFadeIn>
      <View style={styles.contentContainer}>
        {selectedBook ? (
          <>
            <BookDetail
              book={selectedBook}
              onBack={handleBackToList}
              onSelectBook={handleSelectBook}
              onAddToFavorites={(book: Book): Promise<void> => {
                throw new Error("Function not implemented.")
              }}
              onRemoveFromFavorites={(bookKey: string): Promise<void> => {
                throw new Error("Function not implemented.")
              }}
            />
            {selectedBook.readingStatus === "Leyendo" && (
              <ThemedView style={styles.pageInputContainer}>
                <ThemedText type="default" style={styles.pageText}>
                  Página actual: {selectedBook.currentPage || "No establecida"}
                </ThemedText>
                <ThemedButton title="Actualizar página" onPress={() => setPageInputVisible(true)} />
              </ThemedView>
            )}
          </>
        ) : (
          <>
            <AnimatedSlideIn direction="up" delay={600} duration={600}>
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Filtrar por estado</Text>
                <View style={styles.filterButtons}>
                  <ModernButton
                    title="Por leer"
                    variant={filter === "Por leer" ? "primary" : "outline"}
                    size="small"
                    onPress={() => setFilter("Por leer")}
                  />
                  <ModernButton
                    title="Leyendo"
                    variant={filter === "Leyendo" ? "primary" : "outline"}
                    size="small"
                    onPress={() => setFilter("Leyendo")}
                  />
                  <ModernButton
                    title="Leídos"
                    variant={filter === "Leído" ? "success" : "outline"}
                    size="small"
                    onPress={() => setFilter("Leído")}
                  />
                  <ModernButton
                    title="Todos"
                    variant={filter === null ? "secondary" : "outline"}
                    size="small"
                    onPress={() => setFilter(null)}
                  />
                </View>
              </View>
            </AnimatedSlideIn>
            
            <AnimatedFadeIn delay={800} duration={600}>
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  {getFilterDescription()}
                </Text>
              </View>
            </AnimatedFadeIn>
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.key}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <AnimatedSlideIn
                  direction="up"
                  delay={1000 + index * 100}
                  duration={500}
                  distance={30}
                >
                  <View style={styles.bookItemContainer}>
                    <BookItemFixed
                      title={item.title}
                      author={item.author_name?.join(", ")}
                      coverUrl={item.cover_i}
                      bookKey={item.key}
                      firstPublishYear={item.first_publish_year}
                      description={item.description}
                      onPress={() => handleSelectBook(item)}
                    />
                    
                    {/* Status and Progress Info */}
                    <View style={styles.bookMetaInfo}>
                      <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Estado:</Text>
                        <View style={[
                          styles.statusBadge,
                          item.readingStatus === "Leído" && styles.statusCompleted,
                          item.readingStatus === "Leyendo" && styles.statusReading,
                          !item.readingStatus && styles.statusUnset
                        ]}>
                          <Text style={[
                            styles.statusText,
                            item.readingStatus === "Leído" && styles.statusTextCompleted,
                            item.readingStatus === "Leyendo" && styles.statusTextReading,
                            !item.readingStatus && styles.statusTextUnset
                          ]}>
                            {item.readingStatus || "Sin establecer"}
                          </Text>
                        </View>
                      </View>
                      
                      {item.readingStatus === "Leyendo" && (
                        <View style={styles.progressContainer}>
                          <Text style={styles.progressText}>
                            Página: {item.currentPage || "No establecida"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      {item.readingStatus === "Leyendo" && (
                        <ModernButton
                          title="📄 Actualizar página"
                          variant="secondary"
                          size="small"
                          onPress={() => handleUpdatePage(item)}
                        />
                      )}
                      <ModernButton
                        title="🗑️ Eliminar"
                        variant="danger"
                        size="small"
                        onPress={() => confirmRemoveBook(item.key)}
                      />
                    </View>
                  </View>
                </AnimatedSlideIn>
              )}
              ListEmptyComponent={
                <AnimatedFadeIn delay={1200} duration={600}>
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateEmoji}>📚</Text>
                    <Text style={styles.emptyStateTitle}>No hay libros aquí</Text>
                    <Text style={styles.emptyStateText}>
                      No tienes libros en esta categoría. ¡Agrega algunos desde la búsqueda!
                    </Text>
                  </View>
                </AnimatedFadeIn>
              }
            />
          </>
        )}
      </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modernModalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>🗑️</Text>
              <Text style={styles.modalTitle}>Eliminar libro</Text>
            </View>
            <Text style={styles.modernModalText}>
              Si borras este libro, se eliminará de tu biblioteca personal. 
              Podrás volver a agregarlo buscándolo nuevamente.
            </Text>
            <View style={styles.modernModalButtons}>
              <ModernButton
                title="Cancelar"
                variant="outline"
                size="medium"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <ModernButton
                title="Eliminar"
                variant="danger"
                size="medium"
                onPress={handleRemoveBook}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={pageInputVisible}
        onRequestClose={() => setPageInputVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modernModalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>📄</Text>
              <Text style={styles.modalTitle}>Actualizar progreso</Text>
            </View>
            <Text style={styles.modernModalText}>
              Ingresa la página actual para "{pageInputBook?.title}":
            </Text>
            <TextInput
              style={styles.modernPageInput}
              keyboardType="numeric"
              value={currentPage}
              onChangeText={setCurrentPage}
              placeholder="Número de página"
              placeholderTextColor={ModernColors.neutral[400]}
            />
            <View style={styles.modernModalButtons}>
              <ModernButton
                title="Cancelar"
                variant="outline"
                size="medium"
                onPress={() => setPageInputVisible(false)}
                style={styles.modalButton}
              />
              <ModernButton
                title="Guardar"
                variant="success"
                size="medium"
                onPress={handleSavePage}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modernHeader: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  modernHeaderTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.neutral[800],
    textAlign: 'center',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: 'wrap',
    gap: 8,
  },
  descriptionContainer: {
    backgroundColor: ModernColors.primary[50],
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: ModernColors.primary[200],
  },
  descriptionText: {
    fontSize: 14,
    color: ModernColors.primary[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  bookItemContainer: {
    marginBottom: 24,
  },
  bookMetaInfo: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    marginRight: 8,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: ModernColors.neutral[200],
  },
  statusCompleted: {
    backgroundColor: ModernColors.success[100],
  },
  statusReading: {
    backgroundColor: ModernColors.secondary[100],
  },
  statusUnset: {
    backgroundColor: ModernColors.neutral[100],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: ModernColors.neutral[700],
  },
  statusTextCompleted: {
    color: ModernColors.success[700],
  },
  statusTextReading: {
    color: ModernColors.secondary[700],
  },
  statusTextUnset: {
    color: ModernColors.neutral[500],
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 13,
    color: ModernColors.secondary[600],
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: ModernColors.neutral[50],
    borderRadius: 20,
    marginTop: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.neutral[700],
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: ModernColors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modernModalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: ModernColors.light.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.neutral[800],
  },
  modernModalText: {
    fontSize: 16,
    color: ModernColors.neutral[600],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modernModalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
  modernPageInput: {
    borderWidth: 2,
    borderColor: ModernColors.neutral[300],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: 120,
    textAlign: "center",
    fontSize: 16,
    color: ModernColors.neutral[800],
    backgroundColor: ModernColors.light.surface,
  },
})
