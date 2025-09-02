import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

const { width, height } = Dimensions.get('window');

interface ModernHeroSectionProps {
  onScrollToBooks?: () => void;
}

export const ModernHeroSection: React.FC<ModernHeroSectionProps> = ({
  onScrollToBooks
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.heroContainer}>
      {/* Background with gradient overlay */}
      <View style={styles.backgroundContainer}>
        <View
          style={[
            styles.gradientOverlay,
            {
              backgroundColor: `${backgroundColor}CC`,
            },
          ]}
        />
      </View>

      {/* Hero content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          style={styles.logoContainer}
        >
          <Text style={[styles.logoEmoji, { color: primaryColor }]}>📚</Text>
        </Animatable.View>

        <ThemedText style={[styles.mainTitle, { color: textColor }]}>
          Cuento Nauta
        </ThemedText>
        
        <ThemedText style={[styles.subtitle, { color: `${textColor}AA` }]}>
          Descubre tu próxima gran aventura literaria
        </ThemedText>

        <Animatable.View
          animation="fadeInUp"
          delay={500}
          style={styles.featuresContainer}
        >
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: primaryColor }]}>🔍</Text>
            <ThemedText style={[styles.featureText, { color: `${textColor}CC` }]}>
              Busca entre miles de títulos
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: primaryColor }]}>📖</Text>
            <ThemedText style={[styles.featureText, { color: `${textColor}CC` }]}>
              Lee gratis online
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: primaryColor }]}>❤️</Text>
            <ThemedText style={[styles.featureText, { color: `${textColor}CC` }]}>
              Guarda tus favoritos
            </ThemedText>
          </View>
        </Animatable.View>

        <Animatable.Text
          animation="bounce"
          delay={1000}
          style={[styles.scrollIndicator, { color: primaryColor }]}
        >
          ↓ Explora libros destacados ↓
        </Animatable.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    height: height * 0.6, // 60% of screen height
    width: width,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
    opacity: 0.9,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',
    letterSpacing: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
    maxWidth: width * 0.9,
  },
  featureItem: {
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    minWidth: width * 0.25,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollIndicator: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
});

export default ModernHeroSection;