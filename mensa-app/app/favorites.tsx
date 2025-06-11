import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../components/speiseplan_heute/favoritesContext';
import { supabase } from '../constants/supabase';
import Card from '../components/ui/card'; // Deine Card-Komponente
import Legende from '../components/speiseplan_heute/legende';

export default function FavoritesScreen() {
  return (
    <SafeAreaProvider>
      <FavoritesInner />
    </SafeAreaProvider>
  );
}

function FavoritesInner() {
  const theme = useColorScheme() || 'light';
  const themeColor = Colors[theme];
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const [gerichte, setGerichte] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoritesFromDB = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setGerichte([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('gerichte (id, name, anzeigename, beschreibung, tags, preis, bild_url, kategorie)')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Fehler beim Laden der Favoriten:', error);
        setGerichte([]);
        setLoading(false);
        return;
      }

      const gefiltert = data.map((f) => f.gerichte).filter((g) => g !== null);
      setGerichte(gefiltert);
      setLoading(false);
    };

    loadFavoritesFromDB();
  }, [favorites]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColor.background }]}>
      <Text style={styles.title}>Deine Favoriten</Text>
      <Legende />

      {loading ? (
        <ActivityIndicator size="large" color={themeColor.accent1} />
      ) : gerichte.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: themeColor.text }}>
          Du hast noch keine Favoriten gespeichert.
        </Text>
      ) : (
        <ScrollView>
          {gerichte.map((gericht) => (
            <Card
              key={gericht.id}
              name={gericht.name}
              anzeigename={gericht.anzeigename}
              beschreibung={gericht.beschreibung}
              bild_url={gericht.bild_url}
              kategorie={gericht.kategorie || ''}
              bewertungen={[]} // Optional: Bewertungen kannst du später ergänzen
              tags={gericht.tags || []}
              preis={parseFloat(gericht.preis)}
              isFavorite={isFavorite(gericht.name)}
              isAlert={false} // Optional: Alert-Feature kannst du später hinzufügen
              onFavoritePress={() => toggleFavorite(gericht.id, gericht.name)}
              onAlertPress={() => {}} // Noch nicht aktiv
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    color: 'red',
  },
});
