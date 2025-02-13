import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
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
};

const BookItem: React.FC<BookItemProps> = ({ title, author, coverUrl, bookKey, description, onPress, style}) => {
  const [isHovered, setIsHovered] = useState(false);
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
            style={[styles.image]}
          />
        ) : (
          <View style={[styles.image, styles.placeholder, { backgroundColor: placeholderColor }]}>
            <ThemedText darkColor={textColor} lightColor={textColor} type="default">Sin imagen</ThemedText>
          </View>
        )}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
                isHovered ? styles.favoriteButtonHovered : null,
            ]}
            onPress={handleToggleFavorite}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
              >
              <Text style={{ color: isFavorite(bookKey) ? `red` : `${secondText}` }}>
                {isFavorite(bookKey) ? '❤' : '♡'}
              </Text>
                {isHovered && (
              <Text style={[{color: `${secondText}`}, {position:'absolute'}, {top: 30}, {left:'70%'}, {backgroundColor:'black'}, {transform: [{ translateX: '-50%' }]}, {padding: 3}, {borderRadius: 4}, {fontSize: 8}, {textAlign: 'center'}]}>
                {isFavorite(bookKey) ? 'Borrar de favoritos' : 'Agregar a favoritos'}
              </Text>
            )}
            </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle" darkColor={secondText} lightColor={secondText}>{title?.slice(0, 30)}</ThemedText>
          <ThemedText type="default" darkColor={textColor} lightColor={textColor}>{author?.slice(0, 30) || 'Autor desconocido'}</ThemedText>
          <Text style={{marginTop: 8, fontStyle: 'italic'}}>
          {description && 
          <ThemedText type="default" darkColor={textColor} lightColor={textColor}>{description?.slice(0, 60)}...</ThemedText>
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
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
    maxWidth: 380,
    height: "auto",
  },
  imageContainer: {
    position: "relative",
    margin: 'auto',
  },
  image: {
    width: 140,
    height: 200,
    maxWidth: 140,
    minWidth: 140,
    maxHeight: 200,
    minHeight: 200,
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
    padding: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonHovered: {
    transform: [{ scale: 1.2 }],
  },
});

export default BookItem;
