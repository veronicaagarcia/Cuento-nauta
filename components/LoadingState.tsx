import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando...',
  size = 'large',
  fullScreen = false,
  overlay = false,
}) => {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  
  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && [styles.overlay, { backgroundColor: `${backgroundColor}E6` }],
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <ActivityIndicator 
          size={size} 
          color={primaryColor}
          accessibilityLabel={message}
        />
        {message && (
          <ThemedText style={styles.message}>
            {message}
          </ThemedText>
        )}
      </View>
    </View>
  );
};

// Skeleton loading component for lists
interface SkeletonItemProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  height = 20,
  width = '100%',
  borderRadius = 4,
}) => {
  const skeletonColor = useThemeColor(
    { light: '#F0F0F0', dark: '#2A2A2A' }, 
    'background'
  );
  
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius,
          backgroundColor: skeletonColor,
        },
      ]}
      accessibilityLabel="Cargando contenido"
    />
  );
};

// Book item skeleton for lists
export const BookItemSkeleton: React.FC = () => {
  return (
    <View style={styles.bookSkeleton}>
      <SkeletonItem width={80} height={120} borderRadius={8} />
      <View style={styles.bookSkeletonContent}>
        <SkeletonItem height={16} width="80%" borderRadius={4} />
        <SkeletonItem height={14} width="60%" borderRadius={4} />
        <SkeletonItem height={12} width="40%" borderRadius={4} />
      </View>
    </View>
  );
};

// List skeleton with multiple items
export const BookListSkeleton: React.FC<{ count?: number }> = ({ 
  count = 5 
}) => {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <BookItemSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  skeleton: {
    marginVertical: 4,
  },
  bookSkeleton: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  bookSkeletonContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  listSkeleton: {
    flex: 1,
  },
});

// Empty state component
interface EmptyStateProps {
  title?: string;
  message?: string;
  emoji?: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No hay resultados',
  message = 'No se encontraron libros con los criterios de búsqueda.',
  emoji = '📚',
  actionButton,
}) => {
  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText style={styles.emptyMessage}>{message}</ThemedText>
      {actionButton && (
        <View style={styles.emptyAction}>
          {actionButton}
        </View>
      )}
    </ThemedView>
  );
};

const emptyStyles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyAction: {
    marginTop: 16,
  },
});

// Merge styles
Object.assign(styles, emptyStyles);