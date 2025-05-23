import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RatingStars from './RatingStars';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type Props = {
  user: string;
  text: string;
  stars: number;
  own?: boolean;
};

export default function ChatBubble({ user, text, stars, own = false }: Props) {
  const theme = useColorScheme() || 'light';

  const alignmentStyle = own ? styles.bubbleRight : styles.bubbleLeft;
  const bubbleColor = own ? Colors[theme].accent2 : Colors[theme].surface;
  const textColor = own ? Colors[theme].background : Colors[theme].text;
  const containerAlignment = own ? styles.rowRight : styles.rowLeft;

  return (
    <View style={[styles.row, containerAlignment]}>
      <View style={[styles.bubble, alignmentStyle, { backgroundColor: bubbleColor }]}>
        <Text style={[styles.user, { color: textColor }]}>
          {own ? 'Du' : `${user}`} sagt:
        </Text>
        <View style={styles.starsWrapper}>
          <RatingStars value={stars} editable={false} />
        </View>
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  rowLeft: {
    justifyContent: 'flex-start',
    marginRight: 30,
  },
  rowRight: {
    justifyContent: 'flex-end',
    marginLeft: 30,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleLeft: {
    borderTopLeftRadius: 4,
  },
  bubbleRight: {
    borderTopRightRadius: 4,
  },
  user: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 4,
  },
  starsWrapper: {
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
