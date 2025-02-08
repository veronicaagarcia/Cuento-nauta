import React from 'react';
import { StyleSheet, View, Text, useColorScheme } from 'react-native';
import * as Animatable from 'react-native-animatable';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import HomeSearchBook from '@/components/HomeSearchBook';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const headerColor = useThemeColor({}, 'tint');
  const colorScheme = useColorScheme();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: headerColor, dark: headerColor }}
      headerImage={
        <Animatable.Image
          animation="jello"
          iterationCount={5}
          duration={2000}
          direction="alternate"
          source={
            colorScheme === 'dark'
              ? require('@/assets/images/destacado.png') 
              : require('@/assets/images/destacado-light.png') 
          }
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.contentContainer}>
        <Text style={[{ color: headerColor }, styles.titleContainer]}>DESCUBRE NUEVAS HISTORIAS</Text>      
        <HomeSearchBook />
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
  },
  reactLogo: {
    height: 500,
    width: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: -125
  },
  titleContainer: {
    fontSize: 18,
    margin: 'auto',
    fontFamily: 'cursive',
    fontStyle: 'italic',
    marginBottom: 12
  },
});