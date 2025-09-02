import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_API_KEY } from "../config";
import { 
  validateSearchQuery, 
  sanitizeSearchQuery, 
  validateBookId, 
  cleanAndFormatDescription as cleanDescription,
  validatePreviewUrl 
} from "../utils/validation";

// Function to clean HTML tags and translate common English phrases
const cleanAndTranslateDescription = (description: string): string => {
  if (!description || description.trim() === '') {
    return '';
  }
  
  // Remove HTML tags
  let cleaned = description.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Basic translations for common English phrases
  const translations = {
    'From the bestselling author': 'Del autor bestseller',
    'A New York Times bestseller': 'Un bestseller del New York Times',
    'The story follows': 'La historia sigue a',
    'In this novel': 'En esta novela',
    'A tale of': 'Una historia de',
    'The main character': 'El personaje principal',
    'Set in': 'Ambientada en',
    'This book tells': 'Este libro cuenta',
    'A story about': 'Una historia sobre',
    'The author of': 'El autor de',
    'In this compelling': 'En esta fascinante',
    'A gripping tale': 'Una historia cautivadora',
    'From the author': 'Del autor',
    'Based on': 'Basada en',
    'An unforgettable': 'Una inolvidable',
    'The critically acclaimed': 'La aclamada por la crítica'
  };
  
  // Apply basic translations
  for (const [english, spanish] of Object.entries(translations)) {
    const regex = new RegExp(english, 'gi');
    cleaned = cleaned.replace(regex, spanish);
  }
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};
import { apiCache, batchRequestManager, optimizeImageUrl } from "../utils/performance";

export type ReadingStatus = "Leído" | "Por leer" | "Leyendo"
export type Book = {
  bookKey?: string | null | undefined;
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: string;
  first_publish_year?: string;
  edition_count?: number;
  description?: string;
  isFullyAccessible?: boolean;
  previewLink?: string;
  readingStatus?: ReadingStatus;
  currentPage?: number;
};
export type BookWithStatus = Book & {
  readingStatus?: ReadingStatus;
};

// Helper function to transform API response to Book object
const transformBookData = (item: any): Book => {
  return {
    key: item.id,
    title: item.volumeInfo.title || 'Título no disponible',
    author_name: item.volumeInfo.authors || [],
    cover_i: optimizeImageUrl(item.volumeInfo.imageLinks?.thumbnail),
    first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
    edition_count: item.volumeInfo.industryIdentifiers?.length,
    description: cleanDescription(item.volumeInfo.description || ""),
    isFullyAccessible: item.accessInfo?.accessViewStatus === "FULL_PUBLIC_DOMAIN",
    previewLink: validatePreviewUrl(item.accessInfo?.webReaderLink || '') ? item.accessInfo.webReaderLink : undefined,
  };
};

// Optimized book search with validation, caching, and better error handling
export const searchBooks = async (query: string, maxResults: number = 20): Promise<Book[]> => {
  // Input validation
  if (!validateSearchQuery(query)) {
    throw new Error('Consulta de búsqueda inválida. Debe tener entre 2 y 100 caracteres.');
  }

  const sanitizedQuery = sanitizeSearchQuery(query);
  const cacheKey = `search_${sanitizedQuery}_${maxResults}`;
  
  // Check cache first
  const cachedResult = apiCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const resultsPerPage = 10;
  const orderBy = "relevance";
  let books: Book[] = [];

  try {
    // Limit concurrent requests to avoid rate limiting
    const totalPages = Math.min(Math.ceil(maxResults / resultsPerPage), 5); // Max 5 pages
    
    const requests = Array.from({ length: totalPages }, (_, index) => {
      const startIndex = index * resultsPerPage;
      return () => fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(sanitizedQuery)}&maxResults=${resultsPerPage}&startIndex=${startIndex}&orderBy=${orderBy}&key=${MY_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );
    });

    // Process requests with batch manager to avoid overwhelming the API
    const responses = await Promise.allSettled(
      requests.map(request => batchRequestManager.add(request))
    );

    for (const response of responses) {
      if (response.status === 'fulfilled' && response.value.ok) {
        const data = await response.value.json();
        
        if (data.items && Array.isArray(data.items)) {
          const fetchedBooks = data.items
            .filter((item: any) => item?.id && item?.volumeInfo?.title) // Basic validation
            .map(transformBookData);
          
          books.push(...fetchedBooks);
        }
      }
    }

    // Remove duplicates based on book key
    const uniqueBooks = books.filter((book, index, self) => 
      index === self.findIndex(b => b.key === book.key)
    );

    // Limit results to requested amount
    const limitedBooks = uniqueBooks.slice(0, maxResults);

    // Cache the result
    apiCache.set(cacheKey, limitedBooks);

    return limitedBooks;
    
  } catch (error) {
    console.error("Error al buscar libros:", error);
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw new Error('La búsqueda tardó demasiado. Por favor, intenta de nuevo.');
      }
      if (error.message.includes('Network')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
    }
    
    throw new Error('Error al buscar libros. Por favor, intenta de nuevo.');
  }
};

