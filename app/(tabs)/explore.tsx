import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList} from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/ThemedText';
import { getBookList, removeBookFromList, BookWithStatus } from '@/services/api';
import BookItem from '@/components/BookItem';
import BookDetail from '@/components/BookDetail';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const [favoriteBooks, setFavoriteBooks] = useState<BookWithStatus[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookWithStatus | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    loadFavoriteBooks();
  }, []);

  const loadFavoriteBooks = async () => {
    const books = await getBookList('favoritos');
    setFavoriteBooks(books);
  };

  const handleSelectBook = (book: BookWithStatus) => {
    setSelectedBook(book);
  };

  const handleBackToList = () => {
    setSelectedBook(null);
    loadFavoriteBooks(); // Recargar la lista por si se han hecho cambios
  };

  const handleRemoveBook = async (bookKey: string) => {
    await removeBookFromList(bookKey, 'favoritos');
    loadFavoriteBooks();
  };

  const filteredBooks = favoriteBooks.filter(book => 
    filter ? book.readingStatus === filter : book.readingStatus === undefined
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Animatable.Image
          animation="wobble"
          iterationCount={2}
          duration={2000}
          direction="alternate"
          source={require('@/assets/images/destacado.png')}
          style={styles.headerImage}
        />
      }>
      <View style={styles.contentContainer}>
       {selectedBook ? (
          <BookDetail 
            book={selectedBook} 
            onBack={handleBackToList}
            onSelectBook={handleSelectBook}
          />
        ) : (
          <>
            <ThemedText type="title" lightColor='#ed8772' darkColor='#ffcf65' style={styles.title}>Tus libros favoritos</ThemedText>
            <View style={styles.filterButtons}>
              <ThemedButton title="Por leer" onPress={() => setFilter('Por leer')} />
              <ThemedButton title="Leyendo" onPress={() => setFilter('Leyendo')} />
              <ThemedButton title="Leídos" onPress={() => setFilter('Leído')} />
              <ThemedButton title="No establecido" onPress={() => setFilter(null)} />
            </View>
            <FlatList
              data={filteredBooks}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <View style={styles.bookItemContainer}>
                  <BookItem
                    title={item.title}
                    author={item.author_name?.join(', ')}
                    coverUrl={item.cover_i}
                    bookKey={item.key}
                    firstPublishYear={item.first_publish_year}
                    editionCount={item.edition_count}
                    description={item.description}
                    onPress={() => handleSelectBook(item)}
                  />
                  <ThemedView style={{flexDirection: 'row', justifyContent: 'center'}}>
                    <ThemedButton
                      lightColor="#e91111"
                      darkColor="#e91111"
                      textLightColor="#000"
                      textDarkColor="#FFF"
                      title="Eliminar"
                      onPress={() => handleRemoveBook(item.key)}
                    />
                  </ThemedView>
                  <ThemedText type="default" style={styles.statusText}>
                    Estado: {item.readingStatus || 'No establecido'}
                  </ThemedText>
                </View>
              )}
              ListEmptyComponent={
                <ThemedText type="subtitle" style={styles.emptyText}>
                  No tienes libros en esta categoría.
                </ThemedText>
              }
            />
          </>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    maxWidth: 800,
    margin:'auto'
  },
  headerImage: {
    height: 500,
    width: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: -125
  },
  title: {
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  bookItemContainer: {
    marginBottom: 20,
    maxWidth: 600
  },
  statusText: {
    marginTop: 5,
    fontStyle: 'italic',
  },
});
