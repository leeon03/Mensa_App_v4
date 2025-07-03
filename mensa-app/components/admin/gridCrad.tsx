import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  useColorScheme,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

type Gericht = {
  name: string;
  anzeigename: string;
  bild_url: string;
  preis: number;
  isFavorite: boolean;
};

type GridCardProps = {
  item: Gericht;
  onPress: (item: Gericht) => void;
  onFavoriteToggle: (name: string) => void;
};

const GridCard: React.FC<GridCardProps> = ({ item, onPress, onFavoriteToggle }) => {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];

  const formatEuro = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  const hasImage = item.bild_url && item.bild_url.trim() !== '';

  return (
    <Pressable style={styles.cardWrapper} onPress={() => onPress(item)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColor.card,
            shadowColor: themeColor.text,
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image source={{ uri: item.bild_url }} style={styles.image} />
          ) : (
            <View
              style={[
                styles.fallbackIconContainer,
                { backgroundColor: themeColor.background },
              ]}
            >
              <Ionicons name="fast-food-outline" size={32} color={themeColor.text} />
            </View>
          )}
          <Pressable
            onPress={() => onFavoriteToggle(item.name)}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={item.isFavorite ? '#e74c3c' : '#FFF'}
            />
          </Pressable>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: themeColor.text }]} numberOfLines={1}>
            {item.anzeigename}
          </Text>
          <Text style={[styles.price, { color: themeColor.text }]}>
            {formatEuro(item.preis)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

// 📦 Listendarstellung mit zwei Karten nebeneinander
type GridListProps = {
  daten: Gericht[];
  onGerichtPress: (item: Gericht) => void;
  onFavoriteToggle: (name: string) => void;
};

export const GridCardList: React.FC<GridListProps> = ({
  daten,
  onGerichtPress,
  onFavoriteToggle,
}) => {
  return (
    <FlatList
      data={daten}
      keyExtractor={(item) => item.name}
      numColumns={2}
      renderItem={({ item }) => (
        <GridCard
          item={item}
          onPress={onGerichtPress}
          onFavoriteToggle={onFavoriteToggle}
        />
      )}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
};

// 📐 Kartenbreite – angepasst für 2 Spalten + spacing (16px Abstand)
const SPACING = 16;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - SPACING * 3) / 2); // 2 Cards + 3x 8px Abstand

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING / 2,
    paddingTop: 8,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  fallbackIconContainer: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 20,
  },
  content: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default GridCard;
