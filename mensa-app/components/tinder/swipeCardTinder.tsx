import React from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface Gericht {
  id: number;
  name: string;
  beschreibung: string;
  tags: string[];
}

interface SwipeCardProps {
  gericht: Gericht;
  theme: 'light' | 'dark';
  panHandlers: any;
  style?: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ gericht, theme, panHandlers, style }) => {
  return (
    <Animated.View {...panHandlers} style={[styles.card, style, { backgroundColor: Colors[theme].card }]}>
      <Text style={[styles.title, { color: Colors[theme].text }]}>{gericht.name}</Text>
      <Text style={[styles.description, { color: Colors[theme].text }]}>{gericht.beschreibung}</Text>

      <View style={styles.imagePlaceholder}>
        <Text style={{ color: '#999' }}>Bild folgt</Text>
      </View>

      <View style={styles.tagRow}>
        {gericht.tags.map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Text style={styles.tagText}>
              {tag === 'vegan'
                ? '🌱 Vegan'
                : tag === 'vegetarisch'
                ? '🥦 Vegetarisch'
                : tag === 'scharf'
                ? '🌶️ Scharf'
                : tag}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default SwipeCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#ddd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },
});
