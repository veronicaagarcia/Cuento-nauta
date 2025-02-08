import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, useColorScheme } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import * as Animatable from 'react-native-animatable';
import { ThemedText } from '@/components/ThemedText';
import { getBookList, removeBookFromList, BookWithStatus, Book } from '@/services/api';
import BookItem from '@/components/BookItem';
import BookDetail from '@/components/BookDetail';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabTwoScreen() {
  const [favoriteBooks, setFavoriteBooks] = useState<BookWithStatus[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookWithStatus | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const headerColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

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
      headerBackgroundColor={{ light: headerColor, dark: headerColor }}
      headerImage={
        <Animatable.Image
          animation="wobble"
          iterationCount={2}
          duration={2000}
          direction="alternate"
          source={
            colorScheme === 'dark'
              ? require('@/assets/images/destacadoLibros.png') 
              : require('@/assets/images/destacadoLibros-light.png') 
          }
          style={styles.headerImage}
        />
      }>
      <View style={styles.contentContainer}>
       {selectedBook ? (
          <BookDetail 
            book={selectedBook}
            onBack={handleBackToList}
            onSelectBook={handleSelectBook} onAddToFavorites={function (book: Book): Promise<void> {
              throw new Error('Function not implemented.');
            } } onRemoveFromFavorites={function (bookKey: string): Promise<void> {
              throw new Error('Function not implemented.');
            } }          />
        ) : (
          <>
            {/* <ThemedText type="title" lightColor={headerColor} darkColor={headerColor} style={styles.title}>Tus libros favoritos</ThemedText> */}
            <View style={styles.filterButtons}>
              <ThemedButton textLightColor={textColor} textDarkColor={textColor} title="Por leer" onPress={() => setFilter('Por leer')} />
              <ThemedButton textLightColor={textColor} textDarkColor={textColor} title="Leyendo" onPress={() => setFilter('Leyendo')} />
              <ThemedButton textLightColor={textColor} textDarkColor={textColor} title="Leídos" onPress={() => setFilter('Leído')} />
              <ThemedButton textLightColor={textColor} textDarkColor={textColor} title="No establecido" onPress={() => setFilter(null)} />
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
                      lightColor="#E63946"
                      darkColor="#E63946"
                      textLightColor={textColor}
                      textDarkColor={textColor}
                      title="Eliminar"
                      onPress={() => handleRemoveBook(item.key)}
                    />
                  </ThemedView>
                  <ThemedText type="default"  style={[styles.statusText, { color: textColor }]}>
                    Estado: {item.readingStatus || 'No establecido'}
                  </ThemedText>
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
