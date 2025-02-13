"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, FlatList, Modal, Text, TouchableOpacity, useColorScheme, TextInput } from "react-native"
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
import BookItem from "@/components/BookItem"
import BookDetail from "@/components/BookDetail"
import { ThemedButton } from "@/components/ThemedButton"
import { ThemedView } from "@/components/ThemedView"
import { useThemeColor } from "@/hooks/useThemeColor"

export default function MyBookList() {
  const [favoriteBooks, setFavoriteBooks] = useState<BookWithStatus[]>([])
  const [selectedBook, setSelectedBook] = useState<BookWithStatus | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
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

  const filteredBooks = favoriteBooks.filter((book) =>
    filter ? book.readingStatus === filter : book.readingStatus === undefined,
  )

  const getFilterDescription = () => {
    switch (filter) {
      case "Por leer":
        return "Aquí se encuentran los libros que aún no has leído y están pendientes en tu lista."
      case "Leyendo":
        return 'Estos son los libros que estás leyendo actualmente. Si seleccionas el botón de "Actualizar página", se anotará el número de página hasta donde leíste para que no te pierdas y puedas retomar desde ese punto la próxima vez.'
      case "Leído":
        return "Aquí verás los libros que ya has terminado de leer."
      default:
        return "Estos son los libros a los que aún no les has asignado un estado de lectura."
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: headerColor, dark: headerColor }}
      headerImage={
        <Animatable.Image
          animation="wobble"
          iterationCount={2}
          duration={2000}
          direction="alternate"
          source={
            colorScheme === "dark"
              ? require("@/assets/images/destacadoLibros.png")
              : require("@/assets/images/destacadoLibros-light.png")
          }
          style={styles.headerImage}
        />
      }
    >
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
            <View style={styles.filterButtons}>
              <ThemedButton
                textLightColor={textColor}
                textDarkColor={textColor}
                title="Por leer"
                onPress={() => setFilter("Por leer")}
              />
              <ThemedButton
                textLightColor={textColor}
                textDarkColor={textColor}
                title="Leyendo"
                onPress={() => setFilter("Leyendo")}
              />
              <ThemedButton
                textLightColor={textColor}
                textDarkColor={textColor}
                title="Leídos"
                onPress={() => setFilter("Leído")}
              />
              <ThemedButton
                textLightColor={textColor}
                textDarkColor={textColor}
                title="No establecido"
                onPress={() => setFilter(null)}
              />
            </View>
            <ThemedText type="subtitle" style={[styles.descriptionText, { color: headerColor }]}>
              {getFilterDescription()}
            </ThemedText>
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <View style={styles.bookItemContainer}>
                  <BookItem
                    title={item.title}
                    author={item.author_name?.join(", ")}
                    coverUrl={item.cover_i}
                    bookKey={item.key}
                    firstPublishYear={item.first_publish_year}
                    editionCount={item.edition_count}
                    description={item.description}
                    onPress={() => handleSelectBook(item)}
                  />
                  <ThemedView style={{ flexDirection: "row", justifyContent: "center", marginTop: 8, gap: 4 }}>
                    {item.readingStatus === "Leyendo" && (
                      <ThemedButton
                        lightColor="#4CAF50"
                        darkColor="#4CAF50"
                        textLightColor={textColor}
                        textDarkColor={textColor}
                        title="Actualizar página"
                        onPress={() => handleUpdatePage(item)}
                      />
                    )}
                    <ThemedButton
                      lightColor="#E63946"
                      darkColor="#E63946"
                      textLightColor={textColor}
                      textDarkColor={textColor}
                      title="Borrar de favoritos"
                      onPress={() => confirmRemoveBook(item.key)}
                    />
                  </ThemedView>
                  <ThemedText type="default" style={[styles.statusText, { color: textColor }]}>
                    Estado: {item.readingStatus || "No establecido"}
                  </ThemedText>
                  {item.readingStatus === "Leyendo" && (
                    <ThemedText type="default" style={[styles.pageText, { color: textColor }]}>
                      Página actual: {item.currentPage || "No establecida"}
                    </ThemedText>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <ThemedText type="subtitle" style={[styles.emptyText, { color: textColor }]}>
                  No tienes libros en esta categoría.
                </ThemedText>
              }
            />
          </>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Si borras este libro, se eliminará de tu lista de favoritos. La única forma de volver a encontrarlo será
              buscándolo en el buscador de libros. ¿Deseas continuar?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#E63946" }]} onPress={handleRemoveBook}>
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#A9A9A9" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
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
        <View style={ styles.modalContainer}>
          <View style={styles.modalView}>
            <ThemedText type="default" style={styles.modalText}>
            Ingresa la página actual para "{pageInputBook?.title}":
            </ThemedText>
            <TextInput
              style={styles.pageInput}
              keyboardType="numeric"
              value={currentPage}
              onChangeText={setCurrentPage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#4CAF50" }]} onPress={handleSavePage}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#A9A9A9" }]}
                onPress={() => setPageInputVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    maxWidth: 800,
    margin: "auto",
  },
  headerImage: {
    height: 500,
    width: "100%",
    objectFit: "cover",
    position: "absolute",
    top: -125,
  },
  title: {
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },
  bookItemContainer: {
    marginBottom: 20,
    maxWidth: 600,
  },
  statusText: {
    marginTop: 5,
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: '#000'
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  descriptionText: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  },
  pageInputContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  pageText: {
    marginBottom: 5,
  },
  pageInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 100,
    textAlign: "center",
  },
})
