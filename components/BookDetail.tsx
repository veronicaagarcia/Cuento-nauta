import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, StyleSheet, ActivityIndicator,  Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getRecommendedBooks, saveBookToList, getBookDetails, updateBookStatus, type ReadingStatus, type Book } from '@/services/api';
import { ThemedButton } from '@/components/ThemedButton';
import BookItem from './BookItem';
import { Picker } from '@react-native-picker/picker';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type BookDetailProps = {
  book: Book;
  onBack: () => void;
  onSelectBook: (book: Book) => void;
};

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onSelectBook }) => {
  const [loading, setLoading] = useState(true)
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([])
  const [currentBook, setCurrentBook] = useState<Book>(book)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const textColor = useThemeColor({}, 'tint');

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


    fetchData();
  }, [currentBook.key]);

  const handleSaveBook = async () => {
    await saveBookToList(currentBook, 'favoritos');
    setSaveMessage('Libro guardado en favoritos');
    setTimeout(() => setSaveMessage(null), 3000); // El mensaje desaparecerá después de 3 segundos
  };

  const handleStatusChange = async (status: ReadingStatus) => {
    const updatedBook = { ...currentBook, readingStatus: status };
    setCurrentBook(updatedBook);
    await updateBookStatus(currentBook.key, status);
    setSaveMessage(`Estado actualizado a: ${status}`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSelectRecommendedBook = async (selectedBook: Book) => {
    setLoading(true);
    try {
      const fullBookDetails = await getBookDetails(selectedBook.key);
      setCurrentBook(fullBookDetails);
      onSelectBook(fullBookDetails);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadOnline = () => {
    if (currentBook.previewLink) {
      Linking.openURL(currentBook.previewLink)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedButton
        style={{borderRadius:100}}
        lightColor="#a35c7a"
        darkColor="#836190"
        textLightColor="#fff"
        textDarkColor="#fff" 
        title="🢀" 
        onPress={onBack} 
      />
      <br/>
      {currentBook.cover_i && <Image source={{ uri: currentBook.cover_i }} style={styles.image} />}
      <View style={styles.titleContainer}>
        <ThemedText type="title">{currentBook.title}</ThemedText>
        <ThemedText type="title">-</ThemedText>
        <ThemedText type="default">{currentBook.author_name?.join(', ') || 'Autor desconocido'}</ThemedText>
      </View>
      
      {currentBook.first_publish_year && (
        <ThemedText type="default" style={styles.publishYear}>
          Publicado en: {currentBook.first_publish_year}
        </ThemedText>
      )}
      {currentBook.edition_count && (
        <ThemedText type="default">Ediciones: {currentBook.edition_count}</ThemedText>
      )}
      <View style={styles.descriptionContainer}>
        <ThemedText type="default">{currentBook.description}</ThemedText>
      </View>
      
      <View style={styles.actionContainer}>
        <ThemedText type='subtitle' style={{ color: textColor }}>Definir o actualizar estado del libro</ThemedText>
        <Picker
          selectedValue={currentBook.readingStatus}
          style={styles.picker}
          onValueChange={(itemValue) => handleStatusChange(itemValue as ReadingStatus)}
        >
          <Picker.Item label="Estado de lectura" value={undefined} />
          <Picker.Item label="Por leer" value="Por leer" />
          <Picker.Item label="Leyendo" value="Leyendo" />
          <Picker.Item label="Leído" value="Leído" />
        </Picker>
        <ThemedButton 
          lightColor="#6B4E78"
          darkColor="#836190"
          textLightColor="#000"
          textDarkColor="#FFF" 
          title="Guardar en favoritos" 
          onPress={handleSaveBook} 
        />
        {saveMessage && <ThemedText type="default" style={styles.saveMessage}>{saveMessage}</ThemedText>}
       
        {loading ? (
          <ActivityIndicator size="large" />
        ) : currentBook.isFullyAccessible && currentBook.previewLink ? (
          <ThemedButton
            lightColor="#ed8772"
            darkColor="#ffcf65"
            textLightColor="#000"
            textDarkColor="#FFF"
            title="Leer en línea"
            onPress={handleReadOnline}
          />
        ) : (
          <ThemedText type="default">Este libro no está disponible para lectura gratuita en línea.</ThemedText>
        )}
      </View>
      
      <ThemedView style={styles.containerAuthor}>
        <ThemedText type="subtitle">Libros del mismo autor</ThemedText>
        <br/>
        {recommendedBooks.map((recBook) => (
          <BookItem
            key={recBook.key}
            title={recBook.title}
            author={recBook.author_name?.join(', ')}
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    gap: 16, 
    marginBottom: 12
  },
  publishYear: {
    textDecorationLine: 'underline'
  },
  descriptionContainer: {
    width: '100%', 
    marginVertical: 8,
  },
  actionContainer: {
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    gap: 30, 
    marginVertical: 40
  },
  saveMessage: {
    marginTop: 10,
    color: 'green',
  },
  picker: {
    paddingHorizontal: 12,
    paddingVertical:10,
    borderRadius: 8,
    width: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerAuthor: {
    maxWidth: 800
  }
});

export default BookDetail;