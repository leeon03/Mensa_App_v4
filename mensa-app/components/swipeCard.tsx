import React from 'react';
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Image,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface Gericht {
  id: number;
  name: string;
  beschreibung: string;
  bild_url: string;
  tags: string[];
}

interface SwipeCardProps {
  gericht: Gericht;
  theme: 'light' | 'dark';
  panHandlers: any;
  style?: any;
  onLike?: () => void;
  onDislike?: () => void;
}

const tagColors: Record<string, string> = {
  vegetarisch: '#8BC34A',
  vegan: '#4CAF50',
  fleischhaltig: '#B71C1C',
  scharf: '#F44336',
  fischhaltig: '#03A9F4',
  glutenfrei: '#FF9800',
  leicht: '#AED581',
  beliebt: '#FF4081',
};

const SwipeCard: React.FC<SwipeCardProps> = ({
  gericht,
  theme,
  panHandlers,
  style,
  onLike,
  onDislike,
}) => {
  const themeColor = Colors[theme];

  return (
    <Animated.View
      {...panHandlers}
      style={[
        styles.card,
        style,
        { backgroundColor: themeColor.card, shadowColor: themeColor.text },
      ]}
    >
      <Image source={{ uri: gericht.bild_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColor.text }]}>
          {gericht.name}
        </Text>
        <Text style={[styles.description, { color: themeColor.text }]}>
          {gericht.beschreibung}
        </Text>

        <View style={styles.tagRow}>
          {gericht.tags.map((tag, index) => {
            const color = tagColors[tag.toLowerCase()] || '#ccc';
            return (
              <Text key={index} style={[styles.tagChip, { backgroundColor: color }]}>
                {tag}
              </Text>
            );
          })}
        </View>

        <View style={styles.iconRow}>
          <Pressable onPress={onDislike} style={styles.iconButton}>
            <Ionicons name="close" size={32} color="#e74c3c" />
          </Pressable>
          <Pressable onPress={onLike} style={styles.iconButton}>
            <Ionicons name="heart" size={32} color="#2ecc71" />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export default SwipeCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    elevation: 6,
    marginVertical: 16,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tagChip: {
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    overflow: 'hidden',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: 12,
  },
  iconButton: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 50,
    elevation: 2,
  },
});
