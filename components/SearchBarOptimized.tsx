import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions,
  Text 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { validateSearchQuery } from '../utils/validation';
import { ModernColors } from '@/constants/ModernColors';

const { width } = Dimensions.get('window');

type SearchBarOptimizedProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
};

const SearchBarOptimized: React.FC<SearchBarOptimizedProps> = ({ 
  value, 
  onChangeText, 
  onSearch,
  loading = false,
  placeholder = 'Buscar libro por título, autor...',
  maxLength = 100,
  autoFocus = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const backgroundColor = ModernColors.light.surface;
  const textColor = ModernColors.neutral[800];
  const buttonColor = ModernColors.primary[500];
  const errorColor = ModernColors.error[500];
  const borderColor = error ? errorColor : ModernColors.neutral[200];

  const handleSearch = () => {
    const trimmedValue = value.trim();
    
    if (!validateSearchQuery(trimmedValue)) {
      const errorMsg = 'Por favor, ingresa al menos 2 caracteres para buscar';
      setError(errorMsg);
      Alert.alert('Búsqueda inválida', errorMsg);
      return;
    }

    setError(null);
    onSearch(trimmedValue);
    inputRef.current?.blur();
  };

  const handleTextChange = (text: string) => {
    setError(null);
    onChangeText(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const clearSearch = () => {
    onChangeText('');
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused,
        error && styles.searchContainerError
      ]}>
        <View style={styles.searchIcon}>
          <Text style={styles.searchIconText}>🔍</Text>
        </View>
        
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { outlineStyle: 'none' } as any]}
          placeholder={placeholder}
          placeholderTextColor={ModernColors.neutral[400]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={false}
          blurOnSubmit={true}
          selectionColor={ModernColors.primary[500]}
          accessibilityLabel="Campo de búsqueda de libros"
          accessibilityHint="Ingresa el título del libro o nombre del autor que quieres buscar"
          accessibilityRole="search"
        />
        
        {/* Clear button */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            style={styles.clearButton}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Search button */}
        <TouchableOpacity
          onPress={handleSearch}
          style={styles.searchButtonContainer}
          disabled={loading || !value.trim()}
          accessibilityLabel="Buscar libros"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading || !value.trim() }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={loading || !value.trim() 
              ? [ModernColors.neutral[300], ModernColors.neutral[400]]
              : ModernColors.gradients.primary
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchButton}
          >
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color="white"
                accessibilityLabel="Buscando..."
              />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.light.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ModernColors.neutral[200],
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainerFocused: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchContainerError: {
    borderColor: ModernColors.error[500],
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 18,
    color: ModernColors.neutral[400],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: ModernColors.neutral[800],
    paddingVertical: 12,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: ModernColors.neutral[100],
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 14,
    color: ModernColors.neutral[600],
    fontWeight: '600',
  },
  searchButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: ModernColors.error[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ModernColors.error[200],
  },
  errorText: {
    fontSize: 14,
    color: ModernColors.error[700],
    fontWeight: '500',
  },
});

export default SearchBarOptimized;