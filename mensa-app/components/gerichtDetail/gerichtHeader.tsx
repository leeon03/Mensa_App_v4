// components/gerichtDetail/GerichtHeader.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Bewertung {
  stars: number;
  gericht_name: string;
}

interface GerichtHeaderProps {
  bild_url: string;
  anzeigename: string;
  kategorie?: string;
  beschreibung: string;
  textColor: string;
  bewertungen?: Bewertung[];
  name: string;
  tags?: string[];
  preis?: number;
  paypalLink?: string;
}

const TAGS = [
  { key: 'vegan', label: 'Vegan', icon: <MaterialCommunityIcons name="leaf" size={14} color="#000" />, color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: <MaterialCommunityIcons name="food-apple" size={14} color="#000" />, color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', icon: <Ionicons name="sunny" size={14} color="#000" />, color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: <Ionicons name="ban" size={14} color="#000" />, color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', icon: <MaterialCommunityIcons name="chili-hot" size={14} color="#000" />, color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: <MaterialCommunityIcons name="cow" size={14} color="#000" />, color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: <MaterialCommunityIcons name="fish" size={14} color="#000" />, color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', icon: <Ionicons name="flame" size={14} color="#000" />, color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', icon: <Ionicons name="heart" size={14} color="#000" />, color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', icon: <Ionicons name="notifications" size={14} color="#000" />, color: '#B0BEC5' },
];

const fallbackImage = 'https://via.placeholder.com/400x200?text=Kein+Bild';

const GerichtHeader: React.FC<GerichtHeaderProps> = ({
  bild_url,
  anzeigename,
  kategorie,
  beschreibung,
  textColor,
  bewertungen = [],
  name,
  tags,
  preis,
  paypalLink,
}) => {
  const filtered = bewertungen.filter(b => b.gericht_name === name);
  const avg =
    filtered.length > 0
      ? filtered.reduce((sum, b) => sum + b.stars, 0) / filtered.length
      : 0;
  const rounded = Math.round(avg);

  const renderStars = () => (
    <View style={[styles.ratingRow]}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < rounded ? 'star' : 'star-outline'}
          size={18}
          color="#FFD700"
          style={{ marginRight: 2 }}
        />
      ))}
      {filtered.length > 0 && (
        <Text style={[styles.ratingText, { color: textColor }]}>
          {avg.toFixed(1)} / 5 ({filtered.length})
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: bild_url || fallbackImage }}
        style={styles.image}
      />
      <View style={styles.card}>
        <Text style={[styles.title, { color: textColor }]}>{anzeigename}</Text>

        {kategorie && (
          <View style={styles.kategorieBadge}>
            <Text style={[styles.kategorieText, { color: textColor }]}>
              {kategorie.toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[styles.beschreibung, { color: textColor }]}>
          {beschreibung}
        </Text>

        {renderStars()}

       {Array.isArray(tags) && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map(tag => {
              const tagData = TAGS.find(t => t.key === tag);
              if (!tagData) return null;
              return (
                <View
                  key={tag}
                  style={[styles.tagChip, { backgroundColor: tagData.color }]}
                >
                  {tagData.icon}
                  <Text style={styles.chipText}>{tagData.label}</Text>
                </View>
              );
            })}
          </View>
        )}

        {preis !== undefined && (
          <Text style={[styles.preis, { color: textColor }]}>
            Preis: {preis.toFixed(2)} €
          </Text>
        )}

        {paypalLink && (
          <TouchableOpacity
            style={styles.paypalButton}
            onPress={() => Linking.openURL(paypalLink)}
          >
            <Ionicons
              name="logo-paypal"
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.paypalButtonText}>Mit PayPal bezahlen</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  kategorieBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kategorieText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  beschreibung: {
    fontSize: 15,
    lineHeight: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 6,
  },
  preis: {
    fontSize: 15,
    fontWeight: '600',
  },
  paypalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#0070BA',
    alignSelf: 'flex-start',
  },
  paypalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default GerichtHeader;