// Enhanced function for featured books with multiple fallbacks
export const searchBooksReadOnLine = async (): Promise<Book[]> => {
  if (!MY_API_KEY) {
    throw new Error('API key no configurada');
  }

  // Multiple search strategies for novels and popular fiction
  const searchQueries = [
    // Popular novels in Spanish
    `q=novela+ficción&langRestrict=es&maxResults=15&orderBy=relevance&printType=books`,
    // Bestseller fiction books
    `q=fiction+bestseller+-thesis+-research+-academic&maxResults=15&orderBy=relevance&printType=books`,
    // Popular novels
    `q=novel+popular+-dissertation+-academic+-research&maxResults=15&orderBy=relevance&printType=books`,
    // Classic literature
    `q=literatura+clásica&langRestrict=es&maxResults=15&orderBy=relevance&printType=books`,
    // Popular fiction authors
    `q=inauthor:"Stephen King" OR inauthor:"Paulo Coelho" OR inauthor:"Dan Brown"&maxResults=15&orderBy=relevance&printType=books`
  ];

  for (let i = 0; i < searchQueries.length; i++) {
    try {
      console.log(`Intentando búsqueda ${i + 1}/${searchQueries.length}`);
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${searchQueries[i]}&key=${MY_API_KEY}`
      );

      if (!response.ok) {
        console.warn(`Error en búsqueda ${i + 1}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const books = data.items
          .filter((item: any) => 
            item?.id && 
            item?.volumeInfo?.title &&
            item?.volumeInfo?.imageLinks?.thumbnail // Prefer books with covers
          )
          .filter((item: any) => {
            const title = item.volumeInfo?.title?.toLowerCase() || '';
            const description = item.volumeInfo?.description?.toLowerCase() || '';
            const authors = item.volumeInfo?.authors?.join(' ')?.toLowerCase() || '';
            const categories = item.volumeInfo?.categories?.join(' ')?.toLowerCase() || '';
            
            // Exclude academic/research documents
            const academicTerms = [
              'dissertation', 'thesis', 'phd', 'research', 'academic', 'university',
              'journal', 'proceedings', 'conference', 'study', 'analysis', 'doctoral',
              'master', 'bachelor', 'degree', 'paper', 'article', 'essay', 'report',
              'tesis', 'investigación', 'académico', 'universidad', 'estudio', 'análisis'
            ];
            
            const hasAcademicTerms = academicTerms.some(term => 
              title.includes(term) || description.includes(term) || 
              authors.includes(term) || categories.includes(term)
            );
            
            // Only include fiction, novels, and popular books
            const fictionTerms = [
              'fiction', 'novel', 'story', 'tale', 'romance', 'mystery', 'thriller',
              'fantasy', 'adventure', 'drama', 'literature', 'classic',
              'ficción', 'novela', 'historia', 'cuento', 'literatura', 'clásico'
            ];
            
            const isFiction = fictionTerms.some(term => 
              title.includes(term) || description.includes(term) || categories.includes(term)
            );
            
            return !hasAcademicTerms && (isFiction || !categories.includes('education'));
          })
          .map((item: any) => ({
            key: item.id,
            title: item.volumeInfo.title,
            author_name: item.volumeInfo.authors || ['Autor desconocido'],
            cover_i: item.volumeInfo.imageLinks?.thumbnail,
            first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
            edition_count: item.volumeInfo.printedPageCount || undefined,
            description: cleanAndTranslateDescription(item.volumeInfo.description || ""),
            isFullyAccessible: item.accessInfo?.accessViewStatus === "FULL_PUBLIC_DOMAIN" || 
                              item.accessInfo?.webReaderLink,
            previewLink: item.accessInfo?.webReaderLink || item.volumeInfo?.previewLink,
          }))
          .slice(0, 12); // Ensure we get max 12 books

        console.log(`✅ Encontrados ${books.length} libros con estrategia ${i + 1}`);
        return books;
      }
    } catch (error) {
      console.warn(`Error en estrategia ${i + 1}:`, error);
      continue;
    }
  }

  // If all strategies fail, return empty array
  console.warn("No se pudieron cargar libros con ninguna estrategia");
  return [];
};

