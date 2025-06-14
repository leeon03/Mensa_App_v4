import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { supabase } from '../constants/supabase';

export default function GerichtDetailScreen() {
  const { name } = useLocalSearchParams();
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const router = useRouter();

  const [gericht, setGericht] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof name !== 'string') return;

    const loadGericht = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gerichte')
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        console.error('Fehler beim Laden des Gerichts:', error);
        setGericht(null);
      } else {
        setGericht(data);
      }

      setLoading(false);
    };

    loadGericht();
  }, [name]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: themeColor.background }]}>
        <ActivityIndicator size="large" color={themeColor.accent1} />
      </View>
    );
  }

  if (!gericht) {
    return (
      <View style={[styles.center, { backgroundColor: themeColor.background }]}>
        <Text style={{ color: themeColor.text }}>Gericht nicht gefunden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Image source={{ uri: gericht.bild_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={[styles.title, { color: themeColor.text }]}>{gericht.anzeigename}</Text>
        <Text style={[styles.kategorie, { color: themeColor.icon }]}>
          {gericht.kategorie?.toUpperCase() || ''}
        </Text>

        <Text style={[styles.beschreibung, { color: themeColor.text }]}>
          {gericht.beschreibung}
        </Text>

        <Text style={[styles.preis, { color: themeColor.text }]}>
          Preis: {parseFloat(gericht.preis).toFixed(2)} €
        </Text>

        {gericht.tags && gericht.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {gericht.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kategorie: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  beschreibung: {
    fontSize: 16,
    marginBottom: 16,
  },
  preis: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
});
