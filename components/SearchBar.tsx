import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedButton } from './ThemedButton';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onSearch}) => {
  const borderColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const buttonColor = useThemeColor({}, 'button');

  return (
    <View style={styles.container}>
      
      <TextInput
        style={[styles.searchBar, { backgroundColor, color: textColor, borderColor, borderWidth: 2}]}
        placeholder={'Buscar libro...'}
        placeholderTextColor={textColor}
        value={value}
        onChangeText={onChangeText}
        // onSubmitEditing={onSearch}
      />
      <ThemedButton 
      darkColor={buttonColor}
      lightColor={buttonColor}
      textDarkColor={backgroundColor}
      textLightColor={backgroundColor}
      title="Buscar" 
      onPress={() => onSearch()} 
      style={{position: 'absolute', right: 8, bottom: 7}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    marginTop: 24,
  },
  searchBar: {
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    position: 'relative'
  },
});

export default SearchBar;
