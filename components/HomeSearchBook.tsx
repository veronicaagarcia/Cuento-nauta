import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import SearchBar from './SearchBar';
import BookItem from './BookItem';
import FreeBookCarousel from './FreeBookCarousel';
import { searchBooks, getBookDetails, Book } from '../services/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import BookDetail from '@/components/BookDetail';

type HomeSearchBookProps = {
  initialBook?: Book | null;
};

const HomeSearchBook: React.FC<HomeSearchBookProps> = ({ initialBook }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook || null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (initialBook) {
      setSelectedBook(initialBook);
    }
  }, [initialBook]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (book: Book) => {
    setLoading(true);
    try {
      const fullBookDetails = await getBookDetails(book.key);
      setSelectedBook(fullBookDetails);
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedBook(null);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      
      {!selectedBook && ( 
        <>
          <FreeBookCarousel onSelectBook={handleSelectBook} />
          <SearchBar 
            value={query} 
            onChangeText={setQuery} 
            onSearch={handleSearch}  
          />
        </>
      )}

      {selectedBook ? (
        <BookDetail book={selectedBook} onBack={handleBackToList} onSelectBook={handleSelectBook} />
      ) : loading ? (
        <ActivityIndicator size="large" color={textColor} />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <BookItem
              key={item.bookKey}
              title={item.title}
              author={item.author_name?.join(', ')}
              coverUrl={item.cover_i}
              bookKey={item.key}
              firstPublishYear={item.first_publish_year}
              editionCount={item.edition_count}
              description={item.description}
              onPress={() => handleSelectBook(item)}
            />
          )}
          ListEmptyComponent={
            <ThemedText type="subtitle" style={styles.emptyText}>
              {hasSearched ? 'No se encontraron libros.' : 'Realiza una búsqueda.'}
            </ThemedText>
          }
        />
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeSearchBook;