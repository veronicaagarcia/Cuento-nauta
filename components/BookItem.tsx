import React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedButton } from './ThemedButton';
import { useBookContext } from "@/contexts/BookContext";

type BookItemProps = {
  title: string;
  author: string | undefined;
  coverUrl: string | undefined;
  bookKey: string;
  firstPublishYear?: number | undefined | string ;
  editionCount?: number;
  description?: string;
  onPress: () => void;
  style?: object; 
  imageStyle?: object;
};

const BookItem: React.FC<BookItemProps> = ({ title, author, coverUrl, bookKey, firstPublishYear, editionCount, description, onPress, style, imageStyle}) => {
  const backgroundColor = useThemeColor({}, 'content');
  const placeholderColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const secondText = useThemeColor({}, 'tint');

  const { toggleFavorite, isFavorite } = useBookContext()

  const handleToggleFavorite = async (event: GestureResponderEvent) => {
    event.stopPropagation()
    await toggleFavorite({ key: bookKey, title, author_name: [author || ""] })
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView darkColor={backgroundColor} lightColor={backgroundColor} style={[styles.ViewShadow, style]}>
      <View style={styles.imageContainer}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={[styles.image, imageStyle]}
          />
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: placeholderColor }]}>
            <ThemedText darkColor={textColor} lightColor={textColor} type="default">Sin imagen</ThemedText>
          </View>
        )}
          <ThemedButton
            style={styles.favoriteButton}
            lightColor={isFavorite(bookKey) ? "red" : "transparent"}
            darkColor={isFavorite(bookKey) ? "red" : "transparent"}
            textLightColor={secondText}
            textDarkColor={secondText}
            onPress={handleToggleFavorite} 
            title={isFavorite(bookKey) ? "❤" : "♡"}>
          </ThemedButton>
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle" darkColor={secondText} lightColor={secondText}>{title}</ThemedText>
          <ThemedText type="default" darkColor={textColor} lightColor={textColor}>{author || 'Autor desconocido'}</ThemedText>
          <Text>
          {
          firstPublishYear 
          && <ThemedText type="default" darkColor={textColor} lightColor={textColor} style={{textDecorationLine:'underline', fontSize: 13}}>Publicado en: {firstPublishYear}</ThemedText>
          }
          </Text>
          <Text>
          {
          editionCount 
          && <ThemedText type="default" darkColor={textColor} lightColor={textColor} style={{fontSize: 12}}>Ediciones: {editionCount}</ThemedText>
          }
          </Text>
          <Text>
          {description && 
          <ThemedText type="default" darkColor={textColor} lightColor={textColor}>{description.slice(0, 90)}...</ThemedText>
          }
          </Text>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ViewShadow: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    margin: 'auto',
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 8,
    margin: 'auto',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    padding: 10
  },
  favoriteButton: {
    position: "absolute",
    top: 4,
    right: 12,
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookItem;