// Simplified book details function
export const getBookDetails = async (bookId: string): Promise<Book> => {
  if (!MY_API_KEY) {
    throw new Error('API key no configurada');
  }

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${MY_API_KEY}`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      key: data.id,
      title: data.volumeInfo?.title || 'Título no disponible',
      author_name: data.volumeInfo?.authors || [],
      cover_i: data.volumeInfo?.imageLinks?.thumbnail || undefined,
      first_publish_year: data.volumeInfo?.publishedDate?.slice(0, 4) || undefined,
      edition_count: data.volumeInfo?.printedPageCount || undefined,
      description: cleanAndTranslateDescription(data.volumeInfo?.description || ''),
      isFullyAccessible: data.accessInfo?.accessViewStatus === "FULL_PUBLIC_DOMAIN" || false,
      previewLink: data.accessInfo?.webReaderLink || undefined,
    };
  } catch (error) {
    console.error('Error al obtener detalles del libro:', error);
    throw new Error(error instanceof Error ? error.message : 'Error al obtener detalles del libro');
  }
};

// Trae los libros del mismo autor del libro q se selecciono
export const getRecommendedBooks = async (bookId: string): Promise<Book[]> => {
  const bookDetails = await getBookDetails(bookId);
  const author = bookDetails.author_name?.[0] || '';
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${author}&key=${MY_API_KEY}`);
  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }
  const data = await response.json();
  return data.items
    .filter((item: any) => item.id !== bookId)
    .map((item: any) => ({
      key: item.id,
      title: item.volumeInfo.title,
      author_name: item.volumeInfo.authors,
      cover_i: item.volumeInfo.imageLinks?.thumbnail,
      first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
      edition_count: item.volumeInfo.industryIdentifiers?.length,
      description: item.volumeInfo.description,
    }));
};

// Actualiza el estado de lectura de un libro
export const updateBookStatus = async (bookKey: string, status: ReadingStatus) => {
  try {
    const existingList = await AsyncStorage.getItem('favoritos');
    if (existingList) {
      let bookList: BookWithStatus[] = JSON.parse(existingList);
      const updatedList = bookList.map(book => 
        book.key === bookKey ? { ...book, readingStatus: status } : book
      );
      await AsyncStorage.setItem('favoritos', JSON.stringify(updatedList));
    }
  } catch (error) {
    console.error('Error updating book status:', error);
  }
};

// Guardar libro en favoritos
export const saveBookToList = async (book: BookWithStatus, listName: string) => {
  try {
    const existingList = await AsyncStorage.getItem(listName);
    let bookList = existingList ? JSON.parse(existingList) : [];
    const existingBookIndex = bookList.findIndex((b: BookWithStatus) => b.key === book.key);
    if (existingBookIndex !== -1) {
      // Actualizar el libro existente
      bookList[existingBookIndex] = { ...bookList[existingBookIndex], ...book };
    } else {
      // Añadir el nuevo libro
      bookList.push(book);
    }
    await AsyncStorage.setItem(listName, JSON.stringify(bookList));
  } catch (error) {
    console.error('Error saving book to list:', error);
  }
};

// Traer la lista de libros
export const getBookList = async (listName: string): Promise<BookWithStatus[]> => {
  try {
    const list = await AsyncStorage.getItem(listName);
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error('Error getting book list:', error);
    return [];
  }
};

// Eliminar libro de la lista
export const removeBookFromList = async (bookKey: string, listName: string) => {
  try {
    const existingList = await AsyncStorage.getItem(listName);
    if (existingList) {
      let bookList: Book[] = JSON.parse(existingList);
      bookList = bookList.filter(book => book.key !== bookKey);
      await AsyncStorage.setItem(listName, JSON.stringify(bookList));
    }
  } catch (error) {
    console.error('Error removing book from list:', error);
  }
};

// Para guardar el numero de pagina en donde te quedaste leyendo un libro
export const saveCurrentPage = async (bookKey: string, page: number) => {
  try {
    const existingList = await AsyncStorage.getItem("favoritos")
    if (existingList) {
      const bookList: BookWithStatus[] = JSON.parse(existingList)
      const updatedList = bookList.map((book) => (book.key === bookKey ? { ...book, currentPage: page } : book))
      await AsyncStorage.setItem("favoritos", JSON.stringify(updatedList))
    }
  } catch (error) {
    console.error("Error saving current page:", error)
  }
}

// Nueva función para obtener la página actual
export const getCurrentPage = async (bookKey: string): Promise<number | undefined> => {
  try {
    const existingList = await AsyncStorage.getItem("favoritos")
    if (existingList) {
      const bookList: BookWithStatus[] = JSON.parse(existingList)
      const book = bookList.find((book) => book.key === bookKey)
      return book?.currentPage
    }
  } catch (error) {
    console.error("Error getting current page:", error)
  }
  return undefined
}
