import React from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Gericht {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  tags: string[];
}

interface SwipeCardProps {
  gericht: Gericht;
  theme: 'light' | 'dark';
  panHandlers: any;
  style?: any;
}

const TAGS: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  vegan: {
    label: 'Vegan',
    color: '#A5D6A7',
    icon: <MaterialCommunityIcons name="leaf" size={14} color="#000" />,
  },
  vegetarisch: {
    label: 'Vegetarisch',
    color: '#C5E1A5',
    icon: <MaterialCommunityIcons name="food-apple" size={14} color="#000" />,
  },
  leicht: {
    label: 'Leicht',
    color: '#FFF59D',
    icon: <Ionicons name="sunny" size={14} color="#000" />,
  },
  glutenfrei: {
    label: 'Glutenfrei',
    color: '#FFE082',
    icon: <Ionicons name="ban" size={14} color="#000" />,
  },
  scharf: {
    label: 'Scharf',
    color: '#EF9A9A',
    icon: <MaterialCommunityIcons name="chili-hot" size={14} color="#000" />,
  },
  fleischhaltig: {
    label: 'Fleischhaltig',
    color: '#E57373',
    icon: <MaterialCommunityIcons name="cow" size={14} color="#000" />,
  },
  fischhaltig: {
    label: 'Fischhaltig',
    color: '#81D4FA',
    icon: <MaterialCommunityIcons name="fish" size={14} color="#000" />,
  },
  beliebt: {
    label: 'Beliebt',
    color: '#F48FB1',
    icon: <Ionicons name="flame" size={14} color="#000" />,
  },
  favorit: {
    label: 'Favorit',
    color: '#F06292',
    icon: <Ionicons name="heart" size={14} color="#000" />,
  },
  erinnerung: {
    label: 'Erinnerung',
    color: '#B0BEC5',
    icon: <Ionicons name="notifications" size={14} color="#000" />,
  },
};

const SwipeCard: React.FC<SwipeCardProps> = ({ gericht, theme, panHandlers, style }) => {
  return (
    <Animated.View
      {...panHandlers}
      style={[styles.card, style, { backgroundColor: Colors[theme].card }]}
    >
      <Text style={[styles.title, { color: Colors[theme].text }]}>
        {gericht.anzeigename}
      </Text>

      <Text style={[styles.description, { color: Colors[theme].text }]}>
        {gericht.beschreibung}
      </Text>

      <View style={styles.imagePlaceholder}>
        <Text style={{ color: '#999' }}>Bild folgt</Text>
      </View>

      {gericht.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {gericht.tags.map((tag: string) => {
            const key = tag.toLowerCase();
            const tagData = TAGS[key];
            if (!tagData) return null;

            return (
              <View
                key={key}
                style={[styles.tag, { backgroundColor: tagData.color }]}
              >
                {tagData.icon}
                <Text style={styles.tagText}>{tagData.label}</Text>
              </View>
            );
          })}
        </View>
      )}
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 6,
  },
});
