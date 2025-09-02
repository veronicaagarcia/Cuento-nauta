import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBookContext } from "@/contexts/BookContext";
import { ModernColors } from '@/constants/ModernColors';

type BookItemFixedProps = {
  title: string;
  author: string | undefined;
  coverUrl: string | undefined;
  bookKey: string;
  firstPublishYear?: number | undefined | string;
  editionCount?: number;
  description?: string;
  onPress: () => void;
  style?: object;
};

const BookItemFixed: React.FC<BookItemFixedProps> = ({ 
  title, 
  author, 
  coverUrl, 
  bookKey, 
  description, 
  onPress, 
  style
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { toggleFavorite, isFavorite } = useBookContext();

  const handleToggleFavorite = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    await toggleFavorite({ 
      key: bookKey, 
      title, 
      author_name: [author || ""],
      cover_i: coverUrl,
      description 
    });
  };

  const isBookFavorite = isFavorite(bookKey);

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.touchableContainer, style]}
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          isHovered && styles.containerHovered,
          isPressed && styles.containerPressed
        ]}
      >
        {/* Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={[styles.coverImage, imageLoaded && styles.imageLoaded]}
                resizeMode="cover"
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <LinearGradient
                colors={ModernColors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.placeholderImage}
              >
                <View style={styles.placeholderIcon}>
                  <Text style={styles.placeholderText}>LIBRO</Text>
                </View>
              </LinearGradient>
            )}
            
            {/* Shimmer overlay for loading */}
            {coverUrl && !imageLoaded && (
              <View style={styles.shimmerOverlay} />
            )}
          </View>
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isBookFavorite && styles.favoriteButtonActive
            ]}
            onPress={handleToggleFavorite}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isBookFavorite 
                ? ['#ff6b6b', '#ee5a5a'] 
                : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
              }
              style={styles.favoriteGradient}
            >
              <Text style={[
                styles.favoriteIcon,
                { color: isBookFavorite ? 'white' : ModernColors.neutral[600] }
              ]}>
                {isBookFavorite ? '♥' : '♡'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Tooltip */}
          {isHovered && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {isBookFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title || 'Título no disponible'}
          </Text>
          
          <Text style={styles.author} numberOfLines={1}>
            por {author || 'Autor desconocido'}
          </Text>
          
          <Text style={styles.description} numberOfLines={3}>
            {description && typeof description === 'string' && description.trim() && description !== "Descripción no disponible" 
              ? (description.length > 120 ? `${description.slice(0, 120)}...` : description)
              : `Explora esta obra de ${author || 'este autor'} y descubre nuevas perspectivas literarias.`}
          </Text>

        </View>

        {/* Accent line */}
        <LinearGradient
          colors={ModernColors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    backgroundColor: ModernColors.light.surface,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 160,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: ModernColors.neutral[200],
    position: 'relative',
    overflow: 'hidden',
  },
  containerHovered: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderColor: ModernColors.primary[300],
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
  },
  imageSection: {
    position: 'relative',
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coverImage: {
    width: 90,
    height: 130,
    borderRadius: 12,
    opacity: 0,
  },
  imageLoaded: {
    opacity: 1,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ModernColors.neutral[200],
    borderRadius: 12,
  },
  placeholderImage: {
    width: 90,
    height: 130,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ModernColors.neutral[300],
  },
  placeholderIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  favoriteGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tooltip: {
    position: 'absolute',
    top: 42,
    right: -8,
    backgroundColor: ModernColors.neutral[800],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    shadowColor: ModernColors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  tooltipText: {
    color: ModernColors.neutral[50],
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ModernColors.neutral[800],
    marginBottom: 6,
    lineHeight: 24,
  },
  author: {
    fontSize: 14,
    color: ModernColors.primary[600],
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: ModernColors.neutral[600],
    lineHeight: 18,
    marginBottom: 12,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

export default BookItemFixed;