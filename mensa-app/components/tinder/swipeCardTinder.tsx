import React from 'react';
import {
  Animated,
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Gericht {
  id: number;
  name: string;
  anzeigename: string;
  beschreibung: string;
  tags: string[];
  bild_url: string;
}

interface SwipeCardProps {
  gericht: Gericht;
  theme: 'light' | 'dark';
  panHandlers: any;
  style?: any;
  onCardPress?: () => void;
}

const TAGS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
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

const SwipeCard: React.FC<SwipeCardProps> = ({ gericht, theme, panHandlers, style, onCardPress }) => {
  return (
    <Animated.View {...panHandlers} style={[styles.card, style]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: gericht.bild_url }} style={styles.image} />
        <View style={styles.overlay} />

        {/* Info-Button: öffnet nur bei Klick die Detailansicht */}
        <TouchableOpacity onPress={onCardPress} style={styles.infoButton}>
          <Ionicons name="information-circle" size={28} color={Colors[theme].accent3} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {gericht.anzeigename}
          </Text>

          {gericht.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {gericht.tags.map((tag: string) => {
                const key = tag.toLowerCase();
                const tagData = TAGS[key];
                if (!tagData) return null;

                return (
                  <View key={key} style={[styles.tag, { backgroundColor: tagData.color }]}>
                    {tagData.icon}
                    <Text style={styles.tagText}>{tagData.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default SwipeCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 450,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  infoButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
});
