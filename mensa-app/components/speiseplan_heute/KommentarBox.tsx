import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type Props = {
  onSubmit: (data: { text: string; stars: number }) => void;
  disabled?: boolean;
  buttonColor?: string; // <--- NEU
};

export default function KommentarBox({ onSubmit, disabled, buttonColor }: Props) {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const highlight = buttonColor || themeColor.accent2;

  const [text, setText] = useState('');
  const [stars, setStars] = useState(0);

  const handlePress = () => {
    if (text.trim() && stars > 0) {
      onSubmit({ text: text.trim(), stars });
      setText('');
      setStars(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => !disabled && setStars(i + 1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={i < stars ? 'star' : 'star-outline'}
              size={24}
              color={highlight}
              style={{ marginRight: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: themeColor.border,
            color: themeColor.text,
          },
        ]}
        placeholder="Was möchtest du sagen?"
        placeholderTextColor={themeColor.icon}
        multiline
        editable={!disabled}
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: highlight,
            opacity: disabled || stars === 0 || text.trim() === '' ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled || stars === 0 || text.trim() === ''}
      >
        <Text style={styles.submitText}>Absenden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 12,
  },
  submitButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
