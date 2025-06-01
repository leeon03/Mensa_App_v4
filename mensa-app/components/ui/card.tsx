import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CardProps = {
  name: string;
  anzeigename: string;
  beschreibung: string;
  bild_url: string;
  kategorie: string;
  bewertung: number;
  tags?: string[];
  preis: number;
  isFavorite: boolean;
  isAlert: boolean;
  onFavoritePress: () => void;
  onAlertPress: () => void;
};

const Card: React.FC<CardProps> = ({
  name,
  anzeigename,
  beschreibung,
  bild_url,
  kategorie,
  bewertung,
  tags = [],
  preis,
  isFavorite,
  isAlert,
  onFavoritePress,
  onAlertPress,
}) => {
  // Farbzuordnung für bekannte Tags
  const tagColors: Record<string, string> = {
    vegan: '#4caf50',
    vegetarisch: '#8bc34a',
    beliebt: '#ff9800',
    neu: '#2196f3',
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < bewertung ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: bild_url }} style={styles.image} />
        <View style={styles.iconContainer}>
          <Pressable onPress={onFavoritePress} style={styles.iconButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#e74c3c' : '#FFF'}
            />
          </Pressable>
          <Pressable onPress={onAlertPress} style={[styles.iconButton, { marginLeft: 8 }]}>
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
          <Text style={styles.category}>{kategorie.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.title}>{anzeigename}</Text>
        <Text style={styles.description}>{beschreibung}</Text>

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag: string) => {
              const color = tagColors[tag.toLowerCase()] || '#ccc';
              return (
                <Text key={tag} style={[styles.tag, { backgroundColor: color }]}>
                  {tag}
                </Text>
              );
            })}
          </View>
        )}

        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>{renderStars()}</View>
          <Text style={styles.price}>{preis.toFixed(2).replace('.', ',')} €</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
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
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    color: '#fff',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
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
    color: '#000',
  },
});

export default Card;
