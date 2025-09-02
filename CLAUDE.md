# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start
# or
expo start

# Platform-specific builds
npm run android    # Android development
npm run ios        # iOS development  
npm run web        # Web development

# Code quality
npm run lint       # Run Expo linter
```

## Project Architecture

### Core Structure
- **Expo Router**: File-based navigation system using `app/` directory structure
- **Context Architecture**: Global state management via React Context (`contexts/BookContext.tsx`)
- **API Layer**: Google Books API integration in `services/api.ts`
- **Component Library**: Reusable themed components in `components/`

### Key Technologies
- **Expo SDK 52** with new architecture enabled
- **React Native 0.76** with TypeScript
- **NativeWind** for TailwindCSS styling
- **AsyncStorage** for local data persistence
- **Google Books API** for book data

### State Management
- **BookContext**: Central state for favorite books, reading status, and book management
- **AsyncStorage**: Local persistence for favorites and reading progress
- **Reading Status Types**: "Leído", "Por leer", "Leyendo"

### Navigation Structure
```
app/
├── _layout.tsx           # Root layout with theme provider
├── (tabs)/              # Tab-based navigation
│   ├── _layout.tsx      # Tab layout
│   ├── index.tsx        # Home/search screen
│   └── myBookList.tsx   # Favorites screen
└── +not-found.tsx       # 404 handler
```

### API Integration
- **Search Books**: `searchBooks(query)` - searches Google Books API
- **Free Books**: `searchBooksReadOnLine()` - finds free/public domain books
- **Book Details**: `getBookDetails(bookId)` - fetches detailed book information
- **Recommendations**: `getRecommendedBooks(bookId)` - finds books by same author

### Component Architecture
- **Themed Components**: `ThemedText`, `ThemedView`, `ThemedButton` for consistent styling
- **Book Components**: `BookItem`, `BookDetail`, `FreeBookCarousel` for book display
- **Search**: `SearchBar`, `HomeSearchBook` for search functionality

### Configuration Notes
- **API key managed in `config.ts`**: Uses `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` environment variable
- **Environment Setup**: Copy `.env.example` to `.env` and configure API key
- TypeScript path aliases: `@/*` maps to project root
- Expo's new architecture enabled for performance
- Automatic theme switching (light/dark) based on system preferences

### Performance Optimizations
- **API Caching**: 5-minute cache for search results in `utils/performance.ts`
- **Debounced Search**: 300ms debounce in `hooks/useSearch.ts`
- **Optimistic Updates**: Instant UI feedback in BookContext
- **Batch Requests**: Rate limiting prevention in API calls
- **Image Optimization**: Size-optimized URLs for book covers

### Security & Validation
- Input validation and sanitization in `utils/validation.ts`
- Secure API key management through environment variables
- Error handling without sensitive data exposure
- XSS prevention in description cleaning

### Accessibility Features
- Comprehensive accessibility labels in `utils/accessibility.ts`
- Screen reader support for all interactive elements
- WCAG 2.1 AA compliance basics
- Semantic HTML roles and ARIA attributes

### Data Flow (Updated)
1. User searches → Validation → Debounced API call → Cached results → UI
2. User favorites book → Optimistic update → API call → Error recovery if needed
3. Reading status updates → Instant UI update → Background sync → Rollback on error
4. Book details → Cache check → API fetch → Display with recommendations

### Error Handling
- Global error boundaries in components
- Retry mechanisms for failed API calls
- User-friendly error messages
- Automatic error recovery where possible