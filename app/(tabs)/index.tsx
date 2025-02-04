import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import HomeSearchBook from '@/components/HomeSearchBook';

export default function HomeScreen() {

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#c890a7', dark: '#a35c7a' }}
      headerImage={<>
        <Animatable.Image
          animation="jello"
          iterationCount={5}
          duration={2000}
          direction="alternate"
          source={require('@/assets/images/Logobg.png')}
          style={styles.reactLogo}
        />
        <Text style={styles.titleContainer}>Descubre nuevas historias</Text>      
      </>}
    >
      <View style={styles.contentContainer}>
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
    height: 200,
    width: 200,
    borderRadius: 100,
    margin: 'auto',
  },
  titleContainer: {
    fontSize: 18,
    margin: 'auto',
    fontFamily: 'cursive',
    fontStyle: 'italic',
    color: '#212121',
    marginBottom: 12
  },
});