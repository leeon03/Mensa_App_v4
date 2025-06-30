import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  useColorScheme,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

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
  { key: 'vegan', label: 'Vegan', icon: 'leaf', color: '#A5D6A7' },
  { key: 'vegetarisch', label: 'Vegetarisch', icon: 'food-apple', color: '#C5E1A5' },
  { key: 'leicht', label: 'Leicht', icon: 'sunny', color: '#FFF59D' },
  { key: 'glutenfrei', label: 'Glutenfrei', icon: 'ban', color: '#FFE082' },
  { key: 'scharf', label: 'Scharf', icon: 'chili-hot', color: '#EF9A9A' },
  { key: 'fleischhaltig', label: 'Fleischhaltig', icon: 'cow', color: '#E57373' },
  { key: 'fischhaltig', label: 'Fischhaltig', icon: 'fish', color: '#81D4FA' },
  { key: 'beliebt', label: 'Beliebt', icon: 'flame', color: '#F48FB1' },
  { key: 'favorit', label: 'Favorit', icon: 'heart', color: '#F06292' },
  { key: 'erinnerung', label: 'Erinnerung', icon: 'notifications', color: '#B0BEC5' },
];

const fallbackImage = 'https://via.placeholder.com/400x200?text=Kein+Bild';

const getPastellBackground = (hex: string, theme: string) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = theme === 'dark' ? -20 : 40;
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `rgb(${R},${G},${B})`;
};

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
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const filtered = bewertungen.filter(b => b.gericht_name === name);
  const avg =
    filtered.length > 0
      ? filtered.reduce((sum, b) => sum + b.stars, 0) / filtered.length
      : 0;
  const rounded = Math.round(avg);

  const renderStars = () => (
    <View style={styles.ratingRow}>
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
      <View style={[styles.card, { backgroundColor: themeColor.card }]}>
        <Text style={[styles.title, { color: textColor }]}>{anzeigename}</Text>

        {kategorie && (
          <View style={[styles.kategorieBadge, { backgroundColor: themeColor.surface }]}>
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

              const IconComponent = ['sunny', 'ban', 'flame', 'heart', 'notifications'].includes(tagData.icon)
                ? Ionicons
                : MaterialCommunityIcons;

              return (
                <View
                  key={tag}
                  style={[styles.tagChip, {
                    backgroundColor: getPastellBackground(tagData.color, theme),
                  }]}
                >
                  <IconComponent name={tagData.icon as any} size={14} color={themeColor.text} />
                  <Text style={[styles.chipText, { color: themeColor.text }]}>{tagData.label}</Text>
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
            style={[styles.paypalButton, { backgroundColor: themeColor.accent2 }]}
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
    alignSelf: 'flex-start',
  },
  paypalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default GerichtHeader;
