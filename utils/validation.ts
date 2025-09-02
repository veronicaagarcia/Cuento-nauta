/**
 * Validation utilities for input sanitization and data validation
 */

// Search query validation
export const validateSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== 'string') return false;
  const trimmed = query.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

// Sanitize search query to prevent injection
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[&]/g, '') // Remove ampersands that could cause API issues
    .trim();
};

// Validate book ID format (Google Books uses alphanumeric IDs)
export const validateBookId = (bookId: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(bookId) && bookId.length <= 50;
};

// Validate reading status
export const validateReadingStatus = (status: string): boolean => {
  const validStatuses = ["Leído", "Por leer", "Leyendo"];
  return validStatuses.includes(status);
};

// Clean and format description with better security
export const cleanAndFormatDescription = (description: string): string => {
  if (!description || typeof description !== 'string') return '';
  
  // More comprehensive HTML tag removal
  let cleanText = description.replace(/<[^>]*>/g, '');
  
  // Remove potential script content
  cleanText = cleanText.replace(/javascript:/gi, '');
  
  // Normalize whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Limit description length
  if (cleanText.length > 1000) {
    cleanText = cleanText.substring(0, 1000) + '...';
  }
  
  return cleanText;
};

// Validate URL for book previews
export const validatePreviewUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && 
           (urlObj.hostname.includes('google.com') || urlObj.hostname.includes('books.google.com'));
  } catch {
    return false;
  }
};