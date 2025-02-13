import type React from "react"
import { useEffect, useState } from "react"
import { View, ScrollView, Image, StyleSheet, ActivityIndicator, Linking, Text, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { getRecommendedBooks, getBookDetails, type ReadingStatus, type Book } from "@/services/api"
import { ThemedButton } from "@/components/ThemedButton"
import BookItem from "./BookItem"
import { Picker } from "@react-native-picker/picker"
import { ThemedView } from "./ThemedView"
import { useThemeColor } from "@/hooks/useThemeColor"
import { useBookContext } from "@/contexts/BookContext"

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
  const [isHovered, setIsHovered] = useState(false);
  const arrowColor = useThemeColor({}, "tint")
  const buttonColor = useThemeColor({}, "content")
  const button = useThemeColor({}, "button")
  const textColor = useThemeColor({}, "text")
  const secondText = useThemeColor({}, "tint")

  const { updateBookReadingStatus, toggleFavorite, isFavorite } = useBookContext()

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
      setCurrentBook((prev) => ({ ...prev, readingStatus: status }))
      setSaveMessage(`Estado actualizado a: ${status}`)
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("Error al actualizar el estado del libro:", error)
      setSaveMessage("Error al actualizar el estado")
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
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedButton
        style={{
          borderRadius: 100,
          borderWidth: 2,
          borderColor: textColor,
          position: "absolute",
          left: 0,
          top: 0,
          marginBottom: 4,
        }}
        lightColor={buttonColor}
        darkColor={buttonColor}
        textLightColor={arrowColor}
        textDarkColor={arrowColor}
        title="🢀"
        onPress={onBack}
      />
      <br />
      <View style={styles.imageContainer}>
        {currentBook.cover_i && <Image source={{ uri: currentBook.cover_i }} style={styles.image} />}
        <TouchableOpacity
          style={[styles.favoriteButton, isHovered ? styles.favoriteButtonHovered : null,]}
          onPress={handleToggleFavorite}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Text style={{ color: isFavorite(currentBook.key) ? `red` : `${secondText}` }}>
            {isFavorite(currentBook.key) ? '❤' : '♡'}
          </Text>
          {isHovered && (
          <Text style={[{color: `${secondText}`}, {position:'absolute'}, {top: 30}, {left:'50%'}, {backgroundColor:'black'}, {transform: [{ translateX: '-50%' }]}, {padding: 3}, {borderRadius: 4}, {fontSize: 8}, {textAlign: 'center'}]}>
            {isFavorite(currentBook.key) ? 'Borrar de favoritos' : 'Agregar a favoritos'}
          </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <ThemedText darkColor={secondText} lightColor={secondText} type="title">
          {currentBook.title}
        </ThemedText>
        <ThemedText darkColor={textColor} lightColor={textColor} type="default">
          de: {currentBook.author_name?.join(", ") || "Autor desconocido"}
        </ThemedText>
      </View>
      {currentBook.first_publish_year && (
        <ThemedText type="default" darkColor={textColor} lightColor={textColor} style={styles.publishYear}>
          Publicado en: {currentBook.first_publish_year}
        </ThemedText>
      )}
      {currentBook.edition_count && (
        <ThemedText darkColor={textColor} lightColor={textColor} type="default">
          Ediciones: {currentBook.edition_count}
        </ThemedText>
      )}
      <View style={styles.descriptionContainer}>
        <ThemedText darkColor={textColor} lightColor={textColor} type="default">
          {currentBook.description}
        </ThemedText>
      </View>
      <View style={styles.actionContainer}>
        <ThemedText type="subtitle" style={{ color: button }}>
        Estado de lectura
        </ThemedText>
        <Picker
          selectedValue={currentBook.readingStatus}
          style={[styles.picker, { color: textColor, borderColor: secondText }]}
          onValueChange={(itemValue) => handleStatusChange(itemValue as ReadingStatus)}
        >
          <Picker.Item color={buttonColor} label="No establecido" value={undefined} />
          <Picker.Item color={buttonColor} label="Por leer" value="Por leer" />
          <Picker.Item color={buttonColor} label="Leyendo" value="Leyendo" />
          <Picker.Item color={buttonColor} label="Leído" value="Leído" />
        </Picker>
        {saveMessage && (
          <ThemedText type="default" style={styles.saveMessage}>
            {saveMessage}
          </ThemedText>
        )}
        {loading ? (
          <ActivityIndicator size="large" color={button} />
        ) : currentBook.isFullyAccessible && currentBook.previewLink ? (
          <ThemedButton
            lightColor={button}
            darkColor={button}
            textLightColor={textColor}
            textDarkColor={textColor}
            title="Leer en línea"
            onPress={handleReadOnline}
          />
        ) : (
          <ThemedText style={{ color: textColor }} type="default">
            Este libro no está disponible para lectura gratuita en línea.
          </ThemedText>
        )}
      </View>
      <ThemedView style={styles.containerAuthor}>
        <ThemedText style={{ color: secondText }} type="subtitle">
          Libros del mismo autor
        </ThemedText>
        <br />
        {recommendedBooks.map((recBook) => (
          <BookItem
            key={recBook.key}
            title={recBook.title}
            author={recBook.author_name?.join(", ")}
            coverUrl={recBook.cover_i}
            bookKey={recBook.key}
            firstPublishYear={recBook.first_publish_year}
            editionCount={recBook.edition_count}
            description={recBook.description}
            onPress={() => handleSelectRecommendedBook(recBook)}
          />
        ))}
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    position: "relative",
    margin: 'auto'
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 16,
    marginBottom: 12,
  },
  publishYear: {
    textDecorationLine: "underline",
  },
  descriptionContainer: {
    width: "100%",
    marginVertical: 8,
  },
  actionContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 30,
    marginVertical: 40,
  },
  saveMessage: {
    marginTop: 10,
    color: "#4CAF50",
  },
  picker: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    width: 200,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerAuthor: {
    maxWidth: 800,
  },
  imageContainer:{
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    position: 'relative',
    width: 200,
    height: 300,
    borderRadius: 8,
    marginVertical: 16,
    resizeMode: 'cover'
  },
  favoriteButton: {
    position: "absolute",
    top: 20,
    right: 6,
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonHovered: {
    transform: [{ scale: 1.2 }],
  },
  // hoverText: (secondText: string): TextStyle => ({
  //   position: 'absolute',
  //   top: 30,
  //   left: '50%',
  //   transform: [{ translateX: '-50%' }],
  //   backgroundColor: secondText,
  //   padding: 4,
  //   borderRadius: 4,
  //   fontSize: 8,
  //   textAlign: 'center',
  // }),
})

export default BookDetail;
