import React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

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

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView darkColor={backgroundColor} lightColor={backgroundColor} style={[styles.ViewShadow, style]}>
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
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default BookItem;
