import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_API_KEY } from "../config"

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
  readingStatus?: ReadingStatus
};
export type BookWithStatus = Book & {
  readingStatus?: ReadingStatus;
};

// limpia etiquetas html, espacios en blanco y pone saltos en linea
const cleanAndFormatDescription = (description: string): string => {
  // Eliminar todas las etiquetas HTML
  let cleanText = description.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Reemplazar múltiples espacios en blanco por uno solo
  cleanText = cleanText.replace(/\s+/g, " ");
  
  // Eliminar espacios en blanco al principio y al final
  cleanText = cleanText.trim();
  
  // Añadir saltos de línea después de cada oración, pero evitar hacerlo para iniciales como "J. M. Barrie"
  cleanText = cleanText.replace(/(\b[A-Z]\.) (\b[A-Z]\.)/g, "$1$2"); // Temporalmente eliminar espacio entre iniciales
  cleanText = cleanText.replace(/(\.[A-Z]\.)/g, "$1##"); // Marcar puntos de iniciales
  cleanText = cleanText.replace(/(\.[\s\n]+)/g, ".\n\n"); // Añadir saltos de línea después de puntos
  cleanText = cleanText.replace(/(##)/g, " "); // Restaurar espacio entre iniciales
  
  return cleanText;
};

// Busca libros de acuerdo a lo q escriba el usuario en el buscador 
// export const searchBooks = async (query: string): Promise<Book[]> => {

//   const response = await fetch(
//     `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${MY_API_KEY}`,
//   )

//   if (!response.ok) {
//     throw new Error(`Error en la solicitud: ${response.statusText}`)
//   }
//   const data = await response.json()

//   return data.items.map((item: any) => ({
//     key: item.id,
//     title: item.volumeInfo.title,
//     author_name: item.volumeInfo.authors,
//     cover_i: item.volumeInfo.imageLinks?.thumbnail,
//     first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
//     edition_count: item.volumeInfo.industryIdentifiers?.length,
//     description: cleanAndFormatDescription(item.volumeInfo.description || ""),
//     isFullyAccessible: item.accessInfo.accessViewStatus === "FULL_PUBLIC_DOMAIN",
//     previewLink: item.accessInfo.webReaderLink,
//   }))
// }
export const searchBooks = async (query: string): Promise<Book[]> => {
  const resultsPerPage = 10
  const totalResults = 50
  const orderBy = "relevance"
  let books: Book[] = []

  try {
    for (let startIndex = 0; startIndex < totalResults; startIndex += resultsPerPage) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${resultsPerPage}&startIndex=${startIndex}&orderBy=${orderBy}&key=${MY_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        console.warn("No se encontraron más libros en esta página de resultados")
        break // Salimos del bucle si no hay más resultados
      }

      const fetchedBooks = data.items.map((item: any) => ({
        key: item.id,
        title: item.volumeInfo.title,
        author_name: item.volumeInfo.authors,
        cover_i: item.volumeInfo.imageLinks?.thumbnail,
        first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
        edition_count: item.volumeInfo.industryIdentifiers?.length,
        description: cleanAndFormatDescription(item.volumeInfo.description || ""),
        isFullyAccessible: item.accessInfo.accessViewStatus === "FULL_PUBLIC_DOMAIN",
        previewLink: item.accessInfo.webReaderLink,
      }))

      books = [...books, ...fetchedBooks]
    }

    console.log(`Total de libros encontrados: ${books.length}`)
    return books
  } catch (error) {
    console.error("Error al buscar libros para leer en línea:", error)
    throw error
  }

}

// busca por leer on line
export const searchBooksReadOnLine = async (): Promise<Book[]> => {
  const resultsPerPage = 40
  const totalResults = 120
  const query = "subject:fiction" // Cambiamos la consulta para obtener libros de ficción
  const orderBy = "relevance" // Mantenemos el orden por relevancia
  let books: Book[] = []

  try {
    for (let startIndex = 0; startIndex < totalResults; startIndex += resultsPerPage) {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${resultsPerPage}&startIndex=${startIndex}&filter=free-ebooks&orderBy=${orderBy}&printType=books&key=${MY_API_KEY}`,
      )

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.items || data.items.length === 0) {
        console.warn("No se encontraron más libros en esta página de resultados")
        break // Salimos del bucle si no hay más resultados
      }

      const fetchedBooks = data.items.map((item: any) => ({
        key: item.id,
        title: item.volumeInfo.title,
        author_name: item.volumeInfo.authors,
        cover_i: item.volumeInfo.imageLinks?.thumbnail,
        first_publish_year: item.volumeInfo.publishedDate?.slice(0, 4),
        edition_count: item.volumeInfo.industryIdentifiers?.length,
        description: cleanAndFormatDescription(item.volumeInfo.description || ""),
        isFullyAccessible: item.accessInfo.accessViewStatus === "FULL_PUBLIC_DOMAIN",
        previewLink: item.accessInfo.webReaderLink,
      }))

      books = [...books, ...fetchedBooks]
    }

    console.log(`Total de libros encontrados: ${books.length}`)
    return books
  } catch (error) {
    console.error("Error al buscar libros para leer en línea:", error)
    throw error
  }
}


// Trae mas info como la descripcion del libro
export const getBookDetails = async (bookId: string): Promise<Book> => {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${MY_API_KEY}`);

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }
  const data = await response.json();
  
  return {
    key: data.id,
    title: data.volumeInfo.title,
    author_name: data.volumeInfo.authors,
    cover_i: data.volumeInfo.imageLinks?.thumbnail,
    first_publish_year: data.volumeInfo.publishedDate?.slice(0, 4),
    edition_count: data.volumeInfo.industryIdentifiers?.length,
    description: cleanAndFormatDescription(data.volumeInfo.description || ''),
    isFullyAccessible: data.accessInfo.accessViewStatus === "FULL_PUBLIC_DOMAIN",
    previewLink: data.accessInfo.webReaderLink,
  };
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
