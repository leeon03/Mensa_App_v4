import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RatingStars from './RatingStars';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = {
  user: string;
  text: string;
  stars: number;
};

export default function ChatBubble({ user, text, stars }: Props) {
  const theme = useColorScheme() || 'light';

  return (
    <View style={[styles.bubble, { backgroundColor: Colors[theme].surface }]}>
      <Text style={[styles.user, { color: Colors[theme].text }]}>{user} sagt:</Text>
      <RatingStars value={stars} editable={false} />
      <Text style={[styles.text, { color: Colors[theme].text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  user: {
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    marginTop: 4,
  },
});
