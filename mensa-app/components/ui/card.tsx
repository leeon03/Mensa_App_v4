import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

type Bewertung = {
  stars: number;
  gericht_name: string;
};

type CardProps = {
  name: string;
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  kategorie: string;
  bewertungen?: Bewertung[];
  tags?: string[];
  preis: number;
  isFavorite: boolean;
  isAlert: boolean;
  onFavoritePress: () => void;
  onAlertPress: () => void;
  onPress?: () => void;
};

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

const Card: React.FC<CardProps> = ({
  name,
  anzeigename,
  beschreibung,
  bild_url,
  kategorie,
  bewertungen = [],
  tags = [],
  preis,
  isFavorite,
  isAlert,
  onFavoritePress,
  onAlertPress,
  onPress,
}) => {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const playSound = async (file: any) => {
    const { sound } = await Audio.Sound.createAsync(file);
    await sound.playAsync();
  };

  const handleFavoritePress = async () => {
    triggerHaptic();
    await playSound(require('../../assets/sounds/heart.wav'));
    onFavoritePress();
  };

  const handleAlertPress = async () => {
    if (!isAlert) {
      triggerHaptic();
      await playSound(require('../../assets/sounds/glocke.wav'));
    }
    onAlertPress();
  };

  const filtered = bewertungen.filter((b) => b.gericht_name === name);
  const avg =
    filtered.length > 0
      ? filtered.reduce((sum, b) => sum + b.stars, 0) / filtered.length
      : 0;

  const renderStars = () => {
    const rounded = Math.round(avg);
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rounded ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const hasImage = bild_url && bild_url.trim() !== '';

  const CardContent = (
    <View
      style={[
        styles.card,
        { backgroundColor: themeColor.card, shadowColor: themeColor.text },
      ]}
    >
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image source={{ uri: bild_url }} style={styles.image} />
        ) : (
          <View style={[styles.fallbackIconContainer, { backgroundColor: themeColor.background }]}>
            <Ionicons name="fast-food-outline" size={48} color={themeColor.text} />
          </View>
        )}
        <View style={styles.iconContainer}>
          <Pressable onPress={handleFavoritePress} style={styles.iconButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#e74c3c' : '#FFF'}
            />
          </Pressable>
          <Pressable onPress={handleAlertPress} style={[styles.iconButton, { marginLeft: 8 }]}>
            <Ionicons
              name={isAlert ? 'notifications' : 'notifications-outline'}
              size={24}
              color={isAlert ? '#FFD700' : '#FFF'}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {kategorie ? (
          <Text style={[styles.category, { color: themeColor.icon }]}>
            {kategorie.toUpperCase()}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: themeColor.text }]}>{anzeigename}</Text>
        <Text style={[styles.description, { color: themeColor.text }]}>{beschreibung}</Text>

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag: string) => {
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

        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>{renderStars()}</View>
          <Text style={[styles.price, { color: themeColor.text }]}>
            {formatEuro(preis)}
          </Text>
        </View>
      </View>
    </View>
  );

  return onPress ? (
    <Pressable onPress={onPress}>{CardContent}</Pressable>
  ) : (
    CardContent
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  fallbackIconContainer: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 6,
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
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Card;
